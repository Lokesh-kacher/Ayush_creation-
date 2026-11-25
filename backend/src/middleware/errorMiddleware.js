const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    error = new ApiError(404, message);
  }

  // Handle Mongoose Duplicate Key (Code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for ${field}. Please use another value.`;
    error = new ApiError(409, message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(val => val.message);
    error = new ApiError(400, 'Validation Error', errors);
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid authentication token');
  }
  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Authentication token has expired. Please log in again.');
  }

  // Handle Zod Validation Errors
  if (err.name === 'ZodError') {
    const errors = (err.errors || []).map(e => `${e.path.join('.')}: ${e.message}`);
    error = new ApiError(400, 'Request validation failed', errors);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  const response = {
    success: false,
    statusCode,
    message,
    errors: error.errors || []
  };

  // Only include stack trace in development
  if (env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
