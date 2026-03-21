const createCatalogRepository = require("./catalog.repository");
const Service = require("../models/service.model");

module.exports = createCatalogRepository(Service, ["name", "description"]);
