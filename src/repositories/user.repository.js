const User = require("../models/user.model");

const buildSecuritySelect = (includePassword, includeSecurityFields) => {
  const projection = [];
  if (includePassword) projection.push("+password");
  if (includeSecurityFields) {
    projection.push("+resetPasswordTokenHash");
    projection.push("+resetPasswordExpiresAt");
    projection.push("+emailOtpCodeHash");
    projection.push("+emailOtpExpiresAt");
  }
  return projection.join(" ");
};

const create = (payload) => User.create(payload);

const findByEmail = (email, includePassword = false, includeSecurityFields = false) => {
  const query = User.findOne({ email, deletedAt: null });
  const projection = buildSecuritySelect(includePassword, includeSecurityFields);
  return projection ? query.select(projection) : query;
};

const findByMobile = (mobile, includePassword = false, includeSecurityFields = false) => {
  const query = User.findOne({ mobile, deletedAt: null });
  const projection = buildSecuritySelect(includePassword, includeSecurityFields);
  return projection ? query.select(projection) : query;
};

const findByIdentifier = (identifier, includePassword = false, includeSecurityFields = false) => {
  const query = User.findOne({
    deletedAt: null,
    $or: [{ email: identifier }, { mobile: identifier }],
  });
  const projection = buildSecuritySelect(includePassword, includeSecurityFields);
  return projection ? query.select(projection) : query;
};

const findById = (id) => User.findOne({ _id: id, deletedAt: null });

const findByResetTokenHash = (tokenHash) =>
  User.findOne({
    resetPasswordTokenHash: tokenHash,
    resetPasswordExpiresAt: { $gt: new Date() },
    deletedAt: null,
  }).select("+resetPasswordTokenHash +resetPasswordExpiresAt");

const updateById = (id, payload) =>
  User.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });

const findAll = () => User.find({ deletedAt: null }).sort({ createdAt: -1 });

module.exports = {
  create,
  findByEmail,
  findByMobile,
  findByIdentifier,
  findById,
  findByResetTokenHash,
  updateById,
  findAll,
};
