const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const stylesService = require("./styles.service");
const typesService = require("./types.service");
const categoriesService = require("./categories.service");

exports.listActiveStyles = asyncHandler(async (req, res) => {
  const styles = await stylesService.listActiveStyles();
  return successResponse(res, { styles }, "Active styles fetched");
});

exports.listActiveTypes = asyncHandler(async (req, res) => {
  const types = await typesService.listActiveTypes();
  return successResponse(res, { types }, "Active product types fetched");
});

exports.listActiveCategories = asyncHandler(async (req, res) => {
  const categories = await categoriesService.listActiveCategories();
  return successResponse(res, { categories }, "Active categories fetched");
});
