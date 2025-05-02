require('dotenv').config({ path: './.env' });
const Koa = require('koa');
const serve = require('koa-static');
const mount = require('koa-mount');
const path = require('path');
const logger = require('./utils/logger');

const apiRouter = require('./api');
const schedulerService = require('./services/scheduler');
const PostgresDB = require('./utils/database');

const app = new Koa();

// Error handling middleware
app.use(async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        logger.error(`Server error: ${err.message}`);
        ctx.status = err.status || 500;
        ctx.body = {
            success: false,
            message: 'An internal server error occurred'
        };
        ctx.app.emit('error', err, ctx);
    }
});

// Logger middleware
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    logger.info(`${ctx.method} ${ctx.url} - ${ms}ms - ${ctx.status}`);
});

// Serve static files from the public directory
app.use(serve(path.join(__dirname, 'public')));

// Use API routes
app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

// Connect to database and start server
PostgresDB.connect()
    .then(() => {
        logger.info("Connected to PostgreSQL database");
        app.listen(3000, () => {
            logger.info('Server is running on port 3000');
            // Start the scheduler jobs
            schedulerService.startJobs();
            logger.info('Scheduler jobs have been started');
        });
    })
    .catch((err) => {
        logger.error("Error connecting to PostgreSQL database", err);
        process.exit(1);
    });

// Handle uncaught errors
app.on('error', (err, ctx) => {
    logger.error(`Unhandled server error: ${err.message}`, { stack: err.stack });
});