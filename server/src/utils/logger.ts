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
        // TODO: errors are not printed in the correct format
        //   See: https://github.com/winstonjs/winston/issues/1498
    ),

    transports: [
        new winston.transports.Console()
    ]
}); // FIXME: share config using common package