import winston from 'winston';

export const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(info => {
      const log = `[${info.timestamp}] ${info.level}: ${info.message}`;
      return !!info.stack ? `${log}\n${info.stack}` : log;
    })
  ),

  transports: [new winston.transports.Console()]
});
