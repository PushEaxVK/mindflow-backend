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

  const pagination = calculatePaginationData({
    total,
    perPage,
    page,
  });

  return { users, pagination };
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

  const total = await Article.countDocuments({ ownerId: userId });

  const userArticles = await Article.find({ ownerId: userId })
    .populate('ownerId', 'name')
    .skip(skip)
    .limit(perPage)
    .lean()
    .exec();

  const pagination = calculatePaginationData({ total, perPage, page });

  return { userArticles, pagination };
};

export const getUserSavedArticlesService = async (userId, page, perPage) => {
  const skip = (page - 1) * perPage;

  const user = await User.findById(userId)
    .select('savedArticles')
    .exec()
    .lean();

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const savedArticleIds = user.savedArticles || [];

  const total = savedArticleIds.length;
  const paginatedIds = savedArticleIds.slice(skip, skip + perPage);

  const articles = await Article.find({ _id: { $in: paginatedIds } })
    .populate('ownerId', 'name')
    .lean();

  // const articles = user.savedArticles || [];
  const pagination = calculatePaginationData({ total, perPage, page });

  return {
    articles,
    pagination,
  };
};

export const saveArticleToUserService = async (userId, articleId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (!Array.isArray(user.savedArticles)) {
    user.savedArticles = [];
  }

  const alreadySaved = user.savedArticles.includes(articleId);
  if (alreadySaved) {
    throw createHttpError(409, 'Article is already saved');
  }

  user.savedArticles.push(articleId);
  await user.save();

  article.rate = (article.rate || 0) + 1;
  await article.save();

  return article;
};

export const deleteArticleFromUserService = async (userId, articleId) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (!Array.isArray(user.savedArticles)) {
    user.savedArticles = [];
  }

  const index = user.savedArticles.findIndex(
    (id) => id.toString() === articleId.toString(),
  );

  if (index === -1) {
    throw createHttpError(404, 'Article not found in saved articles');
  }

  user.savedArticles.splice(index, 1);
  await user.save();

  if (article && article.rate > 0) {
    article.rate -= 1;
    await article.save();
  }

  return article;
};

export const getPopularUsersService = async ({ page, perPage }) => {
  const skip = (page - 1) * perPage;

  const total = await User.countDocuments();

  const users = await User.find()
    .sort({ articlesAmount: -1 })
    .skip(skip)
    .limit(perPage)
    .select('name avatarUrl articlesAmount')
    .lean();

  const pagination = calculatePaginationData({
    total,
    perPage,
    page,
  });

  return { users, pagination };
};
