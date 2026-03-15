const Joi = require("joi");

const catalogStatusSchema = Joi.string().valid("active", "inactive");

const catalogBaseSchema = {
  name: Joi.string().min(2).max(128).required(),
  description: Joi.string().max(500).allow("").optional(),
  status: catalogStatusSchema.optional(),
};

const createCatalogSchema = Joi.object({
  ...catalogBaseSchema,
});

const updateCatalogSchema = Joi.object({
  name: Joi.string().min(2).max(128).optional(),
  description: Joi.string().max(500).allow("").optional(),
  status: catalogStatusSchema.optional(),
});

const updateCatalogStatusSchema = Joi.object({
  status: catalogStatusSchema.required(),
});

const listCatalogQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  status: catalogStatusSchema.optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createCatalogSchema,
  updateCatalogSchema,
  updateCatalogStatusSchema,
  listCatalogQuerySchema,
};
