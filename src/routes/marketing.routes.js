const express = require("express");
const popularDealsController = require("../modules/marketing/popular-deals.controller");
const promotionsController = require("../modules/marketing/promotions.controller");

const router = express.Router();

router.get("/popular-deals", popularDealsController.listActivePopularDeals);
router.get("/promotions", promotionsController.listActivePromotions);

module.exports = router;
