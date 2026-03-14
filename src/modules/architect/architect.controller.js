const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const { setAuthCookies } = require("../../utils/authCookies");
const architectService = require("./architect.service");

exports.login = asyncHandler(async (req, res) => {
  const payload = await architectService.login(req.body, req);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, Boolean(req.body.rememberMe));
  return successResponse(res, { user: payload.user }, "Architect login successful");
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const payload = await architectService.refresh(token);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, true);
  return successResponse(res, { user: payload.user }, "Architect token refreshed");
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await architectService.getProfile(req.user.sub);
  return successResponse(res, { user }, "Architect profile fetched");
});
