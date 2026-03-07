const AppError = require("../utils/appError");
const { verifyAccessToken } = require("../utils/jwt");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  const token = req.cookies?.accessToken || tokenFromHeader;

  if (!token) {
    return next(new AppError("Access token missing", 401, "UNAUTHORIZED"));
  }

  try {
    req.user = verifyAccessToken(token);
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired access token", 401, "UNAUTHORIZED"));
  }
};
