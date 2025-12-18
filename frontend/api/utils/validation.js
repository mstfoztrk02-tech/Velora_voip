/**
 * Input validation utilities
 */

// Validation error class
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
  }
}

// Validators
const validators = {
  /**
   * Validate required field
   */
  required(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      throw new ValidationError(`${fieldName} is required`, fieldName);
    }
    return value;
  },

  /**
   * Validate string length
   */
  string(value, fieldName, options = {}) {
    const { min, max, pattern } = options;

    if (typeof value !== 'string') {
      throw new ValidationError(`${fieldName} must be a string`, fieldName);
    }

    if (min !== undefined && value.length < min) {
      throw new ValidationError(`${fieldName} must be at least ${min} characters`, fieldName);
    }

    if (max !== undefined && value.length > max) {
      throw new ValidationError(`${fieldName} must be at most ${max} characters`, fieldName);
    }

    if (pattern && !pattern.test(value)) {
      throw new ValidationError(`${fieldName} has invalid format`, fieldName);
    }

    return value;
  },

  /**
   * Validate number
   */
  number(value, fieldName, options = {}) {
    const { min, max, integer } = options;

    const num = Number(value);

    if (isNaN(num)) {
      throw new ValidationError(`${fieldName} must be a number`, fieldName);
    }

    if (integer && !Number.isInteger(num)) {
      throw new ValidationError(`${fieldName} must be an integer`, fieldName);
    }

    if (min !== undefined && num < min) {
      throw new ValidationError(`${fieldName} must be at least ${min}`, fieldName);
    }

    if (max !== undefined && num > max) {
      throw new ValidationError(`${fieldName} must be at most ${max}`, fieldName);
    }

    return num;
  },

  /**
   * Validate phone number
   */
  phoneNumber(value, fieldName) {
    const cleaned = String(value).replace(/\D/g, '');

    if (cleaned.length < 10 || cleaned.length > 15) {
      throw new ValidationError(`${fieldName} must be a valid phone number`, fieldName);
    }

    if (!/^\d+$/.test(cleaned)) {
      throw new ValidationError(`${fieldName} must contain only digits`, fieldName);
    }

    return cleaned;
  },

  /**
   * Validate array
   */
  array(value, fieldName, options = {}) {
    const { min, max, itemValidator } = options;

    if (!Array.isArray(value)) {
      throw new ValidationError(`${fieldName} must be an array`, fieldName);
    }

    if (min !== undefined && value.length < min) {
      throw new ValidationError(`${fieldName} must have at least ${min} items`, fieldName);
    }

    if (max !== undefined && value.length > max) {
      throw new ValidationError(`${fieldName} must have at most ${max} items`, fieldName);
    }

    if (itemValidator) {
      value.forEach((item, index) => {
        try {
          itemValidator(item, `${fieldName}[${index}]`);
        } catch (err) {
          throw new ValidationError(`${fieldName}[${index}]: ${err.message}`, fieldName);
        }
      });
    }

    return value;
  },

  /**
   * Validate enum value
   */
  enum(value, fieldName, allowedValues) {
    if (!allowedValues.includes(value)) {
      throw new ValidationError(
        `${fieldName} must be one of: ${allowedValues.join(', ')}`,
        fieldName
      );
    }
    return value;
  },

  /**
   * Validate email
   */
  email(value, fieldName) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(value)) {
      throw new ValidationError(`${fieldName} must be a valid email`, fieldName);
    }

    return value;
  },

  /**
   * Validate URL
   */
  url(value, fieldName) {
    try {
      new URL(value);
      return value;
    } catch (err) {
      throw new ValidationError(`${fieldName} must be a valid URL`, fieldName);
    }
  },
};

/**
 * Validation middleware
 */
function withValidation(handler, schema) {
  return async (req, res) => {
    try {
      // Validate based on schema
      const validated = {};

      for (const [field, rules] of Object.entries(schema)) {
        const value = req.body?.[field] || req.query?.[field];

        try {
          // Apply each rule
          let currentValue = value;

          for (const rule of rules) {
            if (typeof rule === 'function') {
              currentValue = rule(currentValue, field);
            } else if (typeof rule === 'object') {
              const { validator, ...options } = rule;
              currentValue = validators[validator](currentValue, field, options);
            }
          }

          validated[field] = currentValue;
        } catch (err) {
          if (err instanceof ValidationError) {
            return res.status(400).json({
              ok: false,
              code: 'INVALID_INPUT',
              message: err.message,
              field: err.field,
            });
          }
          throw err;
        }
      }

      // Attach validated data to request
      req.validated = validated;

      // Continue to handler
      return handler(req, res);
    } catch (error) {
      return res.status(500).json({
        ok: false,
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: error.message,
      });
    }
  };
}

module.exports = {
  validators,
  ValidationError,
  withValidation,
};
