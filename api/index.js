const express = require('express');
const chatRouter = require('./chat');
const articlesRouter = require('./articles');

// Create main router
const apiRouter = express.Router();

// Health check endpoint
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'news_crawler_api',
        timestamp: new Date()
    });
});

// Use chat routes
apiRouter.use('/chat', chatRouter);

// Use articles routes
apiRouter.use('/articles', articlesRouter);

module.exports = apiRouter;