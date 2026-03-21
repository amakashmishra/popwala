const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const servicesService = require("./services.service");

exports.listServices = asyncHandler(async (req, res) => {
  const data = await servicesService.listServices({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Services fetched");
});

exports.createService = asyncHandler(async (req, res) => {
  const service = await servicesService.createService({
    payload: req.body,
    file: req.file,
  });
  return successResponse(res, { service }, "Service created", 201);
});

exports.getService = asyncHandler(async (req, res) => {
  const service = await servicesService.getServiceById(req.params.id);
  return successResponse(res, { service }, "Service fetched");
});

exports.updateService = asyncHandler(async (req, res) => {
  const service = await servicesService.updateService({
    id: req.params.id,
    payload: req.body,
    file: req.file,
  });
  return successResponse(res, { service }, "Service updated");
});

exports.updateServiceStatus = asyncHandler(async (req, res) => {
  const service = await servicesService.updateServiceStatus({
    id: req.params.id,
    status: req.body.status,
  });
  return successResponse(res, { service }, "Service status updated");
});

exports.deleteService = asyncHandler(async (req, res) => {
  await servicesService.deleteService(req.params.id);
  return successResponse(res, null, "Service deleted");
});
