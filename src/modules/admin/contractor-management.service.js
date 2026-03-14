const AppError = require("../../utils/appError");
const env = require("../../config/env");
const logger = require("../../config/logger");
const contractorRepository = require("../../repositories/contractor.repository");
const { sendEmail } = require("../../services/email.service");

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
    createdAt: contractor.createdAt,
    updatedAt: contractor.updatedAt,
  };
};

const normalizeMobile = (value = "") => value.replace(/\D/g, "");

const resolveContractorLoginUrl = () => {
  const baseUrl = (env.FRONTEND_URL || "http://localhost:8080").trim().replace(/\/+$/, "");
  return `${baseUrl}/contractor/login`;
};

const sendContractorCredentialsEmail = async ({ email, password, name }) => {
  const loginUrl = resolveContractorLoginUrl();
  await sendEmail({
    to: email,
    subject: "Your Pop Wala Contractor Login Credentials",
    text: `Hello ${name},

Your contractor account has been created.

Email: ${email}
Password: ${password}
Login URL: ${loginUrl}
`,
    html: `<p>Hello ${name},</p>
<p>Your contractor account has been created.</p>
<p><b>Email:</b> ${email}</p>
<p><b>Password:</b> ${password}</p>
<p><b>Login URL:</b> <a href="${loginUrl}">${loginUrl}</a></p>`,
  });
};

const listContractors = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [contractors, total] = await Promise.all([
    contractorRepository.findAll({ search, status, skip, limit: safeLimit }),
    contractorRepository.countAll({ search, status }),
  ]);

  return {
    contractors: contractors.map(sanitizeContractor),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createContractor = async (payload) => {
  const normalizedEmail = payload.email.trim().toLowerCase();
  const normalizedPhone = payload.phoneNumber.trim();
  const normalizedMobile = normalizeMobile(normalizedPhone);
  if (normalizedMobile.length < 8 || normalizedMobile.length > 20) {
    throw new AppError("Invalid phone number format", 400, "VALIDATION_ERROR");
  }

  const [existingEmail, existingPhone] = await Promise.all([
    contractorRepository.findByEmail(normalizedEmail),
    contractorRepository.findByPhoneNumber(normalizedPhone),
  ]);

  if (existingEmail) throw new AppError("Contractor email already exists", 409, "EMAIL_EXISTS");
  if (existingPhone) throw new AppError("Contractor phone already exists", 409, "PHONE_EXISTS");

  const contractorPayload = {
    name: payload.name,
    email: normalizedEmail,
    phoneNumber: normalizedPhone,
    password: payload.password,
    companyName: payload.companyName,
    address: payload.address,
    status: payload.status,
  };

  let contractor;
  try {
    contractor = await contractorRepository.create(contractorPayload);
  } catch (error) {
    if (error?.code === 11000) {
      const key = Object.keys(error.keyPattern || {})[0] || "";
      if (key === "email") throw new AppError("Contractor email already exists", 409, "EMAIL_EXISTS");
      if (key === "phoneNumber") throw new AppError("Contractor phone already exists", 409, "PHONE_EXISTS");
    }
    throw error;
  }

  try {
    await sendContractorCredentialsEmail({
      email: normalizedEmail,
      password: payload.password,
      name: payload.name,
    });
  } catch (error) {
    await contractorRepository.hardDeleteById(contractor._id);
    logger.error("Failed to send contractor credential email", {
      email: normalizedEmail,
      contractorId: contractor._id?.toString(),
      error: error.message,
    });
    throw new AppError(
      "Contractor credential email could not be sent. Please verify SMTP configuration and try again.",
      500,
      "EMAIL_SEND_FAILED"
    );
  }

  return sanitizeContractor(contractor);
};

const getContractorById = async (id) => {
  const contractor = await contractorRepository.findById(id);
  if (!contractor) throw new AppError("Contractor not found", 404, "CONTRACTOR_NOT_FOUND");
  return sanitizeContractor(contractor);
};

const updateContractor = async (id, payload) => {
  const contractor = await contractorRepository.findById(id);
  if (!contractor) throw new AppError("Contractor not found", 404, "CONTRACTOR_NOT_FOUND");

  const normalizedEmail = payload.email ? payload.email.trim().toLowerCase() : contractor.email;
  const normalizedPhone = payload.phoneNumber ? payload.phoneNumber.trim() : contractor.phoneNumber;
  const normalizedMobile = normalizeMobile(normalizedPhone);
  if (normalizedMobile.length < 8 || normalizedMobile.length > 20) {
    throw new AppError("Invalid phone number format", 400, "VALIDATION_ERROR");
  }

  if (payload.email && payload.email.trim().toLowerCase() !== contractor.email) {
    const existingEmail = await contractorRepository.findByEmail(normalizedEmail);
    if (existingEmail) throw new AppError("Contractor email already exists", 409, "EMAIL_EXISTS");
  }

  if (payload.phoneNumber && payload.phoneNumber.trim() !== contractor.phoneNumber) {
    const existingPhone = await contractorRepository.findByPhoneNumber(normalizedPhone);
    if (existingPhone) throw new AppError("Contractor phone already exists", 409, "PHONE_EXISTS");
  }

  const contractorPatch = {
    ...payload,
    ...(payload.email ? { email: normalizedEmail } : {}),
    ...(payload.phoneNumber ? { phoneNumber: normalizedPhone } : {}),
  };
  delete contractorPatch.password;

  const updated = await contractorRepository.updateById(id, contractorPatch);

  return sanitizeContractor(updated);
};

const deleteContractor = async (id) => {
  const deleted = await contractorRepository.softDeleteById(id);
  if (!deleted) throw new AppError("Contractor not found", 404, "CONTRACTOR_NOT_FOUND");
};

module.exports = {
  listContractors,
  createContractor,
  getContractorById,
  updateContractor,
  deleteContractor,
};
