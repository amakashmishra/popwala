const User = require("../models/user.model");

const create = (payload) => User.create(payload);

const findByEmail = (email, includePassword = false) => {
  const query = User.findOne({ email, deletedAt: null });
  return includePassword ? query.select("+password") : query;
};

const findById = (id) => User.findOne({ _id: id, deletedAt: null });

const updateById = (id, payload) =>
  User.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });

const findAll = () => User.find({ deletedAt: null }).sort({ createdAt: -1 });

module.exports = {
  create,
  findByEmail,
  findById,
  updateById,
  findAll,
};
