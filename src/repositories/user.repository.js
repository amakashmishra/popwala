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

const buildAdminFilters = ({ search, role, status } = {}) => {
  const filters = { deletedAt: null };

  if (role) {
    filters.role = role;
  }

  if (status) {
    filters.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search.trim(), "i");
    filters.$or = [{ name: searchRegex }, { email: searchRegex }, { mobile: searchRegex }];
  }

  return filters;
};

const findAllWithFilters = ({ search, role, status, skip = 0, limit = 20 } = {}) => {
  const filters = buildAdminFilters({ search, role, status });
  return User.find(filters).sort({ createdAt: -1 }).skip(skip).limit(limit);
};

const countAllWithFilters = ({ search, role, status } = {}) => {
  const filters = buildAdminFilters({ search, role, status });
  return User.countDocuments(filters);
};

module.exports = {
  create,
  findByEmail,
  findByMobile,
  findByIdentifier,
  findById,
  findByResetTokenHash,
  updateById,
  findAll,
  findAllWithFilters,
  countAllWithFilters,
};
