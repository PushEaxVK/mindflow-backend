import createHttpError from 'http-errors';

import { getUserArticles, getUserById } from '../services/users';

export const getUserInfoController = async (req, res) => {
  const userId = req.user._id;

  const user = await getUserById(userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  res.status(200).json(user);
};

export const getUserArticlesController = async (req, res) => {
  const { _id: userId } = req.user;

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await getUserArticles(userId, page, limit);

  res.status(200).json(result);
};
