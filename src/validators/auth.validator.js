const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  mobile: Joi.string().pattern(/^[0-9]{10,15}$/).required(),
  password: Joi.string().min(8).max(64).required(),
});

const loginSchema = Joi.object({
  identifier: Joi.string().required(),
  password: Joi.string().required(),
  rememberMe: Joi.boolean().optional(),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().optional(),
});

const forgotPasswordSchema = Joi.object({
  identifier: Joi.string().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(64).required(),
});

const verifyEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().pattern(/^[0-9]{6}$/).required(),
});

const resendEmailOtpSchema = Joi.object({
  email: Joi.string().email().required(),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailOtpSchema,
  resendEmailOtpSchema,
};
