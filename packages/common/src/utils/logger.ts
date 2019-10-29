import winston from 'winston';

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.errors({ stack: true }),
    winston.format.printf(
      info => `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),

  transports: [new winston.transports.Console()]
});
