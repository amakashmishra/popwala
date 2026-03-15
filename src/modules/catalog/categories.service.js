const AppError = require("../../utils/appError");
const categoryRepository = require("../../repositories/category.repository");

const sanitizeCategory = (category) => ({
  id: category._id,
  name: category.name,
  description: category.description,
  status: category.status,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

const listCategories = async ({ search = "", status, page = 1, limit = 20 } = {}) => {
  const safePage = Number.isFinite(Number(page)) ? Math.max(1, Number(page)) : 1;
  const safeLimit = Number.isFinite(Number(limit)) ? Math.min(100, Math.max(1, Number(limit))) : 20;
  const skip = (safePage - 1) * safeLimit;

  const [categories, total] = await Promise.all([
    categoryRepository.findAll({ search, status, skip, limit: safeLimit }),
    categoryRepository.countAll({ search, status }),
  ]);

  return {
    items: categories.map(sanitizeCategory),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

const createCategory = async ({ payload }) => {
  const category = await categoryRepository.create({
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    status: payload.status || "active",
  });
  return sanitizeCategory(category);
};

const getCategoryById = async (id) => {
  const category = await categoryRepository.findById(id);
  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }
  return sanitizeCategory(category);
};

const updateCategory = async ({ id, payload }) => {
  const existing = await categoryRepository.findById(id);
  if (!existing) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
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

  const updated = await categoryRepository.updateById(id, patch);
  return sanitizeCategory(updated);
};

const updateCategoryStatus = async ({ id, status }) => {
  const updated = await categoryRepository.updateById(id, { status });
  if (!updated) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }
  return sanitizeCategory(updated);
};

const deleteCategory = async (id) => {
  const category = await categoryRepository.softDeleteById(id);
  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }
};

const listActiveCategories = async () => {
  const categories = await categoryRepository.findActive({ sort: { name: 1 }, limit: 100 });
  return categories.map((category) => ({
    id: category._id,
    name: category.name,
    description: category.description,
  }));
};

module.exports = {
  listCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
  listActiveCategories,
};
