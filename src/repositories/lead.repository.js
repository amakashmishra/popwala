const Lead = require("../models/lead.model");

const buildDateFilter = (start, end) => {
  const filter = {};
  if (start) filter.$gte = start;
  if (end) filter.$lte = end;
  return Object.keys(filter).length ? filter : null;
};

const findRecent = ({ limit = 5 } = {}) =>
  Lead.find({ deletedAt: null }).sort({ createdAt: -1 }).limit(limit);

const countAll = () => Lead.countDocuments({ deletedAt: null });

const countCreatedBetween = (start, end) => {
  const filters = { deletedAt: null };
  const dateFilter = buildDateFilter(start, end);
  if (dateFilter) {
    filters.createdAt = dateFilter;
  }
  return Lead.countDocuments(filters);
};

const countByStages = (stages = [], start, end) => {
  const match = { deletedAt: null };
  if (stages.length) {
    match.stage = { $in: stages };
  }
  const dateFilter = buildDateFilter(start, end);
  if (dateFilter) {
    match.createdAt = dateFilter;
  }
  return Lead.countDocuments(match);
};

const sumBudgetsByStages = (stages = [], start, end) => {
  const match = { deletedAt: null };
  if (stages.length) {
    match.stage = { $in: stages };
  }
  const dateFilter = buildDateFilter(start, end);
  if (dateFilter) {
    match.createdAt = dateFilter;
  }
  return Lead.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalBudget: { $sum: "$budget" },
      },
    },
  ]).then((result) => {
    if (result.length === 0) {
      return 0;
    }
    return result[0].totalBudget || 0;
  });
};

const create = (payload) => Lead.create(payload);

module.exports = {
  findRecent,
  countAll,
  countCreatedBetween,
  countByStages,
  sumBudgetsByStages,
  create,
};
