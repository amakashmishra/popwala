const createCatalogRepository = require("./catalog.repository");
const ProductType = require("../models/product-type.model");

module.exports = createCatalogRepository(ProductType, ["name", "description"]);
