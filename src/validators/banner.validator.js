const Joi = require("joi");

const localizedTextSchema = {
  en: Joi.string().min(2).max(500),
  hi: Joi.string().min(2).max(500),
  mr: Joi.string().min(2).max(500),
};

const createBannerSchema = Joi.object({
  titleEn: localizedTextSchema.en.required(),
  titleHi: localizedTextSchema.hi.required(),
  titleMr: localizedTextSchema.mr.required(),
  descriptionEn: localizedTextSchema.en.required(),
  descriptionHi: localizedTextSchema.hi.required(),
  descriptionMr: localizedTextSchema.mr.required(),
  status: Joi.string().valid("active", "inactive").optional(),
});

const updateBannerSchema = Joi.object({
  titleEn: localizedTextSchema.en.optional(),
  titleHi: localizedTextSchema.hi.optional(),
  titleMr: localizedTextSchema.mr.optional(),
  descriptionEn: localizedTextSchema.en.optional(),
  descriptionHi: localizedTextSchema.hi.optional(),
  descriptionMr: localizedTextSchema.mr.optional(),
  status: Joi.string().valid("active", "inactive").optional(),
});

const updateBannerStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
});

const listBannersQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createBannerSchema,
  updateBannerSchema,
  updateBannerStatusSchema,
  listBannersQuerySchema,
};
