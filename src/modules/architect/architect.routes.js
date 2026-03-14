const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const validate = require("../../middlewares/validate.middleware");
const roles = require("../../constants/roles");
const { loginSchema, refreshSchema } = require("../../validators/auth.validator");
const architectController = require("./architect.controller");

const router = express.Router();

/**
 * @swagger
 * /api/v1/architect/auth/login:
 *   post:
 *     tags: [Architect]
 *     summary: Architect login
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
router.post("/auth/login", validate(loginSchema), architectController.login);

/**
 * @swagger
 * /api/v1/architect/auth/refresh-token:
 *   post:
 *     tags: [Architect]
 *     summary: Refresh architect access token
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
router.post("/auth/refresh-token", validate(refreshSchema), architectController.refresh);

/**
 * @swagger
 * /api/v1/architect/me:
 *   get:
 *     tags: [Architect]
 *     summary: Get architect profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Architect profile fetched
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, rbac(roles.ARCHITECT), architectController.getMe);

module.exports = router;
