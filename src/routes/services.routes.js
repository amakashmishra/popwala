const express = require("express");
const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const servicesService = require("../modules/catalog/services.service");

const router = express.Router();

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const services = await servicesService.listActiveServices();
    return successResponse(res, { services }, "Active services fetched");
  })
);

module.exports = router;
