const ApiError = require('../utils/ApiError');

const notFoundHandler = (req, res, next) => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

module.exports = notFoundHandler;
