import { isValidObjectId } from 'mongoose';
import createHttpError from 'http-errors';

export const isValidId = (req, res, next) => {
  const id = req.params?.id;

  if (!id || !isValidObjectId(id)) {
    return next(createHttpError(400, 'Bad Request: Invalid or missing ID'));
  }

  next();
};

// import { isValidObjectId } from 'mongoose';
// import createHttpError from 'http-errors';

// export const isValidId = (req, res, next) => {
//   const { id } = req.params;
//   if (!isValidObjectId(id)) {
//     throw createHttpError(400, 'Bad Request: Invalid ID');
//   }

//   next();
// };
