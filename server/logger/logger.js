const { createLogger, format, transports } = require('winston')
const { combine, timestamp, printf, colorize } = format

// Define log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`
});

// Create the logger
const logger = createLogger({
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(), // Colorize logs for console output
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      ),
    }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/combined.log' }),
  ],
})

// Stream for morgan to use
logger.stream = {
  write: function (message, encoding) {
    logger.info(message.trim())
  },
}

module.exports = logger
