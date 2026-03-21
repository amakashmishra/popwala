const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const leadsService = require("./leads.service");

exports.listRecentLeads = asyncHandler(async (req, res) => {
  const limit = Number(req.query.limit) || 5;
  const leads = await leadsService.listRecentLeads({ limit });
  return successResponse(res, { leads }, "Recent leads fetched");
});
