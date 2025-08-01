import createHttpError from 'http-errors';

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { stripUnknown: true });

    if (error) {
      return next(createHttpError(400, error.message));
    }

    Object.assign(req.query, value);
    next();
  };
};
