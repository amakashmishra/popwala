const express = require("express");
const authMiddleware = require("../../middlewares/auth.middleware");
const rbac = require("../../middlewares/rbac.middleware");
const validate = require("../../middlewares/validate.middleware");
const roles = require("../../constants/roles");
const { loginSchema } = require("../../validators/auth.validator");
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
