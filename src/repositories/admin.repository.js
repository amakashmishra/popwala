const Admin = require("../models/admin.model");

const create = (payload) => Admin.create(payload);

const findByEmail = (email, includePassword = false, includeSecurityFields = false) => {
  const query = Admin.findOne({ email, deletedAt: null });
  const projections = [];
  if (includePassword) projections.push("+password");
  if (includeSecurityFields) projections.push("+resetPasswordTokenHash +resetPasswordExpiresAt");
  return projections.length ? query.select(projections.join(" ")) : query;
};

const findById = (id, includePassword = false, includeSecurityFields = false) => {
  const query = Admin.findOne({ _id: id, deletedAt: null });
  const projections = [];
  if (includePassword) projections.push("+password");
  if (includeSecurityFields) projections.push("+resetPasswordTokenHash +resetPasswordExpiresAt");
  return projections.length ? query.select(projections.join(" ")) : query;
};

const findByResetTokenHash = (tokenHash) =>
  Admin.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
    deletedAt: null,
  }).select("+password +resetPasswordTokenHash +resetPasswordExpiresAt");

const updateById = (id, payload) =>
  Admin.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });

const countActiveAdmins = () => Admin.countDocuments({ deletedAt: null });

module.exports = {
  create,
  findByEmail,
  findById,
  findByResetTokenHash,
  updateById,
  countActiveAdmins,
};
