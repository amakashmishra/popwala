const express = require("express");
const catalogController = require("./catalog.controller");

const router = express.Router();

router.get("/styles", catalogController.listActiveStyles);
router.get("/types", catalogController.listActiveTypes);
router.get("/categories", catalogController.listActiveCategories);
router.get("/services", catalogController.listActiveServices);

module.exports = router;
