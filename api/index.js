const Router = require('koa-router');
const chatRouter = require('./chat');

// Create main router
const apiRouter = new Router({
    prefix: '/api'
});

// Health check endpoint
apiRouter.get('/health', (ctx) => {
    ctx.body = {
        status: 'ok',
        service: 'news_crawler_api',
        timestamp: new Date()
    };
});

// Combine all API routes
apiRouter.use(chatRouter.routes(), chatRouter.allowedMethods());

module.exports = apiRouter;