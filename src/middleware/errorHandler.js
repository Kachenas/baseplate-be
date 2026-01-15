const { ApiError } = require("../utils/ApiError");
const { logger } = require("../utils/logger");
const { env } = require("../config/env");

/**
 * Convert non-ApiError to ApiError
 */
const errorConverter = (
  /** @type {Error & {statusCode?: number}} */ err,
  /** @type {import('express').Request} */ _req,
  /** @type {import('express').Response} */ _res,
  /** @type {import('express').NextFunction} */ next
) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || 500;
    const message = error.message || "Internal Server Error";
    error = new ApiError(statusCode, message, false, err.stack);
  }

  next(error);
};

/**
 * Global error handler
 */
const errorHandler = (
  /** @type {ApiError} */ err,
  /** @type {import('express').Request} */ req,
  /** @type {import('express').Response} */ res,
  /** @type {import('express').NextFunction} */ _next
) => {
  const { statusCode, message, isOperational, stack } = err;

  // Log error
  if (!isOperational) {
    logger.error({
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  const response = {
    success: false,
    message,
    ...(env.NODE_ENV === "development" && {
      stack,
      isOperational,
    }),
  };

  res.status(statusCode).json(response);
};

/**
 * Handle 404 Not Found
 */
const notFoundHandler = (
  /** @type {import('express').Request} */ req,
  /** @type {import('express').Response} */ _res,
  /** @type {import('express').NextFunction} */ next
) => {
  next(ApiError.notFound(`Route ${req.originalUrl} not found`));
};

module.exports = { errorConverter, errorHandler, notFoundHandler };
