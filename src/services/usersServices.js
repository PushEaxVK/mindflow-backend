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

  const filter = {
    $or: [{ ownerId: userId }, { author: userId }],
  };

  const total = await Article.countDocuments(filter);
  // const total = await Article.countDocuments({ ownerId: userId });

  const userArticles = await Article.find({ ownerId: userId })
    .populate('ownerId', 'name avatarUrl')
    .skip(skip)
    .limit(perPage)
    .lean()
    .exec();

  const pagination = calculatePaginationData({ total, perPage, page });

  return { userArticles, pagination };
};

export const saveArticleToUserService = async ({ userId, articleId }) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isAlreadySaved = user.savedArticles.includes(articleId);

  if (isAlreadySaved) {
    return article;
  }

  user.savedArticles.push(articleId);

  try {
    await user.save();
  } catch (error) {
    throw createHttpError(500, 'Failed to save article to user');
  }

  try {
    article.rate = (article.rate || 0) + 1;
    await article.save();
  } catch (error) {
    user.savedArticles.pop();
    await user.save();
    throw createHttpError(500, 'Failed to update article rate');
  }

  return article;
};

export const deleteArticleFromUserService = async ({ userId, articleId }) => {
  const article = await Article.findById(articleId);
  if (!article) {
    throw createHttpError(404, 'Article not found');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  if (!user.savedArticles.includes(articleId)) {
    throw createHttpError(404, 'Article not found in saved articles');
  }

  const index = user.savedArticles.indexOf(articleId);
  user.savedArticles.splice(index, 1);

  await user.save();

  if (article.rate > 0) {
    article.rate -= 1;
    await article.save();
  }

  return article;
};
export const getUserSavedArticlesService = async ({
  userId,
  page,
  perPage,
}) => {
  const skip = (page - 1) * perPage;

  const user = await User.findById(userId).select('savedArticles').lean();
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const total = user.savedArticles.length;

  const articles = await User.findById(userId)
    .select('savedArticles')
    .populate({
      path: 'savedArticles',
      select: 'title desc img rate date ownerId',
      populate: {
        path: 'ownerId',
        select: 'name',
      },
      options: {
        skip: skip,
        limit: perPage,
      },
    })
    .lean();

  const pagination = calculatePaginationData({ total, perPage, page });

  return {
    articles: articles?.savedArticles || [],
    pagination,
  };
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
