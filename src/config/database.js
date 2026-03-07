const mongoose = require("mongoose");
const env = require("./env");
const logger = require("./logger");

const connectDatabase = async () => {
  try {
    await mongoose.connect(env.MONGO_URI, {
      autoIndex: env.NODE_ENV !== "production",
    });
    logger.info("MongoDB connected", { env: env.NODE_ENV });
  } catch (error) {
    logger.error("MongoDB connection failed", { message: error.message });
    throw error;
  }
};

module.exports = connectDatabase;
