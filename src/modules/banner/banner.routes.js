const express = require("express");
const bannerController = require("./banner.controller");

const router = express.Router();

/**
 * @swagger
 * /api/v1/banners:
 *   get:
 *     tags: [Website Banners]
 *     summary: Get active homepage banners
 *     responses:
 *       200:
 *         description: Active banners fetched
 */
router.get("/", bannerController.listActiveBanners);

module.exports = router;
