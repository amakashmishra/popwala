const File = require("../models/file.model");

const create = (payload) => File.create(payload);

module.exports = {
  create,
};
