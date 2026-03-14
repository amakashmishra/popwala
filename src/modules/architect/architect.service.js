const roles = require("../../constants/roles");
const authService = require("../../services/auth.service");
const userService = require("../../services/user.service");

const login = (payload, req) => {
  return authService.login(payload, authService.getClientMeta(req), {
    allowedRoles: [roles.ARCHITECT],
  });
};

const getProfile = (userId) => {
  return userService.getMyProfile(userId);
};

module.exports = {
  login,
  getProfile,
};
