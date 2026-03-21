const Banner = require("../models/banner.model");

const buildFilters = ({ search, status } = {}) => {
  const filters = { deletedAt: null };

  if (status) {
    filters.status = status;
  }

  if (search) {
    const regex = new RegExp(search.trim(), "i");
    filters.$or = [
      { "title.en": regex },
      { "title.hi": regex },
      { "title.mr": regex },
      { "description.en": regex },
      { "description.hi": regex },
      { "description.mr": regex },
    ];
  }

  return filters;
};

const create = (payload) => Banner.create(payload);

const findById = (id) => Banner.findOne({ _id: id, deletedAt: null });

const findAll = ({ search, status, skip = 0, limit = 20 } = {}) =>
  Banner.find(buildFilters({ search, status })).sort({ createdAt: -1 }).skip(skip).limit(limit);

const countAll = ({ search, status } = {}) =>
  Banner.countDocuments(buildFilters({ search, status }));

const buildDateFilter = (start, end) => {
  const filter = {};
  if (start) filter.$gte = start;
  if (end) filter.$lte = end;
  return Object.keys(filter).length ? filter : null;
};

const countCreatedBetween = (start, end) => {
  const filters = { deletedAt: null };
  const dateFilter = buildDateFilter(start, end);
  if (dateFilter) {
    filters.createdAt = dateFilter;
  }
  return Banner.countDocuments(filters);
};

const findActive = ({ limit = 10 } = {}) =>
  Banner.find({ deletedAt: null, status: "active" }).sort({ createdAt: -1 }).limit(limit);

const updateById = (id, payload) =>
  Banner.findOneAndUpdate({ _id: id, deletedAt: null }, payload, { new: true, runValidators: true });

const softDeleteById = (id) =>
  Banner.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

module.exports = {
  create,
  findById,
  findAll,
  countAll,
  findActive,
  updateById,
  softDeleteById,
  countCreatedBetween,
};
