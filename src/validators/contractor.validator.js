const Joi = require("joi");

const baseContractorSchema = {
  name: Joi.string().min(2).max(120),
  email: Joi.string().email(),
  phoneNumber: Joi.string().pattern(/^(?=.*\d)[0-9+\-\s]{8,20}$/),
  companyName: Joi.string().min(2).max(160),
  address: Joi.string().min(3).max(300),
  password: Joi.string().min(8).max(64),
  status: Joi.string().valid("active", "inactive"),
};

const createContractorSchema = Joi.object({
  ...baseContractorSchema,
  name: baseContractorSchema.name.required(),
  email: baseContractorSchema.email.required(),
  phoneNumber: baseContractorSchema.phoneNumber.required(),
  companyName: baseContractorSchema.companyName.required(),
  address: baseContractorSchema.address.required(),
  password: baseContractorSchema.password.required(),
});

const updateContractorSchema = Joi.object({
  name: baseContractorSchema.name,
  email: baseContractorSchema.email,
  phoneNumber: baseContractorSchema.phoneNumber,
  companyName: baseContractorSchema.companyName,
  address: baseContractorSchema.address,
  status: baseContractorSchema.status,
}).min(1);

const listContractorsQuerySchema = Joi.object({
  search: Joi.string().allow("").optional(),
  status: Joi.string().valid("active", "inactive").optional(),
  page: Joi.number().integer().min(1).optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
});

module.exports = {
  createContractorSchema,
  updateContractorSchema,
  listContractorsQuerySchema,
};
