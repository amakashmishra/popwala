const crypto = require("crypto");
const AppError = require("../../utils/appError");
const { signAccessToken, hashToken } = require("../../utils/jwt");
const { sendEmail } = require("../../services/email.service");
const adminRepository = require("../../repositories/admin.repository");
const env = require("../../config/env");
const roles = require("../../constants/roles");

const RESET_PASSWORD_TTL_MS = 15 * 60 * 1000;

const sanitizeAdmin = (admin) => {
  if (!admin) return null;
  return {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    status: admin.status,
    createdAt: admin.createdAt,
    updatedAt: admin.updatedAt,
  };
};

const signAdminAccessToken = (admin) =>
  signAccessToken({
    sub: admin._id.toString(),
    email: admin.email,
    role: roles.ADMIN,
    actorType: "admin",
  });

const login = async ({ email, identifier, password }) => {
  const rawEmail = (email || identifier || "").trim().toLowerCase();
  if (!rawEmail) {
    throw new AppError("Email is required", 400, "VALIDATION_ERROR");
  }

  const normalizedEmail = rawEmail;
  const admin = await adminRepository.findByEmail(normalizedEmail, true);

  if (!admin) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

  const isValid = await admin.comparePassword(password);
  if (!isValid) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");

  if (admin.status !== "active") {
    throw new AppError("Admin account is not active", 403, "ACCOUNT_INACTIVE");
  }

  const accessToken = signAdminAccessToken(admin);
  return { accessToken, admin: sanitizeAdmin(admin) };
};

const forgotPassword = async ({ email }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const admin = await adminRepository.findByEmail(normalizedEmail, false, true);

  if (!admin) return {};

  const resetToken = crypto.randomBytes(32).toString("hex");
  admin.resetPasswordTokenHash = hashToken(resetToken);
  admin.resetPasswordExpiresAt = new Date(Date.now() + RESET_PASSWORD_TTL_MS);
  await admin.save();

  await sendEmail({
    to: admin.email,
    subject: "Admin password reset - Pop Wala",
    text: `Use this reset token: ${resetToken}. It expires in 15 minutes.`,
    html: `<p>Use this reset token: <b>${resetToken}</b>. It expires in 15 minutes.</p>`,
  });

  if (env.NODE_ENV !== "production") {
    return { resetToken, resetPasswordExpiresAt: admin.resetPasswordExpiresAt };
  }

  return {};
};

const resetPassword = async ({ token, newPassword }) => {
  const admin = await adminRepository.findByResetTokenHash(hashToken(token));
  if (!admin) throw new AppError("Invalid or expired reset token", 400, "INVALID_RESET_TOKEN");

  admin.password = newPassword;
  admin.resetPasswordTokenHash = null;
  admin.resetPasswordExpiresAt = null;
  await admin.save();

  return sanitizeAdmin(admin);
};

const getProfile = async (adminId) => {
  const admin = await adminRepository.findById(adminId);
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");
  return sanitizeAdmin(admin);
};

const changePassword = async ({ adminId, currentPassword, newPassword }) => {
  const admin = await adminRepository.findById(adminId, true);
  if (!admin) throw new AppError("Admin not found", 404, "ADMIN_NOT_FOUND");

  const matches = await admin.comparePassword(currentPassword);
  if (!matches) throw new AppError("Current password is incorrect", 400, "INVALID_CREDENTIALS");

  admin.password = newPassword;
  await admin.save();

  return sanitizeAdmin(admin);
};

module.exports = {
  sanitizeAdmin,
  login,
  forgotPassword,
  resetPassword,
  getProfile,
  changePassword,
};
