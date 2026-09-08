export const errorHandler = (err, req, res, next) => {
  console.error('❌ [Error Middleware]', err.stack || err);

  // Prisma Unique Constraint Error
  if (err.code === 'P2002') {
    const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `A record with the same ${fields} already exists. Please use a unique value.`
    });
  }

  // Prisma Record Not Found
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found. The requested resource does not exist.'
    });
  }

  // Prisma Foreign Key Constraint
  if (err.code === 'P2003') {
    return res.status(400).json({
      success: false,
      message: 'Related record does not exist. Please check the reference.'
    });
  }

  // Prisma Constraint Violation
  if (err.code === 'P2004') {
    return res.status(400).json({
      success: false,
      message: 'Constraint violation: ' + err.meta?.message || 'Invalid data provided.'
    });
  }

  // Prisma Connection Error
  if (err.code === 'P1001' || err.code === 'P1002') {
    return res.status(503).json({
      success: false,
      message: 'Database connection error. Please try again later.'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication token. Please login again.'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token expired. Please login again.'
    });
  }

  // Validation errors
  if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
    return res.status(400).json({
      success: false,
      message: err.message || 'Validation error. Please check your input.'
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};