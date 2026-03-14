const Joi = require("joi");
const roles = require("../constants/roles");

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(120).optional(),
  mobile: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
  role: Joi.string().valid(...Object.values(roles)).optional(),
  status: Joi.string().valid("active", "blocked", "inactive").optional(),
});

module.exports = {
  updateProfileSchema,
};
