const createCatalogRepository = require("./catalog.repository");
const Category = require("../models/category.model");

module.exports = createCatalogRepository(Category, ["name", "description"]);
