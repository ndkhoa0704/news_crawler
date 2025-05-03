const CronJob = require('cron').CronJob;
const vietstockScaper = require('../crawler/scraper/vietstock');
const retryUtil = require('../utils/retry');
const logger = require('../utils/logger');


function schedulerService() {
    const self = {
        newsRetryWarpper: (func) => {
            const retryableGetNews = retryUtil.retryable(func, {
                strategy: retryUtil.STRATEGIES.JITTER,
                maxRetries: 3,
                baseDelay: 2000,
                maxDelay: 30000,
                factor: 2,
                jitter: 0.2,
                onRetry: (error, attempt, delay) => {
                    logger.warn(`Retrying (attempt ${attempt}) after ${Math.round(delay)}ms due to: ${error.message}`);
                }
            });
            return retryableGetNews
        }
    }
    const jobs = {
        vietstock: new CronJob('*/30 * * * *', async () => {
            try {
                await self.newsRetryWarpper(vietstockScaper.getNews)()
            } catch (error) {
                logger.error(`Error in Vietstock scraper job: ${error.message}`);
            }
        })
    }
    return {
        startJobs: () => {
            logger.info('Starting scheduled jobs')
            // Start all scheduled jobs
            Object.keys(jobs).forEach(jobName => {
                jobs[jobName].start();
                logger.info(`Started job: ${jobName}`);
            })
            return jobs;
        },
        stopJobs: () => {
            logger.info('Stopping all scheduled jobs')
            // Cancel all scheduled jobs
            Object.values(jobs).forEach(job => {
                if (job && typeof job.cancel === 'function') {
                    job.cancel();
                }
            });
        }
    }
}

module.exports = schedulerService();