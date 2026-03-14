const userService = require("../../services/user.service");

const getProfile = (userId) => {
  return userService.getMyProfile(userId);
};

const updateProfile = (userId, payload) => {
  return userService.updateMyProfile(userId, payload);
};

module.exports = {
  getProfile,
  updateProfile,
};
