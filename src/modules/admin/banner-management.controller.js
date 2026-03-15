const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const bannerManagementService = require("./banner-management.service");

exports.listBanners = asyncHandler(async (req, res) => {
  const data = await bannerManagementService.listBanners({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Banners fetched");
});

exports.createBanner = asyncHandler(async (req, res) => {
  const banner = await bannerManagementService.createBanner({
    payload: req.body,
    file: req.file,
  });
  return successResponse(res, { banner }, "Banner created", 201);
});

exports.getBannerById = asyncHandler(async (req, res) => {
  const banner = await bannerManagementService.getBannerById(req.params.id);
  return successResponse(res, { banner }, "Banner fetched");
});

exports.updateBanner = asyncHandler(async (req, res) => {
  const banner = await bannerManagementService.updateBanner({
    id: req.params.id,
    payload: req.body,
    file: req.file,
  });
  return successResponse(res, { banner }, "Banner updated");
});

exports.updateBannerStatus = asyncHandler(async (req, res) => {
  const banner = await bannerManagementService.updateBannerStatus({
    id: req.params.id,
    status: req.body.status,
  });
  return successResponse(res, { banner }, "Banner status updated");
});

exports.deleteBanner = asyncHandler(async (req, res) => {
  await bannerManagementService.deleteBanner(req.params.id);
  return successResponse(res, null, "Banner deleted");
});
