const Joi = require("joi");

const baseArchitectSchema = {
  name: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  phoneNumber: Joi.string().pattern(/^(?=.*\d)[0-9+\-\s]{8,20}$/),
  password: Joi.string().min(8).max(64),
  companyName: Joi.string().min(2).max(160),
  address: Joi.string().min(3).max(300),
  status: Joi.string().valid("active", "inactive"),
};

const createArchitectSchema = Joi.object({
  ...baseArchitectSchema,
  name: baseArchitectSchema.name.required(),
  email: baseArchitectSchema.email.required(),
  phoneNumber: baseArchitectSchema.phoneNumber.required(),
  password: baseArchitectSchema.password.required(),
  companyName: baseArchitectSchema.companyName.required(),
  address: baseArchitectSchema.address.required(),
});

const updateArchitectSchema = Joi.object({
  name: baseArchitectSchema.name,
  email: baseArchitectSchema.email,
  phoneNumber: baseArchitectSchema.phoneNumber,
  companyName: baseArchitectSchema.companyName,
  address: baseArchitectSchema.address,
  status: baseArchitectSchema.status,
}).min(1);

const listArchitectsQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createArchitectSchema,
  updateArchitectSchema,
  listArchitectsQuerySchema,
};
