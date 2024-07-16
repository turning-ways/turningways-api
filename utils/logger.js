const winston = require("winston");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new winston.transports.Console({
      level: "debug", // "error", "warn", "info", "http", "verbose", "debug", "silly
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
      ),
    }),
    new winston.transports.File({
      level: "info",
      filename: "./logs/all-logs.log",
      handleExceptions: true,
      format: winston.format.combine(
        winston.format.timestamp({
          format: "YYYY-MM-DD HH:mm:ss",
        }),
        winston.format.errors({ stack: true }),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`,
        ),
        // winston.format.splat(),
        // winston.format.json()
      ),
      maxsize: 5242880, //5MB
      maxFiles: 5,
    }),
  ],
});

module.exports = { logger };
