const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const architectManagementService = require("./architect-management.service");

exports.listArchitects = asyncHandler(async (req, res) => {
  const data = await architectManagementService.listArchitects({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  return successResponse(res, data, "Architects fetched");
});

exports.createArchitect = asyncHandler(async (req, res) => {
  const architect = await architectManagementService.createArchitect(req.body);
  return successResponse(res, { architect }, "Architect created", 201);
});

exports.getArchitectById = asyncHandler(async (req, res) => {
  const architect = await architectManagementService.getArchitectById(req.params.id);
  return successResponse(res, { architect }, "Architect fetched");
});

exports.updateArchitect = asyncHandler(async (req, res) => {
  const architect = await architectManagementService.updateArchitect(req.params.id, req.body);
  return successResponse(res, { architect }, "Architect updated");
});

exports.deleteArchitect = asyncHandler(async (req, res) => {
  await architectManagementService.deleteArchitect(req.params.id);
  return successResponse(res, null, "Architect deleted");
});
