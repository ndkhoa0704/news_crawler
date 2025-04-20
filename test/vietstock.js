const vietStock = require('../src/scraper/vietstock.js');

async function test() {
    await vietStock.getNews()
}

test()