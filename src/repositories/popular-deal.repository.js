const createCatalogRepository = require("./catalog.repository");
const PopularDeal = require("../models/popular-deal.model");

module.exports = createCatalogRepository(PopularDeal, ["cardTitle", "title", "subtitleTag", "description"]);
