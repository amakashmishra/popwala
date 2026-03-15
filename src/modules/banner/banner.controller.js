const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const bannerService = require("./banner.service");

exports.listActiveBanners = asyncHandler(async (req, res) => {
  const banners = await bannerService.listActiveBanners();
  return successResponse(res, { banners }, "Homepage banners fetched");
});
