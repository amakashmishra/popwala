const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const contractorManagementService = require("./contractor-management.service");

exports.listContractors = asyncHandler(async (req, res) => {
  const data = await contractorManagementService.listContractors({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  return successResponse(res, data, "Contractors fetched");
});

exports.createContractor = asyncHandler(async (req, res) => {
  const contractor = await contractorManagementService.createContractor(req.body);
  return successResponse(res, { contractor }, "Contractor created", 201);
});

exports.getContractorById = asyncHandler(async (req, res) => {
  const contractor = await contractorManagementService.getContractorById(req.params.id);
  return successResponse(res, { contractor }, "Contractor fetched");
});

exports.updateContractor = asyncHandler(async (req, res) => {
  const contractor = await contractorManagementService.updateContractor(req.params.id, req.body);
  return successResponse(res, { contractor }, "Contractor updated");
});

exports.deleteContractor = asyncHandler(async (req, res) => {
  await contractorManagementService.deleteContractor(req.params.id);
  return successResponse(res, null, "Contractor deleted");
});
