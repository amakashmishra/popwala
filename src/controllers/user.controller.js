const asyncHandler = require("../utils/asyncHandler");
const { successResponse } = require("../utils/apiResponse");
const userService = require("../services/user.service");
const fileService = require("../services/file.service");
const fileRepository = require("../repositories/file.repository");

exports.getMe = asyncHandler(async (req, res) => {
  const user = await userService.getMyProfile(req.user.sub);
  return successResponse(res, { user }, "Profile fetched");
});

exports.updateMe = asyncHandler(async (req, res) => {
  const updatePayload = { ...req.body };

  if (req.file) {
    const uploaded = await fileService.uploadImageBuffer(req.file.buffer, "user_profiles");
    updatePayload.profileImage = uploaded.secure_url;

    await fileRepository.create({
      user: req.user.sub,
      publicId: uploaded.public_id,
      url: uploaded.secure_url,
      resourceType: uploaded.resource_type,
      mimeType: req.file.mimetype,
      size: req.file.size,
    });
  }

  const user = await userService.updateMyProfile(req.user.sub, updatePayload);
  return successResponse(res, { user }, "Profile updated");
});

exports.listUsers = asyncHandler(async (req, res) => {
  const users = await userService.listUsers();
  return successResponse(res, { users }, "Users fetched");
});
