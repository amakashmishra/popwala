const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const upload = require("../../middlewares/upload.middleware");
const validate = require("../../middlewares/validate.middleware");
const { updateProfileSchema } = require("../../validators/user.validator");
const userController = require("./user.controller");

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags: [User]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, userController.getMe);

/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     tags: [User]
 *     summary: Update current user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Profile updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/me",
  authMiddleware,
  upload.single("profileImage"),
  validate(updateProfileSchema),
  userController.updateMe
);

module.exports = router;
