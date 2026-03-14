const Architect = require("../models/architect.model");

const buildFilters = ({ search, status } = {}) => {
  const filters = { deletedAt: null };

  if (status) {
    filters.status = status;
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    filters.$or = [
      { name: regex },
      { email: regex },
      { phoneNumber: regex },
      { companyName: regex },
      { address: regex },
    ];
  }

  return filters;
};

const create = (payload) => Architect.create(payload);
const findById = (id) => Architect.findOne({ _id: id, deletedAt: null });
const findByEmail = (email) => Architect.findOne({ email, deletedAt: null });
const findByPhoneNumber = (phoneNumber) => Architect.findOne({ phoneNumber, deletedAt: null });
const findByEmailWithPassword = (email) =>
  Architect.findOne({ email, deletedAt: null }).select("+password");
const findByPhoneNumberWithPassword = (phoneNumber) =>
  Architect.findOne({ phoneNumber, deletedAt: null }).select("+password");

const findAll = ({ search, status, skip = 0, limit = 20 } = {}) =>
  Architect.find(buildFilters({ search, status })).sort({ createdAt: -1 }).skip(skip).limit(limit);

const countAll = ({ search, status } = {}) =>
  Architect.countDocuments(buildFilters({ search, status }));

const updateById = (id, payload) =>
  Architect.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });

const softDeleteById = (id) =>
  Architect.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

const hardDeleteById = (id) => Architect.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findByEmail,
  findByPhoneNumber,
  findByEmailWithPassword,
  findByPhoneNumberWithPassword,
  findAll,
  countAll,
  updateById,
  softDeleteById,
  hardDeleteById,
};
