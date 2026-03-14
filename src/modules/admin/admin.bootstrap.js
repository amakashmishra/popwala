const env = require("../../config/env");
const logger = require("../../config/logger");
const roles = require("../../constants/roles");
const adminRepository = require("../../repositories/admin.repository");

const ensureDefaultAdmin = async () => {
  const existingAdminCount = await adminRepository.countActiveAdmins();
  if (existingAdminCount > 0) {
    return;
  }

  await adminRepository.create({
    name: env.ADMIN_NAME || "PopWala Admin",
    email: env.ADMIN_EMAIL.trim().toLowerCase(),
    password: env.ADMIN_PASSWORD,
    role: roles.ADMIN,
    status: "active",
  });

  logger.info("Default admin account created from environment configuration");
};

module.exports = {
  ensureDefaultAdmin,
};
