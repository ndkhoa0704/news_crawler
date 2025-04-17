import Koa from 'koa';
import logger from './utils/logger';


const app = new Koa();


logger.info('Server is starting...');
app.listen(3000);