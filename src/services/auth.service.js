const AppError = require("../utils/appError");
const logger = require("../config/logger");
const userRepository = require("../repositories/user.repository");
const sessionRepository = require("../repositories/session.repository");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/jwt");
const { sanitizeUser } = require("./user.service");

const getClientMeta = (req) => ({
  userAgent: req.headers["user-agent"] || "",
  ip: req.ip || req.connection?.remoteAddress || "",
});

const buildTokenPayload = (user) => ({
  sub: user._id.toString(),
  role: user.role,
  email: user.email,
});

const createSessionAndTokens = async (user, meta) => {
  const payload = buildTokenPayload(user);
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const decoded = verifyRefreshToken(refreshToken);

  await sessionRepository.create({
    user: user._id,
    refreshTokenHash: hashToken(refreshToken),
    userAgent: meta.userAgent,
    ip: meta.ip,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return { accessToken, refreshToken };
};

const register = async ({ name, email, password }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) throw new AppError("Email already registered", 409, "EMAIL_EXISTS");

  const user = await userRepository.create({
    name,
    email,
    password,
    role: "user",
  });

  logger.info("User registered", { userId: user._id, email: user.email });
  return sanitizeUser(user);
};

const login = async ({ email, password }, meta) => {
  const user = await userRepository.findByEmail(email, true);
  if (!user || !user.password) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

  if (user.status !== "active") {
    throw new AppError("User account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const tokens = await createSessionAndTokens(user, meta);
  logger.info("User login success", { userId: user._id, email: user.email, ip: meta.ip });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

const refresh = async (refreshToken, meta) => {
  if (!refreshToken) throw new AppError("Refresh token missing", 401, "UNAUTHORIZED");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  const tokenHash = hashToken(refreshToken);
  const session = await sessionRepository.findActiveByHash(tokenHash);

  if (!session || !session.user) {
    throw new AppError("Refresh session not found", 401, "UNAUTHORIZED");
  }

  if (session.expiresAt < new Date()) {
    await sessionRepository.revokeByHash(tokenHash);
    throw new AppError("Refresh token expired", 401, "UNAUTHORIZED");
  }

  if (session.user._id.toString() !== decoded.sub) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  await sessionRepository.revokeByHash(tokenHash);
  const tokens = await createSessionAndTokens(session.user, meta);

  logger.info("Access token refreshed", { userId: session.user._id, ip: meta.ip });

  return {
    user: sanitizeUser(session.user),
    ...tokens,
  };
};

const logout = async (refreshToken) => {
  if (!refreshToken) return;
  await sessionRepository.revokeByHash(hashToken(refreshToken));
};

const issueTokensForOAuthUser = async (user, meta) => {
  const tokens = await createSessionAndTokens(user, meta);
  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  issueTokensForOAuthUser,
  getClientMeta,
};
