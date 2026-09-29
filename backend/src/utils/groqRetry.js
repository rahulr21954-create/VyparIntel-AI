const sleep = (ms) =>
    new Promise((resolve) => {
        setTimeout(resolve, ms);
    });

const extractRetrySeconds = (message) => {
    if (!message) {
        return 6;
    }

    const match = String(message).match(
        /try again in ([\d.]+)s/i
    );

    if (!match) {
        return 6;
    }

    const seconds = Number(match[1]);

    return Number.isFinite(seconds)
        ? seconds
        : 6;
};

const withGroqRetry = async (
    fn,
    retries = 2
) => {
    let lastError;

    for (
        let attempt = 0;
        attempt <= retries;
        attempt++
    ) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            const status =
                error?.status ||
                error?.response?.status;

            const message =
                error?.message || "";

            const isRateLimit =
                status === 429 ||
                message.includes(
                    "rate_limit_exceeded"
                ) ||
                message.includes(
                    "Rate limit reached"
                );

            if (!isRateLimit) {
                throw error;
            }

            if (attempt === retries) {
                throw error;
            }

            const retrySeconds =
                extractRetrySeconds(
                    message
                );

            const waitTime =
                Math.ceil(
                    retrySeconds * 1000
                ) + 500;

            console.log(
                `⏳ Groq rate limit detected. Retry ${
                    attempt + 1
                }/${retries} in ${waitTime}ms`
            );

            await sleep(waitTime);
        }
    }

    throw lastError;
};

export default withGroqRetry;