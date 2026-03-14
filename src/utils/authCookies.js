const env = require("../config/env");

const cookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax",
};

const withLifetime = (baseOptions, maxAge, rememberMe) => {
  if (rememberMe) {
    return { ...baseOptions, maxAge };
  }
  return baseOptions;
};

const setAuthCookies = (res, accessToken, refreshToken, rememberMe = true) => {
  res.cookie("accessToken", accessToken, withLifetime(cookieOptions, 15 * 60 * 1000, rememberMe));
  res.cookie("refreshToken", refreshToken, withLifetime(cookieOptions, 7 * 24 * 60 * 60 * 1000, rememberMe));
};

const setAccessCookie = (res, accessToken, rememberMe = true) => {
  res.cookie("accessToken", accessToken, withLifetime(cookieOptions, 15 * 60 * 1000, rememberMe));
};

const clearAuthCookies = (res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);
};

module.exports = {
  cookieOptions,
  setAuthCookies,
  setAccessCookie,
  clearAuthCookies,
};
