const db = require('../../utils/database.js');

function articleService() {
    const self = {
        removeHtmlTags: (text) => {
            if (!text) return '';
            // Remove all HTML tags and their content
            return text.replace(/<[^>]*>/g, '');
        }
    };
    return {
        /**
         * Save a single article to the database
         */
        saveArticle: async (article) => {
            article.content = self.removeHtmlTags(article.content);
            const sql = `INSERT INTO articles (title, summary, content, author, published_at, url) 
                VALUES ($1, $2, $3, $4, $5, $6)`;
            const binds = [
                article.title, article.summary, article.content,
                article.author, article.published_at, article.url
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
            const sql = `SELECT published_at FROM articles ORDER BY published_at DESC LIMIT 1`;
            try {
                const result = await db.execute_sql(sql);
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