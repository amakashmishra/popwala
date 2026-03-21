const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const adminService = require("./admin.service");
const dashboardService = require("./dashboard.service");

exports.listUsers = asyncHandler(async (req, res) => {
  const data = await adminService.listUsers({
    search: req.query.search,
    role: req.query.role,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });

  return successResponse(res, data, "Users fetched");
});

exports.updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus({
    userId: req.params.id,
    status: req.body.status,
    actorId: req.user.sub,
  });
  return successResponse(res, { user }, "User status updated");
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await dashboardService.getDashboardStats({
    startDate: req.query.startDate,
    endDate: req.query.endDate,
  });
  return successResponse(res, { stats }, "Dashboard statistics fetched");
});
