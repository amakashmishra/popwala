const AppError = require("../../utils/appError");
const roles = require("../../constants/roles");
const architectRepository = require("../../repositories/architect.repository");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");

const normalizeIdentifier = (identifier = "") => identifier.trim().toLowerCase();
const normalizePhone = (value = "") => value.replace(/\D/g, "");
const isEmail = (value = "") => value.includes("@");

const sanitizeArchitect = (architect) => {
  if (!architect) return null;
  return {
    id: architect._id,
    name: architect.name,
    email: architect.email,
    phoneNumber: architect.phoneNumber,
    companyName: architect.companyName,
    address: architect.address,
    status: architect.status,
    role: roles.ARCHITECT,
    createdAt: architect.createdAt,
    updatedAt: architect.updatedAt,
  };
};

const login = async (payload) => {
  const identifier = normalizeIdentifier(payload.identifier || payload.email || "");
  const password = payload.password || "";
  if (!identifier || !password) {
    throw new AppError("Identifier and password are required", 400, "VALIDATION_ERROR");
  }

  const architect = isEmail(identifier)
    ? await architectRepository.findByEmailWithPassword(identifier)
    : await architectRepository.findByPhoneNumberWithPassword(normalizePhone(identifier));

  if (!architect || !architect.password) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const isValid = await architect.comparePassword(password);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (architect.status !== "active") {
    throw new AppError("Architect account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const tokenPayload = {
    sub: architect._id.toString(),
    role: roles.ARCHITECT,
    email: architect.email,
  };

  return {
    user: sanitizeArchitect(architect),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
};

const getProfile = async (architectId) => {
  const architect = await architectRepository.findById(architectId);
  if (!architect) throw new AppError("Architect not found", 404, "ARCHITECT_NOT_FOUND");
  return sanitizeArchitect(architect);
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError("Refresh token missing", 401, "UNAUTHORIZED");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  if (decoded.role !== roles.ARCHITECT) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  const architect = await architectRepository.findById(decoded.sub);
  if (!architect || architect.status !== "active") {
    throw new AppError("Architect not found or inactive", 401, "UNAUTHORIZED");
  }

  const tokenPayload = {
    sub: architect._id.toString(),
    role: roles.ARCHITECT,
    email: architect.email,
  };

  return {
    user: sanitizeArchitect(architect),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
};

module.exports = {
  login,
  refresh,
  getProfile,
};
