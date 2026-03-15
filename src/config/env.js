const { config } = require("dotenv");
const fs = require("fs");
const path = require("path");
const Joi = require("joi");

const nodeEnv = process.env.NODE_ENV || "development";
const envFilePath = path.resolve(process.cwd(), `.env.${nodeEnv}`);

if (fs.existsSync(envFilePath)) {
  config({ path: envFilePath, override: true });
} else {
  config({ override: true });
}

const schema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "staging", "production", "test").default("development"),
  PORT: Joi.number().default(5000),
  MONGO_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default("15m"),
  JWT_REFRESH_SECRET: Joi.string().default("refresh_secret"),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default("7d"),
  GOOGLE_CLIENT_ID: Joi.string().allow("").default(""),
  GOOGLE_CLIENT_SECRET: Joi.string().allow("").default(""),
  GOOGLE_CALLBACK_URL: Joi.string().allow("").default(""),
  CLOUDINARY_CLOUD_NAME: Joi.string().allow("").default(""),
  CLOUDINARY_API_KEY: Joi.string().allow("").default(""),
  CLOUDINARY_API_SECRET: Joi.string().allow("").default(""),
  SMTP_HOST: Joi.string().allow("").default(""),
  SMTP_PORT: Joi.number().default(587),
  SMTP_USER: Joi.string().allow("").default(""),
  SMTP_PASS: Joi.string().allow("").default(""),
  EMAIL_FROM: Joi.string().allow("").default(""),
  FRONTEND_URL: Joi.string().default("http://localhost:8080"),
  API_BASE_URL: Joi.string().default("http://localhost:5000"),
  CORS_ORIGINS: Joi.string().default("http://localhost:8080,http://localhost:3000"),
  RATE_LIMIT_WINDOW_MS: Joi.number().default(900000),
  RATE_LIMIT_MAX: Joi.number().default(100),
  ADMIN_NAME: Joi.string().default("PopWala Admin"),
  ADMIN_EMAIL: Joi.string().email().default("popadmin@gmail.com"),
  ADMIN_PASSWORD: Joi.string().min(8).default("popwala@123"),
}).unknown(true);

const { value, error } = schema.validate(process.env, { abortEarly: false });

if (error) {
  throw new Error(`Environment validation error: ${error.message}`);
}

module.exports = value;
