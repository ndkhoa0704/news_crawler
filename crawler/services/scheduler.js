const CronJob = require('cron').CronJob;
const vietstockScaper = require('../scraper/vietstock');
const retryUtil = require('../../utils/retry');
const logger = require('../../utils/logger');


function schedulerCtrl() {
    const jobs = {
        vietstock: new CronJob('*/15 * * * *', async () => {
            // Make the getNews function retryable with jitter strategy
            const retryableGetNews = retryUtil.retryable(vietstockScaper.getNews, {
                strategy: retryUtil.STRATEGIES.JITTER,
                maxRetries: 3,
                baseDelay: 2000,
                maxDelay: 30000,
                factor: 2,
                jitter: 0.2,
                onRetry: (error, attempt, delay) => {
                    logger.warn(`Retrying vietstock scraper (attempt ${attempt}) after ${Math.round(delay)}ms due to: ${error.message}`);
                }
            });
            try {
                await retryableGetNews();
                logger.info('Successfully completed vietstock scraping job');
            } catch (error) {
                logger.error(`Failed to complete vietstock scraping after retries: ${error.message}`);
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

module.exports = schedulerCtrl();