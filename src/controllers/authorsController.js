import createHttpError from 'http-errors';
import { getAuthorById } from '../services/authors.js';

export const authorProfileController = async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const currentUserId = req.user?._id?.toString();
    const query = req.query;

    const author = await getAuthorById({
      authorId,
      currentUserId,
      query,
    });

    if (!author) {
      throw createHttpError(404, 'Author not found');
    }
    res.status(200).json({
      status: 200,
      message: `Successfully retrieved author profile.`,
      data: author,
    });
  } catch (err) {
    next(err);
  }
};
