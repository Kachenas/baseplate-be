const { ZodError } = require('zod');
const { ApiError } = require('../utils/ApiError');

/**
 * Validate request data against a Zod schema
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const data = schema.parse(req[source]);
      req[source] = data;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        next(ApiError.badRequest(message));
      } else {
        next(error);
      }
    }
  };
};

module.exports = { validate };
