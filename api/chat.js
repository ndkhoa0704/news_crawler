const express = require('express');
const chatService = require('../services/chat');
const logger = require('../utils/logger');

// Create router
const router = express.Router();

// Initialize chat service
chatService.init();

// POST endpoint for chat messages
router.post('/', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validate input
        if (!message || typeof message !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Invalid request. Message is required.'
            });
        }
        
        logger.info(`Chat request received: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`);
        
        // Process the message using chat service
        const response = await chatService.processMessage(message);
        
        // Return response
        res.json(response);
        
    } catch (error) {
        logger.error(`Error in chat API: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request.'
        });
    }
});

// GET endpoint for health check
router.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date()
    });
});

module.exports = router;