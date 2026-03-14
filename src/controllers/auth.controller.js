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
  const payload = await authService.register(req.body);
  const data = { user: payload.user };

  if (env.NODE_ENV !== "production" && payload.otp) {
    data.otp = payload.otp;
  }

  return successResponse(res, data, "User registered. Please verify email OTP", 201);
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

  const fallbackRedirect = `${env.FRONTEND_URL}/auth?google=success`;
  let redirectUrl = fallbackRedirect;

  if (req.query?.state) {
    try {
      const decodedState = JSON.parse(Buffer.from(req.query.state, "base64url").toString("utf8"));
      if (decodedState?.redirect && typeof decodedState.redirect === "string") {
        const parsed = new URL(decodedState.redirect);
        parsed.searchParams.set("google", "success");
        redirectUrl = parsed.toString();
      }
    } catch (error) {
      redirectUrl = fallbackRedirect;
    }
  }

  if (req.accepts("json") && !req.headers.referer) {
    return successResponse(res, { user: payload.user }, "Google login successful");
  }

  return res.redirect(redirectUrl);
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const payload = await authService.forgotPassword(req.body.identifier);
  const data = {};

  if (env.NODE_ENV !== "production" && payload.resetToken) {
    data.resetToken = payload.resetToken;
    data.resetPasswordExpiresAt = payload.resetPasswordExpiresAt;
  }

  return successResponse(res, data, "If the email exists, reset instructions have been generated");
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await authService.resetPassword(req.body.token, req.body.newPassword);
  return successResponse(res, { user }, "Password reset successful");
});

exports.verifyEmailOtp = asyncHandler(async (req, res) => {
  const user = await authService.verifyEmailOtp(req.body);
  return successResponse(res, { user }, "Email verified successfully");
});

exports.resendEmailOtp = asyncHandler(async (req, res) => {
  const payload = await authService.resendEmailOtp(req.body);
  const data = {};

  if (env.NODE_ENV !== "production" && payload.otp) {
    data.otp = payload.otp;
  }

  if (payload.alreadyVerified) {
    return successResponse(res, { alreadyVerified: true }, "Email is already verified");
  }

  return successResponse(res, data, "OTP sent to email");
});
