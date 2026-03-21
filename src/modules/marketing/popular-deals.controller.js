const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const service = require("./popular-deals.service");

exports.listPopularDeals = asyncHandler(async (req, res) => {
  const data = await service.list({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Popular deals fetched");
});

exports.createPopularDeal = asyncHandler(async (req, res) => {
  const item = await service.create({ payload: req.body, file: req.file });
  return successResponse(res, { popularDeal: item }, "Popular deal created", 201);
});

exports.getPopularDeal = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id);
  return successResponse(res, { popularDeal: item }, "Popular deal fetched");
});

exports.updatePopularDeal = asyncHandler(async (req, res) => {
  const item = await service.update({ id: req.params.id, payload: req.body, file: req.file });
  return successResponse(res, { popularDeal: item }, "Popular deal updated");
});

exports.updatePopularDealStatus = asyncHandler(async (req, res) => {
  const item = await service.updateStatus({ id: req.params.id, status: req.body.status });
  return successResponse(res, { popularDeal: item }, "Popular deal status updated");
});

exports.deletePopularDeal = asyncHandler(async (req, res) => {
  await service.remove(req.params.id);
  return successResponse(res, null, "Popular deal deleted");
});

exports.listActivePopularDeals = asyncHandler(async (req, res) => {
  const popularDeals = await service.listActive();
  return successResponse(res, { popularDeals }, "Active popular deals fetched");
});
