const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const { setAuthCookies } = require("../../utils/authCookies");
const architectService = require("./architect.service");

exports.login = asyncHandler(async (req, res) => {
  const payload = await architectService.login(req.body, req);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, Boolean(req.body.rememberMe));
  return successResponse(res, { user: payload.user }, "Architect login successful");
});

exports.getMe = asyncHandler(async (req, res) => {
  const user = await architectService.getProfile(req.user.sub);
  return successResponse(res, { user }, "Architect profile fetched");
});
