const Joi = require("joi");

const adminLoginSchema = Joi.object({
  email: Joi.string().email().optional(),
  identifier: Joi.string().optional(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional(),
})
  .or("email", "identifier")
  .messages({
    "object.missing": "Either email or identifier is required",
  });

const adminForgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const adminResetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64).required(),
});

const adminChangePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64).required(),
});

module.exports = {
  adminLoginSchema,
  adminForgotPasswordSchema,
  adminResetPasswordSchema,
  adminChangePasswordSchema,
};
