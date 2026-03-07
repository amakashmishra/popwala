const AppError = require("../utils/appError");

module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user?.role || !allowedRoles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient permissions", 403, "FORBIDDEN"));
    }

    return next();
  };
};
