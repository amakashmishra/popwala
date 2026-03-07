const { createLogger, format, transports } = require("winston");
const env = require("./env");

const logger = createLogger({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: "pop-wala-api" },
  transports: [
    new transports.Console({
      format:
        env.NODE_ENV === "production"
          ? format.json()
          : format.combine(format.colorize(), format.simple()),
    }),
  ],
});

module.exports = logger;
