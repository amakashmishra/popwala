const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const authService = require("../services/auth.service");
const env = require("../config/env");

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

exports.register = asyncHandler(async (req, res) => {
  const user = await authService.register(req.body);
  return successResponse(res, { user }, "User registered", 201);
});

exports.login = asyncHandler(async (req, res) => {
  const payload = await authService.login(req.body, authService.getClientMeta(req));
  setAuthCookies(res, payload.accessToken, payload.refreshToken);
  return successResponse(res, { user: payload.user }, "Login successful");
});

exports.refresh = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const payload = await authService.refresh(token, authService.getClientMeta(req));
  setAuthCookies(res, payload.accessToken, payload.refreshToken);
  return successResponse(res, { user: payload.user }, "Token refreshed");
});

exports.logout = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  await authService.logout(token);
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
  return successResponse(res, null, "Logout successful");
});

exports.googleCallback = asyncHandler(async (req, res) => {
  const payload = await authService.issueTokensForOAuthUser(req.user, authService.getClientMeta(req));
  setAuthCookies(res, payload.accessToken, payload.refreshToken);

  return successResponse(res, { user: payload.user }, "Google login successful");
});
