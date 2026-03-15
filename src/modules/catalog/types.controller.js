const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const typesService = require("./types.service");

exports.listTypes = asyncHandler(async (req, res) => {
  const data = await typesService.listTypes({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Product types fetched");
});

exports.createType = asyncHandler(async (req, res) => {
  const type = await typesService.createType({ payload: req.body });
  return successResponse(res, { type }, "Product type created", 201);
});

exports.getType = asyncHandler(async (req, res) => {
  const type = await typesService.getTypeById(req.params.id);
  return successResponse(res, { type }, "Product type fetched");
});

exports.updateType = asyncHandler(async (req, res) => {
  const type = await typesService.updateType({
    id: req.params.id,
    payload: req.body,
  });
  return successResponse(res, { type }, "Product type updated");
});

exports.updateTypeStatus = asyncHandler(async (req, res) => {
  const type = await typesService.updateTypeStatus({
    id: req.params.id,
    status: req.body.status,
  });
  return successResponse(res, { type }, "Product type status updated");
});

exports.deleteType = asyncHandler(async (req, res) => {
  await typesService.deleteType(req.params.id);
  return successResponse(res, null, "Product type deleted");
});
