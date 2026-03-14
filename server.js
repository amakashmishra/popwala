const app = require("./src/app");
const env = require("./src/config/env");
const logger = require("./src/config/logger");
const connectDatabase = require("./src/config/database");
const { ensureDefaultAdmin } = require("./src/modules/admin/admin.bootstrap");

let server;

const start = async () => {
  await connectDatabase();
  await ensureDefaultAdmin();
  server = app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} (${env.NODE_ENV})`);
  });
};

start().catch((error) => {
  logger.error("Failed to start server", { message: error.message });
  process.exit(1);
});

const gracefulShutdown = async () => {
  logger.info("Graceful shutdown started");
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
