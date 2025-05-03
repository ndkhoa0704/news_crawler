const puppeteer = require("puppeteer");
const timeUtils = require("../../utils/time.js");
const articleService = require("../../services/articles.js");
const logger = require("../../utils/logger.js");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function vietstockScaper() {
    const self = {}
    return {
        getNews: async () => {
            const newestArticlePublishedAt = await articleService.getNewestArticlePulishedAt('vietstock');
            const browser = await puppeteer.launch({ headless: true });
            const page = await browser.newPage();
            // Navigate the page to a URL.
            await page.goto('https://vietstock.vn/chu-de/1-2/moi-cap-nhat.htm');
            // Wait for the articles to load
            await page.waitForSelector('[href^="#art-cont"]');
            await sleep(1000)
            // Get all elements with href starting with "#art-cont"
            const articleLinks = await page.$$('[href^="#art-cont"]');
            logger.info(`Found ${articleLinks.length} article links`);
            // Click on each article link
            for (const link of articleLinks) {
                await link.click().catch(e => logger.error(`Failed to click an element: ${e.message}`));
                // Small delay between clicks to avoid overwhelming the page
                await sleep(500);
            }
            const results = [];
            // Extract articles data
            const articlesData = await page.$$eval('[id^="art-cont"]', articles => {
                return articles.map(article => {
                    // Get the elements within each article
                    const title = article.querySelector('.pTitle')?.innerText || '';
                    const summary = article.querySelector('.pHead')?.innerText || '';
                    const bodyElements = article.querySelectorAll('.pBody');
                    const body = Array.from(bodyElements).map(el => el.innerHTML).join('\n');
                    const author = article.querySelector('.pAuthor')?.innerText || '';
                    const publishedAt = article.querySelector('.pPublishTimeSource')?.innerText || '';
                    const url = article.querySelector('.pSource > a')?.getAttribute('href') || '';
                    return { title, summary, body, author, publishedAt, url };
                });
            });

            // Process the extracted data
            for (const article of articlesData) {
                if (article.publishedAt) {
                    const dateParts = article.publishedAt.split(' ');
                    if (dateParts.length >= 2) {
                        article.publishedAt = timeUtils.strToDate(dateParts[2] + ' ' + dateParts[1] + ':00');
                    }
                }
                if (newestArticlePublishedAt && article.publishedAt && article.publishedAt <= newestArticlePublishedAt) {
                    logger.info(`Article published at ${article.publishedAt} is older than the newest article published at ${newestArticlePublishedAt}. Skipping...`);
                    continue;
                }
                if (!article.title || !article.body) {
                    logger.warn(`Article is missing title or body. Skipping...`);
                    continue;
                }
                results.push({
                    title: article.title,
                    summary: article.summary,
                    content: article.body,
                    author: article.author,
                    published_at: article.publishedAt || new Date(),
                    url: article.url,
                    source: 'vietstock'
                });
            }

            logger.info(`Successfully scraped ${results.length} articles`);
            articleService.saveArticles(results).then(savedCount => {
                logger.info(`Saved ${savedCount} articles to database`)
            }).catch(error => {
                logger.error("Error saving articles to database:", error);
            })
            // Close browser
            await browser.close();
            // Return success message
            return { success: true, message: `Scraped ${results.length} articles` };
        }
    }
}

module.exports = vietstockScaper()