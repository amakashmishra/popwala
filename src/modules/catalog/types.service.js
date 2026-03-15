const AppError = require("../../utils/appError");
const typeRepository = require("../../repositories/type.repository");

const sanitizeType = (type) => ({
  id: type._id,
  name: type.name,
  description: type.description,
  status: type.status,
  createdAt: type.createdAt,
  updatedAt: type.updatedAt,
});

const listTypes = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [types, total] = await Promise.all([
    typeRepository.findAll({ search, status, skip, limit: safeLimit }),
    typeRepository.countAll({ search, status }),
  ]);

  return {
    items: types.map(sanitizeType),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createType = async ({ payload }) => {
  const type = await typeRepository.create({
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    status: payload.status || "active",
  });
  return sanitizeType(type);
};

const getTypeById = async (id) => {
  const type = await typeRepository.findById(id);
  if (!type) {
    throw new AppError("Product type not found", 404, "TYPE_NOT_FOUND");
  }
  return sanitizeType(type);
};

const updateType = async ({ id, payload }) => {
  const existing = await typeRepository.findById(id);
  if (!existing) {
    throw new AppError("Product type not found", 404, "TYPE_NOT_FOUND");
  }

  const patch = {};
  if (payload.name) {
    patch.name = payload.name.trim();
  }
  if (payload.description !== undefined) {
    patch.description = payload.description?.trim() || "";
  }
  if (payload.status) {
    patch.status = payload.status;
  }

  if (Object.keys(patch).length === 0) {
    throw new AppError("No fields provided to update", 400, "VALIDATION_ERROR");
  }

  const updated = await typeRepository.updateById(id, patch);
  return sanitizeType(updated);
};

const updateTypeStatus = async ({ id, status }) => {
  const updated = await typeRepository.updateById(id, { status });
  if (!updated) {
    throw new AppError("Product type not found", 404, "TYPE_NOT_FOUND");
  }
  return sanitizeType(updated);
};

const deleteType = async (id) => {
  const type = await typeRepository.softDeleteById(id);
  if (!type) {
    throw new AppError("Product type not found", 404, "TYPE_NOT_FOUND");
  }
};

const listActiveTypes = async () => {
  const types = await typeRepository.findActive({ sort: { name: 1 }, limit: 100 });
  return types.map((type) => ({
    id: type._id,
    name: type.name,
    description: type.description,
  }));
};

module.exports = {
  listTypes,
  createType,
  getTypeById,
  updateType,
  updateTypeStatus,
  deleteType,
  listActiveTypes,
};
