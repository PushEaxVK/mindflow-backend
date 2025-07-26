import { isHttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err); 
  }

  if (isHttpError(err)) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      data: err,
    });
  }

  return res.status(500).json({
    status: 500,
    message: 'Something went wrong!',
    error: err.message,
  });
};



