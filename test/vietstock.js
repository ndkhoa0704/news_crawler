require('dotenv').config({ path: './.env' });
const vietStock = require('../crawler/scraper/vietstock.js');
const llm = require('../services/llm.js');

llm.init()
const db = require('../utils/database.js');
db.connect()

async function test() {
    await vietStock.getNews()
}

test()