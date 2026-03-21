const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const service = require("./promotions.service");

exports.listPromotions = asyncHandler(async (req, res) => {
  const data = await service.list({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Promotions fetched");
});

exports.createPromotion = asyncHandler(async (req, res) => {
  const item = await service.create({ payload: req.body, file: req.file });
  return successResponse(res, { promotion: item }, "Promotion created", 201);
});

exports.getPromotion = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id);
  return successResponse(res, { promotion: item }, "Promotion fetched");
});

exports.updatePromotion = asyncHandler(async (req, res) => {
  const item = await service.update({ id: req.params.id, payload: req.body, file: req.file });
  return successResponse(res, { promotion: item }, "Promotion updated");
});

exports.updatePromotionStatus = asyncHandler(async (req, res) => {
  const item = await service.updateStatus({ id: req.params.id, status: req.body.status });
  return successResponse(res, { promotion: item }, "Promotion status updated");
});

exports.deletePromotion = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return successResponse(res, null, "Promotion deleted");
});

exports.listActivePromotions = asyncHandler(async (req, res) => {
  const promotions = await service.listActive();
  return successResponse(res, { promotions }, "Active promotions fetched");
});
