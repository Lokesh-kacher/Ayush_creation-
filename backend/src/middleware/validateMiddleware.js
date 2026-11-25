const ApiError = require('../utils/ApiError');

/**
 * Zod Validation Middleware
 * Validates request data against a given Zod schema
 */
const validate = (schema) => (req, res, next) => {
  try {
    const validatedData = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });

    // Replace with parsed/sanitized data
    if (validatedData.body) req.body = validatedData.body;
    if (validatedData.query) req.query = validatedData.query;
    if (validatedData.params) req.params = validatedData.params;

    next();
  } catch (error) {
    if (error.errors) {
      const messages = error.errors.map(err => {
        const field = err.path.slice(1).join('.');
        return `${field || 'Field'}: ${err.message}`;
      });
      return next(new ApiError(400, 'Validation failed', messages));
    }
    next(error);
  }
};

module.exports = validate;
