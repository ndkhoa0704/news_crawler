require('dotenv').config({ path: './.env' });
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
require('express-async-errors');
const logger = require('./utils/logger');
const llm = require('./services/llm');
const apiRouter = require('./api');
const schedulerService = require('./services/scheduler');
const PostgresDB = require('./utils/database');
const config = require('./config');

const app = express();

// Security middleware with CSP configuration for Vue.js
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'nonce-vue-app'", "https://unpkg.com"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            upgradeInsecureRequests: []
        },
    },
    crossOriginEmbedderPolicy: false,
}));
app.use(cors());

// Request parsing middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(`Server error: ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        message: 'An internal server error occurred'
    });
});

// Logger middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const ms = Date.now() - start;
        logger.info(`${req.method} ${req.url} - ${ms}ms - ${res.statusCode}`);
    });
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Use API routes
app.use('/api', apiRouter);

// Start llm service
llm.init();

// Connect to database and start server
PostgresDB.connect()
    .then(() => {
        logger.info("Connected to PostgreSQL database");

        const server = app.listen(config.WEB_PORT, '0.0.0.0', () => {
            logger.info(`Server is running on port ${config.WEB_PORT} and accessible at http://0.0.0.0:${config.WEB_PORT}`);
            // Start the scheduler jobs
            schedulerService.startJobs();
            logger.info('Scheduler jobs have been started');
        });

        // Graceful shutdown
        const gracefulShutdown = () => {
            logger.info('Shutting down gracefully...');
            schedulerService.stopJobs();
            server.close(() => {
                logger.info('Server closed');
                PostgresDB.disconnect()
                    .then(() => {
                        logger.info('Database connection closed');
                        process.exit(0);
                    })
                    .catch((err) => {
                        logger.error('Error closing database connection', err);
                        process.exit(1);
                    });
            });
        };

        // Handle graceful shutdown signals
        process.on('SIGTERM', gracefulShutdown);
        process.on('SIGINT', gracefulShutdown);
    })
    .catch((err) => {
        logger.error("Error connecting to PostgreSQL database", err);
        process.exit(1);
    });