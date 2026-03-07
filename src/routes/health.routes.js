const express = require("express");
const healthController = require("../controllers/health.controller");

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check endpoint
 *     responses:
 *       200:
 *         description: Service health
 */
router.get("/", healthController.health);

module.exports = router;
