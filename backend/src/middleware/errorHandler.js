const ApiError = require('../utils/apiError');

function notFound(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const payload = {
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message,
  };

  if (error.details) payload.details = error.details;
  if (process.env.NODE_ENV !== 'production' && statusCode === 500) payload.stack = error.stack;

  res.status(statusCode).json(payload);
}

module.exports = { notFound, errorHandler };
