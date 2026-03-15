const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const categoriesService = require("./categories.service");

exports.listCategories = asyncHandler(async (req, res) => {
  const data = await categoriesService.listCategories({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Categories fetched");
});

exports.createCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.createCategory({ payload: req.body });
  return successResponse(res, { category }, "Category created", 201);
});

exports.getCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.getCategoryById(req.params.id);
  return successResponse(res, { category }, "Category fetched");
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const category = await categoriesService.updateCategory({
    id: req.params.id,
    payload: req.body,
  });
  return successResponse(res, { category }, "Category updated");
});

exports.updateCategoryStatus = asyncHandler(async (req, res) => {
  const category = await categoriesService.updateCategoryStatus({
    id: req.params.id,
    status: req.body.status,
  });
  return successResponse(res, { category }, "Category status updated");
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  await categoriesService.deleteCategory(req.params.id);
  return successResponse(res, null, "Category deleted");
});
