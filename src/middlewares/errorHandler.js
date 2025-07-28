import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  console.error('Error caught:', err);
  
  if (res.headersSent) {
    return next(err); 
  }

  if (isHttpError(err)) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      data: null,
    });
  }

  return res.status(500).json({
    status: 500,
    message: 'Something went wrong!',
    error: err.message || 'Unknown error',
  });
};

