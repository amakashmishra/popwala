const createCatalogRepository = require("./catalog.repository");
const Style = require("../models/style.model");

module.exports = createCatalogRepository(Style, ["name", "description"]);
