import puppeteer from "puppeteer";
import db from "../utils/database.js"
import timeUtils from "../utils/time.js"

const sleep = (seconds) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve()
        }, seconds * 1000)
    })
}

function vietStock() {
    const self = {}
    return {
        getNews: async () => {
            const browser = await puppeteer.launch({ headless: false });
            const page = await browser.newPage();
            // Navigate the page to a URL.
            await page.goto('https://vietstock.vn/chu-de/1-2/moi-cap-nhat.htm');
            // Wait for the articles to load
            await page.waitForSelector('[id^="article"]');

            // Extract all elements with specified selectors, click them and get their text
            const articleContents = await page.evaluate(async () => {
                // Find all article elements that match the criteria
                const articleLinks = document.querySelectorAll('[id^="article"] [href^="#art-cont"]');
                const results = [];
                // Process each article
                for (const link of articleLinks) {
                    try {
                        // Click on the article to expand/load content
                        link.click();
                        // Wait a moment for content to load/expand
                        await new Promise(r => setTimeout(r, 500));
                        // Find the parent article element
                        const articleElement = link.closest('[id^="article"]');
                        if (articleElement) {
                            // Get article data
                            const articleId = articleElement.id;
                            const title = articleElement.querySelector('.pTitle')?.innerText || '';
                            const summary = articleElement.querySelector('.pHead')?.innerText || '';
                            const contentParts = articleElement.querySelectorAll('.pBody')?.innerText || '';
                            const content = Array.from(contentParts).map(part => part.innerText).join('\n') || '';
                            const author = articleElement.querySelector('.pAuthor')?.innerText || '';
                            let publishedAt = articleElement.querySelector('.pPublishTimeSource')?.innerText || '';
                            const [time, date] = publishedAt.split(' ')
                            publishedAt = timeUtils.strToDate(time + ':00' + ' ' + date);
                            results.push({
                                id: articleId,
                                title,
                                summary,
                                content,
                                author,
                                published_at: publishedAt,
                                url: window.location.href
                            });
                        }
                    } catch (error) {
                        console.error("Error processing article:", error);
                    }
                }
                return results;
            });

            console.log(`Found and processed ${articleContents.length} articles`);

            // Save to database if needed
            for (const article of articleContents) {
                const sql = `
                INSERT INTO articles (article_id, title, summary, author, content, published_at, url)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (article_id) 
                DO UPDATE SET 
                    title = $2,
                    summary = $3,
                    author = $4,
                    content = $5,
                    published_at = $6,
                    url = $7,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id
            `;

                const values = [
                    article.id,
                    article.title,
                    article.summary,
                    article.author,
                    article.content,
                    article.published_at,
                    article.url
                ];

                try {
                    return await db.execute_sql(sql, values);
                } catch (error) {
                    console.error('Error saving article to database:', error);
                    throw error;
                }
            }

            await sleep(5); // Reduced sleep time
            await browser.close();

            return articleContents;
        }
    }
}

export default vietStock()