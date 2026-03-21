const createCatalogRepository = require("./catalog.repository");
const Promotion = require("../models/promotion.model");

module.exports = createCatalogRepository(Promotion, ["title", "subtitleTag", "description"]);
