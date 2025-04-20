const Koa = require('koa');
const logger = require('./src/utils/logger.js');
const dotenv = require('dotenv');
dotenv.config();

const app = new Koa();

logger.info('Server is starting...');
app.listen(3000);