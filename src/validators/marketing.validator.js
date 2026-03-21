const Joi = require("joi");

const statusSchema = Joi.string().valid("active", "inactive");
const colorSchema = Joi.string().max(32).allow("").optional();
const urlSchema = Joi.string().uri().allow("").optional();

const createPopularDealSchema = Joi.object({
  cardTitle: Joi.string().max(120).allow("").optional(),
  title: Joi.string().min(2).max(200).required(),
  subtitleTag: Joi.string().max(120).allow("").optional(),
  description: Joi.string().max(800).allow("").optional(),
  buttonText: Joi.string().max(80).allow("").optional(),
  redirectUrl: urlSchema,
  themeColor: colorSchema,
  status: statusSchema.optional(),
});

const updatePopularDealSchema = Joi.object({
  cardTitle: Joi.string().max(120).allow("").optional(),
  title: Joi.string().min(2).max(200).optional(),
  subtitleTag: Joi.string().max(120).allow("").optional(),
  description: Joi.string().max(800).allow("").optional(),
  buttonText: Joi.string().max(80).allow("").optional(),
  redirectUrl: urlSchema,
  themeColor: colorSchema,
  status: statusSchema.optional(),
});

const createPromotionSchema = Joi.object({
  title: Joi.string().min(2).max(200).required(),
  subtitleTag: Joi.string().max(120).allow("").optional(),
  description: Joi.string().max(800).allow("").optional(),
  buttonText: Joi.string().max(80).allow("").optional(),
  redirectUrl: urlSchema,
  themeColor: colorSchema,
  status: statusSchema.optional(),
});

const updatePromotionSchema = Joi.object({
  title: Joi.string().min(2).max(200).optional(),
  subtitleTag: Joi.string().max(120).allow("").optional(),
  description: Joi.string().max(800).allow("").optional(),
  buttonText: Joi.string().max(80).allow("").optional(),
  redirectUrl: urlSchema,
  themeColor: colorSchema,
  status: statusSchema.optional(),
});

const updateMarketingStatusSchema = Joi.object({
  status: statusSchema.required(),
});

const listMarketingQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  status: statusSchema.optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createPopularDealSchema,
  updatePopularDealSchema,
  createPromotionSchema,
  updatePromotionSchema,
  updateMarketingStatusSchema,
  listMarketingQuerySchema,
};
