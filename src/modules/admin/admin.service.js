const userService = require("../../services/user.service");

const listUsers = (query = {}) => {
  return userService.listUsers(query);
};

const updateUserStatus = ({ userId, status, actorId }) => {
  return userService.updateUserStatus({ userId, status, actorId });
};

module.exports = {
  listUsers,
  updateUserStatus,
};
