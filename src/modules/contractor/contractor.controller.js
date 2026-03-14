const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const { setAuthCookies } = require("../../utils/authCookies");
const contractorService = require("./contractor.service");

exports.login = asyncHandler(async (req, res) => {
  const payload = await contractorService.login(req.body, req);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, Boolean(req.body.rememberMe));
  return successResponse(res, { user: payload.user }, "Contractor login successful");
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const payload = await contractorService.refresh(token);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, true);
  return successResponse(res, { user: payload.user }, "Contractor token refreshed");
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await contractorService.getProfile(req.user.sub);
  return successResponse(res, { user }, "Contractor profile fetched");
});
