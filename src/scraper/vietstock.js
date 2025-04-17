import puppeteer from "puppeteer";
import db from "../utils/database"


export async function getNews(dateStr) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Navigate the page to a URL.
    await page.goto('https://vietstock.vn/chu-de/1-2/moi-cap-nhat.htm');
    // Wait for the articles to load
    await page.waitForSelector('[id^="article"]');

    // Extract all elements with IDs starting with "article"
    const articles = await page.evaluate(() => {
        const articleElements = document.querySelectorAll('[id^="article"]');
        return Array.from(articleElements).map(article => {
            return {
                id: article.id,
                title: article.querySelector('.title a')?.textContent?.trim(),
                url: article.querySelector('.title a')?.href,
                summary: article.querySelector('.summary')?.textContent?.trim(),
                time: article.querySelector('.time')?.textContent?.trim()
            };
        });
    });

    console.log(`Found ${articles.length} articles`);
    return articles;
}