const createCatalogRepository = (Model, searchFields = ["name", "description"]) => {
  const buildFilters = ({ search, status } = {}) => {
    const filters = { deletedAt: null };
    if (status) {
      filters.status = status;
    }
    if (search) {
      const regex = new RegExp(search.trim(), "i");
      filters.$or = searchFields.map((field) => ({ [field]: regex }));
    }
    return filters;
  };

  const create = (payload) => Model.create(payload);
  const findById = (id) => Model.findOne({ _id: id, deletedAt: null });
  const findAll = ({ search, status, skip = 0, limit = 20 } = {}) =>
    Model.find(buildFilters({ search, status })).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const countAll = ({ search, status } = {}) => Model.countDocuments(buildFilters({ search, status }));
  const findActive = ({ limit = 100, sort = { name: 1 } } = {}) =>
    Model.find({ deletedAt: null, status: "active" }).sort(sort).limit(limit);
  const updateById = (id, payload) =>
    Model.findOneAndUpdate({ _id: id, deletedAt: null }, payload, {
      new: true,
      runValidators: true,
    });
  const softDeleteById = (id) =>
    Model.findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true });

  return {
    create,
    findById,
    findAll,
    countAll,
    findActive,
    updateById,
    softDeleteById,
  };
};

module.exports = createCatalogRepository;
