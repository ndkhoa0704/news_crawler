const express = require('express');
const db = require('../utils/database');
const logger = require('../utils/logger');

const router = express.Router();

// GET recent articles
router.get('/recent', async (req, res) => {
    try {
        const sql = `
            SELECT title, summary, published_at, sentiment, url
            FROM articles
            ORDER BY published_at DESC
            LIMIT 10
        `;
        const articles = await db.execute_sql(sql, []);
        res.json({ success: true, articles });
    } catch (error) {
        logger.error(`Error fetching recent articles: ${error.message}`);
        res.status(500).json({
            success: false,
            message: 'Error fetching recent articles'
        });
    }
});

module.exports = router;