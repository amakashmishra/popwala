const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const { setAuthCookies } = require("../../utils/authCookies");
const adminAuthService = require("./admin-auth.service");

exports.login = asyncHandler(async (req, res) => {
  const payload = await adminAuthService.login(req.body);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, Boolean(req.body.rememberMe));
  return successResponse(
    res,
    {
      token: payload.accessToken,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      admin: payload.admin,
    },
    "Admin login successful"
  );
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const payload = await adminAuthService.refresh(token);
  setAuthCookies(res, payload.accessToken, payload.refreshToken, true);
  return successResponse(
    res,
    {
      token: payload.accessToken,
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      admin: payload.admin,
    },
    "Admin token refreshed"
  );
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const data = await adminAuthService.forgotPassword(req.body);
  return successResponse(res, data, "If email exists, reset instructions were sent");
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.resetPassword(req.body);
  return successResponse(res, { admin }, "Password reset successful");
});

exports.getProfile = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.getProfile(req.admin._id);
  return successResponse(res, { admin }, "Admin profile fetched");
});

exports.changePassword = asyncHandler(async (req, res) => {
  const admin = await adminAuthService.changePassword({
    adminId: req.admin._id,
    currentPassword: req.body.currentPassword,
    newPassword: req.body.newPassword,
  });

  return successResponse(res, { admin }, "Password updated successfully");
});
