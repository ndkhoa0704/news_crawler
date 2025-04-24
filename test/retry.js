// filepath: e:\news_crawler\test\retry.js
const retryUtil = require('../utils/retry');

// Create some example functions that fail with different patterns
function createRandomFailingFunction(failureRate = 0.7) {
    return async () => {
        if (Math.random() < failureRate) {
            throw new Error('Random failure occurred');
        }
        return 'Success!';
    };
}

function createFailingThenSucceedingFunction(succeedOnAttempt = 3) {
    let attempts = 0;
    return async () => {
        attempts++;
        if (attempts < succeedOnAttempt) {
            throw new Error(`Failing on attempt ${attempts}`);
        }
        return `Success on attempt ${attempts}!`;
    };
}

// Test function to demonstrate retry with different strategies
async function testRetryStrategies() {
    console.log('===== RETRY UTILITY TEST =====');
    
    // Test with fixed delay
    try {
        console.log('\n1. Testing FIXED delay strategy:');
        const result = await retryUtil.retry(
            createFailingThenSucceedingFunction(3),
            {
                strategy: retryUtil.STRATEGIES.FIXED,
                maxRetries: 5,
                baseDelay: 500,
                onRetry: (error, attempt, delay) => {
                    console.log(`  Retry ${attempt} with fixed delay of ~${Math.round(delay)}ms: ${error.message}`);
                }
            }
        );
        console.log(`  ${result}`);
    } catch (error) {
        console.error(`  Failed: ${error.message}`);
    }
    
    // Test with exponential backoff
    try {
        console.log('\n2. Testing EXPONENTIAL delay strategy:');
        const result = await retryUtil.retry(
            createFailingThenSucceedingFunction(4),
            {
                strategy: retryUtil.STRATEGIES.EXPONENTIAL,
                maxRetries: 5,
                baseDelay: 200,
                factor: 2,
                onRetry: (error, attempt, delay) => {
                    console.log(`  Retry ${attempt} with exponential delay of ~${Math.round(delay)}ms: ${error.message}`);
                }
            }
        );
        console.log(`  ${result}`);
    } catch (error) {
        console.error(`  Failed: ${error.message}`);
    }
    
    // Test with jitter
    try {
        console.log('\n3. Testing JITTER delay strategy:');
        const result = await retryUtil.retry(
            createFailingThenSucceedingFunction(4),
            {
                strategy: retryUtil.STRATEGIES.JITTER,
                maxRetries: 5,
                baseDelay: 200,
                factor: 2,
                jitter: 0.3,
                onRetry: (error, attempt, delay) => {
                    console.log(`  Retry ${attempt} with jittered delay of ~${Math.round(delay)}ms: ${error.message}`);
                }
            }
        );
        console.log(`  ${result}`);
    } catch (error) {
        console.error(`  Failed: ${error.message}`);
    }
    
    // Test with linear backoff
    try {
        console.log('\n4. Testing LINEAR delay strategy:');
        const result = await retryUtil.retry(
            createFailingThenSucceedingFunction(4),
            {
                strategy: retryUtil.STRATEGIES.LINEAR,
                maxRetries: 5,
                baseDelay: 300,
                onRetry: (error, attempt, delay) => {
                    console.log(`  Retry ${attempt} with linear delay of ~${Math.round(delay)}ms: ${error.message}`);
                }
            }
        );
        console.log(`  ${result}`);
    } catch (error) {
        console.error(`  Failed: ${error.message}`);
    }
    
    // Test with retryable function wrapper
    try {
        console.log('\n5. Testing retryable() wrapper:');
        const randomFailingFn = createRandomFailingFunction(0.8);
        const retryableFn = retryUtil.retryable(randomFailingFn, {
            strategy: retryUtil.STRATEGIES.JITTER,
            maxRetries: 10,
            baseDelay: 100,
            jitter: 0.2,
            onRetry: (error, attempt, delay) => {
                console.log(`  Retry ${attempt} with delay of ~${Math.round(delay)}ms: ${error.message}`);
            }
        });
        
        const result = await retryableFn();
        console.log(`  ${result}`);
    } catch (error) {
        console.error(`  Failed after all retries: ${error.message}`);
    }
    
    console.log('\n===== TEST COMPLETE =====');
}

// Run the tests
testRetryStrategies().catch(console.error);