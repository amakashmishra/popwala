const AppError = require("../../utils/appError");
const roles = require("../../constants/roles");
const contractorRepository = require("../../repositories/contractor.repository");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");

const normalizeIdentifier = (identifier = "") => identifier.trim().toLowerCase();
const normalizePhone = (value = "") => value.replace(/\D/g, "");
const isEmail = (value = "") => value.includes("@");

const sanitizeContractor = (contractor) => {
  if (!contractor) return null;
  return {
    id: contractor._id,
    name: contractor.name,
    email: contractor.email,
    phoneNumber: contractor.phoneNumber,
    companyName: contractor.companyName,
    address: contractor.address,
    status: contractor.status,
    role: roles.CONTRACTOR,
    createdAt: contractor.createdAt,
    updatedAt: contractor.updatedAt,
  };
};

const login = async (payload) => {
  const identifier = normalizeIdentifier(payload.identifier || payload.email || "");
  const password = payload.password || "";
  if (!identifier || !password) {
    throw new AppError("Identifier and password are required", 400, "VALIDATION_ERROR");
  }

  const contractor = isEmail(identifier)
    ? await contractorRepository.findByEmailWithPassword(identifier)
    : await contractorRepository.findByPhoneNumberWithPassword(normalizePhone(identifier));

  if (!contractor || !contractor.password) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  const isValid = await contractor.comparePassword(password);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
  }

  if (contractor.status !== "active") {
    throw new AppError("Contractor account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const tokenPayload = {
    sub: contractor._id.toString(),
    role: roles.CONTRACTOR,
    email: contractor.email,
  };

  return {
    user: sanitizeContractor(contractor),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
};

const getProfile = async (contractorId) => {
  const contractor = await contractorRepository.findById(contractorId);
  if (!contractor) throw new AppError("Contractor not found", 404, "CONTRACTOR_NOT_FOUND");
  return sanitizeContractor(contractor);
};

const refresh = async (refreshToken) => {
  if (!refreshToken) throw new AppError("Refresh token missing", 401, "UNAUTHORIZED");

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  if (decoded.role !== roles.CONTRACTOR) {
    throw new AppError("Invalid refresh token", 401, "UNAUTHORIZED");
  }

  const contractor = await contractorRepository.findById(decoded.sub);
  if (!contractor || contractor.status !== "active") {
    throw new AppError("Contractor not found or inactive", 401, "UNAUTHORIZED");
  }

  const tokenPayload = {
    sub: contractor._id.toString(),
    role: roles.CONTRACTOR,
    email: contractor.email,
  };

  return {
    user: sanitizeContractor(contractor),
    accessToken: signAccessToken(tokenPayload),
    refreshToken: signRefreshToken(tokenPayload),
  };
};

module.exports = {
  login,
  refresh,
  getProfile,
};
