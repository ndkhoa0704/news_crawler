const winston = require('winston');
const path = require('path');
const fs = require('fs');

const { format, transports } = winston;

// Ensure logs directory exists
const logDir = path.join(path.dirname(__dirname), 'logs');
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Get current date for log filename
const getFormattedDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

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

        // File transport with date-based filename
        new transports.File({
            filename: path.join(logDir, `application-${getFormattedDate()}.log`),
            format: logFormat,
            maxsize: 5242880, // 5MB
            maxFiles: 7,
            tailable: true
        })
    ]
});

// Add a function to update the file transport with new date if needed
const updateFileTransport = () => {
    const currentDate = getFormattedDate();
    const fileTransport = logger.transports.find(t => t instanceof transports.File);
    
    if (fileTransport) {
        const expectedFilename = path.join(logDir, `application-${currentDate}.log`);
        if (fileTransport.filename !== expectedFilename) {
            // Remove old transport
            logger.remove(fileTransport);
            
            // Add new transport with updated filename
            logger.add(new transports.File({
                filename: expectedFilename,
                format: logFormat,
                maxsize: 5242880, // 5MB
                maxFiles: 7,
                tailable: true
            }));
        }
    }
};

// Set up daily check for date change (midnight rollover)
setInterval(updateFileTransport, 60 * 60 * 1000); // Check every hour

// Add stream for Morgan if needed for HTTP request logging
logger.stream = {
    write: (message) => logger.info(message.trim())
};

module.exports = logger;