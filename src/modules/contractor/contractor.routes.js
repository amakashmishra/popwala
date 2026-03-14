const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const validate = require("../../middlewares/validate.middleware");
const roles = require("../../constants/roles");
const { loginSchema, refreshSchema } = require("../../validators/auth.validator");
const contractorController = require("./contractor.controller");

const router = express.Router();

/**
 * @swagger
 * /api/v1/contractor/auth/login:
 *   post:
 *     tags: [Contractor]
 *     summary: Contractor login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [identifier, password]
 *             properties:
 *               identifier:
 *                 type: string
 *               password:
 *                 type: string
 *               rememberMe:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post("/auth/login", validate(loginSchema), contractorController.login);

/**
 * @swagger
 * /api/v1/contractor/auth/refresh-token:
 *   post:
 *     tags: [Contractor]
 *     summary: Refresh contractor access token
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: Invalid refresh token
 */
router.post("/auth/refresh-token", validate(refreshSchema), contractorController.refresh);

/**
 * @swagger
 * /api/v1/contractor/me:
 *   get:
 *     tags: [Contractor]
 *     summary: Get contractor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Contractor profile fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, rbac(roles.CONTRACTOR), contractorController.getMe);

module.exports = router;
