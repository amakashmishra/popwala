const AppError = require("../utils/appError");
const { verifyAccessToken } = require("../utils/jwt");
const roles = require("../constants/roles");
const adminRepository = require("../repositories/admin.repository");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
  const token = req.cookies?.accessToken || tokenFromHeader;

  if (!token) {
    return next(new AppError("Access token missing", 401, "UNAUTHORIZED"));
  }

  try {
    const payload = verifyAccessToken(token);

    if (payload?.role !== roles.ADMIN || payload?.actorType !== "admin") {
      return next(new AppError("Forbidden: admin token required", 403, "FORBIDDEN"));
    }

    const admin = await adminRepository.findById(payload.sub);
    if (!admin || admin.status !== "active") {
      return next(new AppError("Admin not found or inactive", 401, "UNAUTHORIZED"));
    }

    req.admin = admin;
    req.user = payload;
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired access token", 401, "UNAUTHORIZED"));
  }
};
