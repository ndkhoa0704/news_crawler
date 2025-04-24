require('dotenv').config({ path: './.env' });
const Koa = require('koa');
const logger = require('./utils/logger');


const schedulerCtrl = require('./crawler/services/scheduler');
const PostgresDB = require('./utils/database');



const app = new Koa();

PostgresDB.connect().then(() => {
    console.log("Connected to PostgreSQL database")
    app.listen(3000, () => {
        logger.info('Server is running on port 3000');
        // Start the scheduler jobs
        schedulerCtrl.startJobs();
        logger.info('Scheduler jobs have been started');
    });
}).catch((err) => {
    console.error("Error connecting to PostgreSQL database", err)
})