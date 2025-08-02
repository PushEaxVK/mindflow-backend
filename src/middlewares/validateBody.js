import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });
    next();
  } catch (error) {
    const messages = error.details.map((detail) => detail.message).join(', ');

    const newError = createHttpError(400, messages, {
      errors: error.details,
    });

    next(newError);
  }
};
