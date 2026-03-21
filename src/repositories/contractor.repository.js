const Contractor = require("../models/contractor.model");

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

const buildDateFilter = (start, end) => {
  const filter = {};
  if (start) filter.$gte = start;
  if (end) filter.$lte = end;
  return Object.keys(filter).length ? filter : null;
};

const create = (payload) => Contractor.create(payload);

const findById = (id) => Contractor.findOne({ _id: id, deletedAt: null });

const findByEmail = (email) => Contractor.findOne({ email, deletedAt: null });

const findByPhoneNumber = (phoneNumber) => Contractor.findOne({ phoneNumber, deletedAt: null });

const findByEmailWithPassword = (email) =>
  Contractor.findOne({ email, deletedAt: null }).select("+password");

const findByPhoneNumberWithPassword = (phoneNumber) =>
  Contractor.findOne({ phoneNumber, deletedAt: null }).select("+password");

const findAll = ({ search, status, skip = 0, limit = 20 } = {}) =>
  Contractor.find(buildFilters({ search, status })).sort({ createdAt: -1 }).skip(skip).limit(limit);

const countAll = ({ search, status } = {}) =>
  Contractor.countDocuments(buildFilters({ search, status }));

const countCreatedBetween = (start, end) => {
  const filters = { deletedAt: null };
  const dateFilter = buildDateFilter(start, end);
  if (dateFilter) {
    filters.createdAt = dateFilter;
  }
  return Contractor.countDocuments(filters);
};

const updateById = (id, payload) =>
  Contractor.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });

const softDeleteById = (id) =>
  Contractor.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });
const hardDeleteById = (id) => Contractor.findByIdAndDelete(id);

module.exports = {
  create,
  findById,
  findByEmail,
  findByPhoneNumber,
  findByEmailWithPassword,
  findByPhoneNumberWithPassword,
  findAll,
  countAll,
  countCreatedBetween,
  updateById,
  softDeleteById,
  hardDeleteById,
};
