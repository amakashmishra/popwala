const express = require("express");
const userController = require("../controllers/user.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const rbac = require("../middlewares/rbac.middleware");
const upload = require("../middlewares/upload.middleware");
const validate = require("../middlewares/validate.middleware");
const roles = require("../constants/roles");
const { updateProfileSchema } = require("../validators/user.validator");

const router = express.Router();

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     tags: [Users]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *       401:
 *         description: Unauthorized
 */
/**
 * @swagger
 * /api/v1/users/me:
 *   patch:
 *     tags: [Users]
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
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin/manager only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users list returned
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/me", authMiddleware, userController.getMe);
router.patch("/me", authMiddleware, upload.single("profileImage"), validate(updateProfileSchema), userController.updateMe);
router.get("/", authMiddleware, rbac(roles.ADMIN, roles.MANAGER), userController.listUsers);

module.exports = router;
