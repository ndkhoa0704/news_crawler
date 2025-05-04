const db = require('../utils/database.js');
const llm = require('./llm.js');

function articleService() {
    const self = {
        removeHtmlTags: (text) => {
            if (!text) return '';
            // Remove all HTML tags and their content
            return text.replace(/<[^>]*>/g, '');
        },

        summarizeContent: async (title, content) => {
            try {
                const prompt = `Summarize the content of this news article. Return only the summary.
                
                Title: ${title}
                Content: ${content}`;

                const response = await llm.getResponse(prompt);
                return response.trim();
            } catch (error) {
                console.error("Error summarizing content:", error);
                return 'Error summarizing content';
            }
        },
        analyzeSentiment: async (title, content) => {
            try {
                const prompt = `Analyze the sentiment of this news article. Return only 'P' for positive sentiment or 'N' for negative sentiment.
                Content: ${content}`;

                const response = await llm.getResponse(prompt);
                // Extract just the first character and ensure it's either 'P' or 'N'
                const sentiment = response.trim().charAt(0).toUpperCase();
                return sentiment === 'P' ? 'P' : 'N';
            } catch (error) {
                console.error("Error analyzing sentiment:", error);
                return 'N'; // Default to negative if analysis fails
            }
        }
    };
    return {
        /**
         * Save a single article to the database
         */
        saveArticle: async (article) => {
            article.content = self.removeHtmlTags(article.content);
            // Analyze sentiment before saving
            const sentiment = await self.analyzeSentiment(article.title, article.content);

            const sql = `INSERT INTO articles (title, summary, content, author, published_at, url, sentiment, source) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`;
            const binds = [
                article.title, article.summary, article.content,
                article.author, article.published_at, article.url, sentiment, article.source
            ];
            try {
                await db.execute_sql(sql, binds);
                return true;
            } catch (error) {
                console.error("Error saving article:", error);
                return false;
            }
        },
        /**
         * Save multiple articles to the database
         */
        saveArticles: async (articles) => {
            let successCount = 0;
            for (const article of articles) {
                try {
                    const result = await module.exports.saveArticle(article);
                    if (result) successCount++;
                } catch (error) {
                    console.error("Error in saveArticles:", error);
                }
            }
            return successCount;
        },
        getNewestArticlePulishedAt: async (source) => {
            const sql = `SELECT published_at 
                FROM articles 
                WHERE source = $1
                ORDER BY published_at DESC LIMIT 1`;
            try {
                const result = await db.execute_sql(sql, [source]);
                if (result && result.length > 0) {
                    return result[0].published_at;
                } else {
                    return null;
                }
            } catch (error) {
                console.error("Error fetching newest article published date:", error);
                return null;
            }
        }
    }
}

module.exports = articleService();