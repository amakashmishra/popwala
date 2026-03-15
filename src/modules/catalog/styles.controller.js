const asyncHandler = require("../../utils/asyncHandler");
const { successResponse } = require("../../utils/apiResponse");
const stylesService = require("./styles.service");

exports.listStyles = asyncHandler(async (req, res) => {
  const data = await stylesService.listStyles({
    search: req.query.search,
    status: req.query.status,
    page: req.query.page,
    limit: req.query.limit,
  });
  return successResponse(res, data, "Styles fetched");
});

exports.createStyle = asyncHandler(async (req, res) => {
  const style = await stylesService.createStyle({
    payload: req.body,
    file: req.file,
  });
  return successResponse(res, { style }, "Style created", 201);
});

exports.getStyle = asyncHandler(async (req, res) => {
  const style = await stylesService.getStyleById(req.params.id);
  return successResponse(res, { style }, "Style fetched");
});

exports.updateStyle = asyncHandler(async (req, res) => {
  const style = await stylesService.updateStyle({
    id: req.params.id,
    payload: req.body,
    file: req.file,
  });
  return successResponse(res, { style }, "Style updated");
});

exports.updateStyleStatus = asyncHandler(async (req, res) => {
  const style = await stylesService.updateStyleStatus({
    id: req.params.id,
    status: req.body.status,
  });
  return successResponse(res, { style }, "Style status updated");
});

exports.deleteStyle = asyncHandler(async (req, res) => {
  await stylesService.deleteStyle(req.params.id);
  return successResponse(res, null, "Style deleted");
});
