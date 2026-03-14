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

const sanitizeUserForAdminList = (user) => {
  const base = sanitizeUser(user);
  if (!base) return null;

  return {
    ...base,
    city: user.city || null,
    enquiries: Number.isFinite(user.enquiriesCount) ? user.enquiriesCount : 0,
    orders: Number.isFinite(user.ordersCount) ? user.ordersCount : 0,
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

const listUsers = async ({
  search = "",
  role,
  status,
  page = 1,
  limit = 20,
} = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [users, total] = await Promise.all([
    userRepository.findAllWithFilters({ search, role, status, skip, limit: safeLimit }),
    userRepository.countAllWithFilters({ search, role, status }),
  ]);

  return {
    users: users.map(sanitizeUserForAdminList),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const updateUserStatus = async ({ userId, status, actorId }) => {
  if (!["active", "blocked", "inactive"].includes(status)) {
    throw new AppError("Invalid status", 400, "VALIDATION_ERROR");
  }

  const user = await userRepository.findById(userId);
  if (!user) throw new AppError("User not found", 404, "USER_NOT_FOUND");

  if (actorId && user._id.toString() === actorId.toString()) {
    throw new AppError("You cannot update your own status", 400, "VALIDATION_ERROR");
  }

  const updatedUser = await userRepository.updateById(userId, { status });
  return sanitizeUser(updatedUser);
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
  updateUserStatus,
  ensureRole,
};
