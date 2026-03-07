const asyncHandler = require("../utils/asyncHandler");

exports.health = asyncHandler(async (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});
