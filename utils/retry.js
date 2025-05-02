// filepath: d:\workspace\news_crawler\utils\retry.js
const logger = require('./logger');

/**
 * Retry utility module with support for different backoff strategies
 */
function RetryUtil() {
    /**
     * Available retry strategies
     */
    const STRATEGIES = {
        FIXED: 'fixed',           // Fixed delay between retries
        EXPONENTIAL: 'exponential', // Exponential backoff
        JITTER: 'jitter',         // Exponential backoff with jitter (randomness)
        LINEAR: 'linear'          // Linear backoff
    };

    /**
     * Calculates delay time based on retry strategy
     * @param {number} attempt - Current attempt number (starts at 1)
     * @param {Object} options - Options for retry strategy
     * @returns {number} - Delay in milliseconds
     */
    const calculateDelay = (attempt, options) => {
        const {
            strategy = STRATEGIES.EXPONENTIAL,
            baseDelay = 1000,
            maxDelay = 30000,
            factor = 2,
            jitter = 0.1,
        } = options;

        let delay;
        
        switch (strategy) {
            case STRATEGIES.FIXED:
                delay = baseDelay;
                break;
                
            case STRATEGIES.LINEAR:
                delay = baseDelay * attempt;
                break;
                
            case STRATEGIES.JITTER:
                // Exponential backoff with randomness
                const expDelay = baseDelay * Math.pow(factor, attempt - 1);
                const jitterRange = expDelay * jitter;
                delay = expDelay + (Math.random() * 2 - 1) * jitterRange; // Random value between -jitterRange and +jitterRange
                break;
                
            case STRATEGIES.EXPONENTIAL:
            default:
                delay = baseDelay * Math.pow(factor, attempt - 1);
                break;
        }
        
        // Ensure delay doesn't exceed maximum
        return Math.min(delay, maxDelay);
    };

    /**
     * Sleep for a given amount of time
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise} - Resolves after the delay
     */
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    return {
        STRATEGIES,
        
        /**
         * Retry a function with a specified strategy
         * @param {Function} fn - The function to retry (must return a Promise)
         * @param {Object} options - Retry options
         * @param {string} options.strategy - Retry strategy (FIXED, EXPONENTIAL, JITTER, LINEAR)
         * @param {number} options.maxRetries - Maximum number of retries (default: 3)
         * @param {number} options.baseDelay - Base delay in ms (default: 1000)
         * @param {number} options.maxDelay - Maximum delay in ms (default: 30000)
         * @param {number} options.factor - Backoff factor for exponential strategy (default: 2)
         * @param {number} options.jitter - Jitter factor for randomness (0-1) (default: 0.1)
         * @param {Function} options.retryCondition - Function that returns true if retry should happen (default: retry on any error)
         * @param {Function} options.onRetry - Called before each retry with (error, attempt)
         * @returns {Promise} - The result of the function call
         */
        retry: async function (fn, options = {}) {
            const {
                maxRetries = 3,
                retryCondition = () => true,
                onRetry = (error, attempt, delay) => {
                    logger.warn(`Retry attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms due to: ${error.message}`);
                }
            } = options;
            
            let attempt = 0;
            while (true) {
                try {
                    return await fn();
                } catch (error) {
                    attempt++;
                    
                    // Check if we should retry
                    if (attempt > maxRetries || !retryCondition(error)) {
                        throw error;
                    }
                    
                    // Calculate delay based on strategy
                    const delay = calculateDelay(attempt, options);
                    
                    // Call onRetry hook if provided
                    if (onRetry) {
                        onRetry(error, attempt, delay);
                    }
                    
                    // Wait before retrying
                    await sleep(delay);
                }
            }
        },
        
        /**
         * Creates a retryable version of a function
         * @param {Function} fn - Function to make retryable
         * @param {Object} options - Retry options (same as retry method)
         * @returns {Function} - A function that will retry on failure
         */
        retryable: function (fn, options = {}) {
            return (...args) => this.retry(() => fn(...args), options);
        }
    };
}

module.exports = RetryUtil();