import vietStock from '../src/scraper/vietstock.js';

async function test() {
    await vietStock.getNews()
}

test()