const AppError = require("../utils/appError");
const roles = require("../constants/roles");
const userRepository = require("../repositories/user.repository");

const sanitizeUser = (user) => {
  if (!user) return null;
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    mobile: user.mobile,
    profileImage: user.profileImage,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const getMyProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return sanitizeUser(user);
};

const updateMyProfile = async (userId, payload) => {
  const user = await userRepository.updateById(userId, payload);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");
  return sanitizeUser(user);
};

const listUsers = async () => {
  const users = await userRepository.findAll();
  return users.map(sanitizeUser);
};

const ensureRole = (role) => {
  if (!Object.values(roles).includes(role)) {
    throw new AppError("Invalid role", 400, "VALIDATION_ERROR");
  }
};

module.exports = {
  sanitizeUser,
  getMyProfile,
  updateMyProfile,
  listUsers,
  ensureRole,
};
