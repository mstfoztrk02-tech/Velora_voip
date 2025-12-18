/**
 * Simple in-memory rate limiter for Vercel serverless functions
 *
 * NOTE: This is per-instance rate limiting. For distributed rate limiting
 * across multiple serverless instances, use Redis or a similar solution.
 */

const requestCounts = new Map();
const CLEANUP_INTERVAL = 60000; // Clean up every minute

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of requestCounts.entries()) {
    if (now - data.resetTime > data.windowMs) {
      requestCounts.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Rate limit middleware
 * @param {Object} options - Rate limiting options
 * @param {number} options.maxRequests - Max requests per window (default: 60)
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @param {string} options.keyPrefix - Prefix for rate limit key (default: 'rl')
 * @returns {Function} Middleware function
 */
function createRateLimiter(options = {}) {
  const {
    maxRequests = 60,
    windowMs = 60000,
    keyPrefix = 'rl',
  } = options;

  return (req, res, handler) => {
    // Get identifier (IP address or user ID)
    const ip = req.headers['x-forwarded-for'] ||
               req.headers['x-real-ip'] ||
               req.connection?.remoteAddress ||
               'unknown';

    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    // Get or create rate limit data
    let limiterData = requestCounts.get(key);

    if (!limiterData || now - limiterData.resetTime > windowMs) {
      // Create new window
      limiterData = {
        count: 0,
        resetTime: now,
        windowMs,
      };
      requestCounts.set(key, limiterData);
    }

    // Increment count
    limiterData.count++;

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - limiterData.count));
    res.setHeader('X-RateLimit-Reset', new Date(limiterData.resetTime + windowMs).toISOString());

    // Check if rate limit exceeded
    if (limiterData.count > maxRequests) {
      const retryAfter = Math.ceil((limiterData.resetTime + windowMs - now) / 1000);
      res.setHeader('Retry-After', retryAfter);

      return res.status(429).json({
        ok: false,
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s.`,
        retryAfter,
      });
    }

    // Continue to handler
    return handler(req, res);
  };
}

/**
 * Apply rate limiter to a handler
 */
function withRateLimit(handler, options) {
  const limiter = createRateLimiter(options);
  return (req, res) => limiter(req, res, handler);
}

module.exports = {
  createRateLimiter,
  withRateLimit,
};
