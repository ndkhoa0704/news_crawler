import winston from 'winston';
import { DailyRotateFile } from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const { format, transports } = winston;

// Get current file directory with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure logs directory exists
const logDir = path.join(dirname(__dirname), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define the format for logs
const logFormat = format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
    })
);

// Create Winston logger with console and file transports
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
        // Console transport
        new transports.Console({
            format: format.combine(
                format.colorize(),
                logFormat
            )
        }),

        // File transport - daily rotation, keep 7 days
        new DailyRotateFile({
            filename: path.join(logDir, 'application-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            maxFiles: '7d',
            format: logFormat
        })
    ]
});

// Add stream for Morgan if needed for HTTP request logging
logger.stream = {
    write: (message) => logger.info(message.trim())
};

export default logger;