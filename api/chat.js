const Router = require('koa-router');
const { koaBody } = require('koa-body');
const chatService = require('../services/chat');
const logger = require('../utils/logger');

// Create router
const router = new Router({
    prefix: '/api/chat'
});

// Initialize chat service
chatService.init();

// POST endpoint for chat messages
router.post('/', koaBody(), async (ctx) => {
    try {
        const { message } = ctx.request.body;
        
        // Validate input
        if (!message || typeof message !== 'string') {
            ctx.status = 400;
            ctx.body = { 
                success: false,
                message: 'Invalid request. Message is required.'
            };
            return;
        }
        
        logger.info(`Chat request received: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
        
        // Process the message using chat service
        const response = await chatService.processMessage(message);
        
        // Return response
        ctx.body = response;
        
    } catch (error) {
        logger.error(`Error in chat API: ${error.message}`);
        ctx.status = 500;
        ctx.body = {
            success: false,
            message: 'An error occurred while processing your request.'
        };
    }
});

// GET endpoint for health check
router.get('/health', (ctx) => {
    ctx.body = {
        status: 'ok',
        timestamp: new Date()
    };
});

module.exports = router;