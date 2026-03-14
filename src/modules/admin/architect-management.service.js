const AppError = require("../../utils/appError");
const env = require("../../config/env");
const logger = require("../../config/logger");
const architectRepository = require("../../repositories/architect.repository");
const { sendEmail } = require("../../services/email.service");

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
    createdAt: architect.createdAt,
    updatedAt: architect.updatedAt,
  };
};

const normalizeMobile = (value = "") => value.replace(/\D/g, "");

const resolveArchitectLoginUrl = () => {
  const baseUrl = (env.FRONTEND_URL || "http://localhost:8080").trim().replace(/\/+$/, "");
  return `${baseUrl}/architect/login`;
};

const sendArchitectCredentialsEmail = async ({ email, password, name }) => {
  const loginUrl = resolveArchitectLoginUrl();
  await sendEmail({
    to: email,
    subject: "Your Pop Wala Architect Login Credentials",
    text: `Hello ${name},

Your architect account has been created.

Email: ${email}
Password: ${password}
Login URL: ${loginUrl}
`,
    html: `<p>Hello ${name},</p>
<p>Your architect account has been created.</p>
<p><b>Email:</b> ${email}</p>
<p><b>Password:</b> ${password}</p>
<p><b>Login URL:</b> <a href="${loginUrl}">${loginUrl}</a></p>`,
  });
};

const listArchitects = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [architects, total] = await Promise.all([
    architectRepository.findAll({ search, status, skip, limit: safeLimit }),
    architectRepository.countAll({ search, status }),
  ]);

  return {
    architects: architects.map(sanitizeArchitect),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createArchitect = async (payload) => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedPhone = payload.phoneNumber.trim();
  const normalizedMobile = normalizeMobile(normalizedPhone);
  if (normalizedMobile.length < 8 || normalizedMobile.length > 20) {
    throw new AppError("Invalid phone number format", 400, "VALIDATION_ERROR");
  }

  const [existingEmail, existingPhone] = await Promise.all([
    architectRepository.findByEmail(normalizedEmail),
    architectRepository.findByPhoneNumber(normalizedPhone),
  ]);

  if (existingEmail) throw new AppError("Architect email already exists", 409, "EMAIL_EXISTS");
  if (existingPhone) throw new AppError("Architect phone already exists", 409, "PHONE_EXISTS");

  const architectPayload = {
    name: payload.name,
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    password: payload.password,
    companyName: payload.companyName,
    address: payload.address,
    status: payload.status,
  };

  let architect;
  try {
    architect = await architectRepository.create(architectPayload);
  } catch (error) {
    if (error?.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || "";
      if (key === "email") throw new AppError("Architect email already exists", 409, "EMAIL_EXISTS");
      if (key === "phoneNumber") throw new AppError("Architect phone already exists", 409, "PHONE_EXISTS");
    }
    throw error;
  }

  try {
    await sendArchitectCredentialsEmail({
      email: normalizedEmail,
      password: payload.password,
      name: payload.name,
    });
  } catch (error) {
    await architectRepository.hardDeleteById(architect._id);
    logger.error("Failed to send architect credential email", {
      email: normalizedEmail,
      architectId: architect._id?.toString(),
      error: error.message,
    });
    throw new AppError(
      "Architect credential email could not be sent. Please verify SMTP configuration and try again.",
      500,
      "EMAIL_SEND_FAILED"
    );
  }

  return sanitizeArchitect(architect);
};

const getArchitectById = async (id) => {
  const architect = await architectRepository.findById(id);
  if (!architect) throw new AppError("Architect not found", 404, "ARCHITECT_NOT_FOUND");
  return sanitizeArchitect(architect);
};

const updateArchitect = async (id, payload) => {
  const architect = await architectRepository.findById(id);
  if (!architect) throw new AppError("Architect not found", 404, "ARCHITECT_NOT_FOUND");

  const normalizedEmail = payload.email ? payload.email.trim().toLowerCase() : architect.email;
  const normalizedPhone = payload.phoneNumber ? payload.phoneNumber.trim() : architect.phoneNumber;
  const normalizedMobile = normalizeMobile(normalizedPhone);
  if (normalizedMobile.length < 8 || normalizedMobile.length > 20) {
    throw new AppError("Invalid phone number format", 400, "VALIDATION_ERROR");
  }

  if (payload.email && payload.email.trim().toLowerCase() !== architect.email) {
    const existingEmail = await architectRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new AppError("Architect email already exists", 409, "EMAIL_EXISTS");
  }

  if (payload.phoneNumber && payload.phoneNumber.trim() !== architect.phoneNumber) {
    const existingPhone = await architectRepository.findByPhoneNumber(normalizedPhone);
    if (existingPhone) throw new AppError("Architect phone already exists", 409, "PHONE_EXISTS");
  }

  const architectPatch = {
    ...payload,
    ...(payload.email ? { email: normalizedEmail } : {}),
    ...(payload.phoneNumber ? { phoneNumber: normalizedPhone } : {}),
  };
  delete architectPatch.password;

  const updated = await architectRepository.updateById(id, architectPatch);
  return sanitizeArchitect(updated);
};

const deleteArchitect = async (id) => {
  const deleted = await architectRepository.softDeleteById(id);
  if (!deleted) throw new AppError("Architect not found", 404, "ARCHITECT_NOT_FOUND");
};

module.exports = {
  listArchitects,
  createArchitect,
  getArchitectById,
  updateArchitect,
  deleteArchitect,
};
