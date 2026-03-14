const AppError = require("../utils/appError");
const logger = require("../config/logger");
const crypto = require("crypto");
const userRepository = require("../repositories/user.repository");
const sessionRepository = require("../repositories/session.repository");
const roles = require("../constants/roles");
const { sendEmail } = require("./email.service");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
} = require("../utils/jwt");
const { sanitizeUser } = require("./user.service");

const OTP_TTL_MS = 10 * 60 * 1000;
const RESET_PASSWORD_TTL_MS = 15 * 60 * 1000;

const getClientMeta = (req) => ({
  userAgent: req.headers["user-agent"] || "",
  ip: req.ip || req.connection?.remoteAddress || "",
});

const normalizeMobile = (value = "") => value.replace(/\D/g, "");
const isEmail = (value = "") => value.includes("@");

const normalizeIdentifier = (identifier = "") => {
  const trimmed = identifier.trim();
  if (isEmail(trimmed)) return trimmed.toLowerCase();
  return normalizeMobile(trimmed);
};

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

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendOtpEmail = async (user, otp) => {
  await sendEmail({
    to: user.email,
    subject: "Verify your email - Pop Wala",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your OTP is <b>${otp}</b>.</p><p>It expires in 10 minutes.</p>`,
  });
};

const issueAndStoreEmailOtp = async (user) => {
  const otp = generateOtp();
  user.emailOtpCodeHash = hashToken(otp);
  user.emailOtpExpiresAt = new Date(Date.now() + OTP_TTL_MS);
  await user.save();
  await sendOtpEmail(user, otp);
  return otp;
};

const register = async ({ name, email, mobile, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedMobile = normalizeMobile(mobile);

  const [existingEmail, existingMobile] = await Promise.all([
    userRepository.findByEmail(normalizedEmail),
    userRepository.findByMobile(normalizedMobile),
  ]);

  if (existingEmail) throw new AppError("Email already registered", 409, "EMAIL_EXISTS");
  if (existingMobile) throw new AppError("Mobile number already registered", 409, "MOBILE_EXISTS");

  const user = await userRepository.create({
    name,
    email: normalizedEmail,
    mobile: normalizedMobile,
    password,
    role: roles.USER,
    isEmailVerified: false,
  });

  const otp = await issueAndStoreEmailOtp(user);
  await sendEmail({
    to: user.email,
    subject: "Welcome to Pop Wala",
    text: `Welcome ${user.name}. Your account was created successfully. Verify with OTP ${otp}.`,
    html: `<p>Welcome ${user.name}, your account was created successfully.</p><p>Verify using OTP <b>${otp}</b>.</p>`,
  });

  logger.info("User registered", { userId: user._id, email: user.email, mobile: user.mobile });
  return { user: sanitizeUser(user), otp };
};

const verifyEmailOtp = async ({ email, otp }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail, false, true);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  if (!user.emailOtpCodeHash || !user.emailOtpExpiresAt || user.emailOtpExpiresAt < new Date()) {
    throw new AppError("OTP expired. Please request a new OTP", 400, "OTP_EXPIRED");
  }

  if (hashToken(otp) !== user.emailOtpCodeHash) {
    throw new AppError("Invalid OTP", 400, "INVALID_OTP");
  }

  user.isEmailVerified = true;
  user.emailOtpCodeHash = null;
  user.emailOtpExpiresAt = null;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Email verified - Pop Wala",
    text: `Hi ${user.name}, your email has been verified successfully.`,
    html: `<p>Hi ${user.name}, your email has been verified successfully.</p>`,
  });

  return sanitizeUser(user);
};

const resendEmailOtp = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await userRepository.findByEmail(normalizedEmail, false, true);
  if (!user) {
    return {};
  }

  if (user.isEmailVerified) {
    return { alreadyVerified: true };
  }

  const otp = await issueAndStoreEmailOtp(user);
  logger.info("Verification OTP resent", { userId: user._id, email: user.email });
  return { otp };
};

const login = async ({ identifier, password }, meta, options = {}) => {
  const allowedRoles = options.allowedRoles || null;
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const user = await userRepository.findByIdentifier(normalizedIdentifier, true, true);
  if (!user || !user.password) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  const isValid = await user.comparePassword(password);
  if (!isValid) throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (user.status !== "active") {
    throw new AppError("User account is not active", 403, "ACCOUNT_INACTIVE");
  }

  if (!user.isEmailVerified) {
    throw new AppError("Email is not verified. Please verify OTP first", 403, "EMAIL_NOT_VERIFIED");
  }

  const tokens = await createSessionAndTokens(user, meta);

  await sendEmail({
    to: user.email,
    subject: "Login alert - Pop Wala",
    text: `A login happened on your account from IP ${meta.ip}.`,
    html: `<p>A login happened on your account from IP <b>${meta.ip}</b>.</p>`,
  });

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

const forgotPassword = async (identifier) => {
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const user = await userRepository.findByIdentifier(normalizedIdentifier, false, true);
  if (!user) {
    return {};
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenHash = hashToken(resetToken);
  const resetPasswordExpiresAt = new Date(Date.now() + RESET_PASSWORD_TTL_MS);

  user.resetPasswordTokenHash = resetTokenHash;
  user.resetPasswordExpiresAt = resetPasswordExpiresAt;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Reset your password - Pop Wala",
    text: `Use this reset token: ${resetToken}. It expires in 15 minutes.`,
    html: `<p>Use this reset token: <b>${resetToken}</b>.</p><p>It expires in 15 minutes.</p>`,
  });

  logger.info("Reset password token generated", { userId: user._id, email: user.email });

  return {
    resetToken,
    resetPasswordExpiresAt,
  };
};

const resetPassword = async (token, newPassword) => {
  const tokenHash = hashToken(token);
  const user = await userRepository.findByResetTokenHash(tokenHash);

  if (!user) {
    throw new AppError("Invalid or expired reset token", 400, "INVALID_RESET_TOKEN");
  }

  user.password = newPassword;
  user.resetPasswordTokenHash = null;
  user.resetPasswordExpiresAt = null;
  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Password changed - Pop Wala",
    text: "Your password was changed successfully.",
    html: "<p>Your password was changed successfully.</p>",
  });

  logger.info("Password reset success", { userId: user._id, email: user.email });
  return sanitizeUser(user);
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  issueTokensForOAuthUser,
  forgotPassword,
  resetPassword,
  verifyEmailOtp,
  resendEmailOtp,
  getClientMeta,
};
