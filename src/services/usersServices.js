import createHttpError from 'http-errors';
import Article from '../db/models/articleModel.js';
import User from '../db/models/users.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllUsersService = async ({ page, perPage }) => {
  const skip = (page - 1) * perPage;
  const total = await User.countDocuments();

  const users = await User.find()
    .select('-password -email')
    .skip(skip)
    .limit(perPage)
    .exec();

  const paginationData = calculatePaginationData({
    total,
    perPage,
    page,
  });

  return { users, paginationData };
};

export const getUserByIdService = async (id) => {
  const user = await User.findById(id).select('-password -email').lean().exec();

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  return user;
};

export const getUserCreatedArticlesService = async ({
  userId,
  page,
  perPage,
}) => {
  const skip = (page - 1) * perPage;

  const total = await Article.countDocuments({ author: userId });

  const userArticles = await Article.find({ author: userId })
    .populate('author', 'name avatarUrl')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(perPage)
    .lean()
    .exec();

  const pagination = calculatePaginationData({ total, perPage, page });

  return { userArticles, pagination };
};

export const getSavedArticlesService = async () => {};
