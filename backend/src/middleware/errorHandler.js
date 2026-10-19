/**
 * Centralized error handling middleware.
 * Handles Zod validation errors, known app errors, and unexpected errors.
 */
export function errorHandler(err, req, res, _next) {
  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation error',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Application errors with status code
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  // Log unexpected errors
  console.error('Unexpected error:', err);

  // Don't expose stack traces in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message || 'Internal server error';

  return res.status(500).json({ error: message });
}

/**
 * Creates an application error with a status code.
 */
export function createAppError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
