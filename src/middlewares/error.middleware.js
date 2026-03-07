const env = require("../config/env");
const logger = require("../config/logger");

module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || "INTERNAL_ERROR";

  logger.error("Request failed", {
    path: req.originalUrl,
    method: req.method,
    statusCode,
    message: err.message,
    stack: err.stack,
  });

  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
    errorCode,
    ...(env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};
