// filepath: d:\workspace\news_crawler\services\chat.js
const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const db = require('../utils/database');

function chatService() {
    const self = {
        client: null,
        model: 'gpt-4o',
        
        // Initialize the OpenAI client
        initialize: () => {
            if (!process.env.OPENAI_API_KEY) {
                logger.error('OPENAI_API_KEY environment variable is not set');
                return false;
            }
            
            try {
                self.client = new OpenAI({
                    apiKey: process.env.OPENAI_API_KEY,
                });
                return true;
            } catch (error) {
                logger.error(`Error initializing OpenAI client: ${error.message}`);
                return false;
            }
        },
        
        // Fetch recent news articles for context
        fetchRecentArticles: async (limit = 5) => {
            try {
                const sql = `
                    SELECT title, summary, published_at, sentiment
                    FROM articles
                    ORDER BY published_at DESC
                    LIMIT $1
                `;
                
                const articles = await db.execute_sql(sql, [limit]);
                return articles;
            } catch (error) {
                logger.error(`Error fetching recent articles: ${error.message}`);
                return [];
            }
        }
    };
    
    return {
        // Initialize the service
        init: () => {
            return self.initialize();
        },
        
        // Process a user message and return a response
        processMessage: async (message) => {
            if (!self.client) {
                const initialized = self.initialize();
                if (!initialized) {
                    return { 
                        success: false, 
                        message: "I'm sorry, I'm having trouble connecting to my knowledge source." 
                    };
                }
            }
            
            try {
                // Fetch recent articles for context
                const recentArticles = await self.fetchRecentArticles();
                
                // Build a context string from the articles
                let articlesContext = '';
                if (recentArticles.length > 0) {
                    articlesContext = 'Recent financial news articles:\n\n' + 
                    recentArticles.map(article => {
                        return `Title: ${article.title}\n` +
                               `Summary: ${article.summary || 'No summary available'}\n` +
                               `Published: ${article.published_at}\n` +
                               `Sentiment: ${article.sentiment === 'P' ? 'Positive' : 'Negative'}\n`;
                    }).join('\n');
                }
                
                // Create system message with instructions
                const systemMessage = `You are a helpful financial news assistant. 
                Answer questions about financial markets and news based on the provided context.
                If the question cannot be answered based on the context, provide general financial advice
                or ask for more information. Be concise and professional.
                
                ${articlesContext}`;
                
                // Call OpenAI API
                const response = await self.client.chat.completions.create({
                    model: self.model,
                    messages: [
                        { role: "system", content: systemMessage },
                        { role: "user", content: message }
                    ],
                    max_tokens: 500
                });
                
                // Return the response
                if (response.choices && response.choices.length > 0) {
                    return {
                        success: true,
                        message: response.choices[0].message.content
                    };
                } else {
                    throw new Error('No response from OpenAI');
                }
            } catch (error) {
                logger.error(`Error in chat service: ${error.message}`);
                return {
                    success: false,
                    message: "I apologize, but I'm having trouble processing your request at the moment."
                };
            }
        }
    };
}

module.exports = chatService();