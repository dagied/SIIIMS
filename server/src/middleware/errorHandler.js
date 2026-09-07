export const errorHandler = (err, req, res, next) => {
  console.error(' [Error Middleware]', err.stack || err);

  if (err.code === 'P2002') {
    const fields = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : 'field';
    return res.status(409).json({
      success: false,
      message: `An asset with the same ${fields} already exists. Use a unique value.`
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
