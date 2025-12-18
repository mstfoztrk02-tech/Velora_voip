const crypto = require('crypto');

/**
 * Logger utility with PII masking
 */

// Generate request ID
function generateRequestId() {
  return crypto.randomBytes(8).toString('hex');
}

// Mask sensitive data
function maskPII(data) {
  if (!data) return data;

  // Clone to avoid mutating original
  const masked = JSON.parse(JSON.stringify(data));

  // Patterns to mask
  const sensitiveKeys = [
    'password',
    'secret',
    'token',
    'api_key',
    'apiKey',
    'auth',
    'authorization',
  ];

  function maskObject(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();

        // Mask sensitive keys
        if (sensitiveKeys.some(sk => lowerKey.includes(sk))) {
          obj[key] = '***MASKED***';
        }
        // Mask phone numbers (assuming 10+ digit numbers)
        else if (typeof obj[key] === 'string' && /^\d{10,}$/.test(obj[key])) {
          obj[key] = obj[key].substring(0, 3) + '****' + obj[key].substring(obj[key].length - 3);
        }
        // Mask email addresses
        else if (typeof obj[key] === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj[key])) {
          const parts = obj[key].split('@');
          obj[key] = parts[0].substring(0, 2) + '***@' + parts[1];
        }
        // Recursively mask nested objects
        else if (typeof obj[key] === 'object') {
          maskObject(obj[key]);
        }
      }
    }

    return obj;
  }

  return maskObject(masked);
}

// Log levels
const LogLevel = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

class Logger {
  constructor(context = 'API') {
    this.context = context;
  }

  log(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const maskedMeta = maskPII(meta);

    const logEntry = {
      timestamp,
      level,
      context: this.context,
      message,
      ...maskedMeta,
    };

    // In production, you might send this to a logging service
    // For now, use console with appropriate method
    const logMethod = {
      [LogLevel.DEBUG]: console.debug,
      [LogLevel.INFO]: console.log,
      [LogLevel.WARN]: console.warn,
      [LogLevel.ERROR]: console.error,
    }[level] || console.log;

    logMethod(JSON.stringify(logEntry));
  }

  debug(message, meta) {
    if (process.env.NODE_ENV === 'development') {
      this.log(LogLevel.DEBUG, message, meta);
    }
  }

  info(message, meta) {
    this.log(LogLevel.INFO, message, meta);
  }

  warn(message, meta) {
    this.log(LogLevel.WARN, message, meta);
  }

  error(message, meta) {
    this.log(LogLevel.ERROR, message, meta);
  }

  // Create child logger with additional context
  child(additionalContext) {
    const childLogger = new Logger(`${this.context}:${additionalContext}`);
    return childLogger;
  }
}

// Logging middleware
function withLogging(handler, context) {
  return async (req, res) => {
    const requestId = generateRequestId();
    const logger = new Logger(context || 'API');

    // Attach logger to request
    req.logger = logger;
    req.requestId = requestId;

    // Log request
    logger.info('Request received', {
      requestId,
      method: req.method,
      url: req.url,
      body: req.body,
    });

    const startTime = Date.now();

    try {
      await handler(req, res);

      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        requestId,
        duration,
        status: res.statusCode,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Request failed', {
        requestId,
        duration,
        error: error.message,
        stack: error.stack,
      });

      if (!res.headersSent) {
        res.status(500).json({
          ok: false,
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          requestId,
        });
      }
    }
  };
}

module.exports = {
  Logger,
  LogLevel,
  generateRequestId,
  maskPII,
  withLogging,
};
