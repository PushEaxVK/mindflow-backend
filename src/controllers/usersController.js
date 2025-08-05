import {
  getAllUsersService,
  saveArticleToUserService,
  getUserByIdService,
  getUserCreatedArticlesService,
  getUserSavedArticlesService,
  deleteArticleFromUserService,
  getPopularUsersService,
} from '../services/usersServices.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';

export const getAllUsersController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);

    const { users, pagination } = await getAllUsersService({
      page,
      perPage,
    });

    res.status(200).json({
      status: 200,
      message: 'Users fetched successfully',
      data: {
        users,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserByIdController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await getUserByIdService(userId);
    res.status(200).json({
      status: 200,
      message: 'User fetched successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserCreatedArticlesController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const { page, perPage } = parsePaginationParams(req.query);

    const { userArticles, pagination } = await getUserCreatedArticlesService({
      userId,
      page,
      perPage,
    });

    res.status(200).json({
      status: 200,
      message: 'Users articles fetched successfully',
      data: {
        userArticles,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUserSavedArticlesController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { page, perPage } = parsePaginationParams(req.query);

    const { articles, pagination } = await getUserSavedArticlesService({
      userId,
      page,
      perPage,
    });

    res.status(200).json({
      status: 200,
      message: 'Saved articles fetched successfully',
      data: {
        articles,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const saveArticleToUserController = async (req, res, next) => {
  try {
    const { userId, articleId } = req.params;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'You are not allowed to save an article for another user',
      });
    }

    await saveArticleToUserService({ userId, articleId });

    res.status(201).json({
      status: 201,
      message: 'Article successfully saved',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteArticleFromUserController = async (req, res, next) => {
  try {
    const { userId, articleId } = req.params;

    if (req.user._id.toString() !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'You are not allowed to delete an article for another user',
      });
    }
    await deleteArticleFromUserService({ userId, articleId });

    res.status(201).json({
      status: 201,
      message: 'Article successfully removed from saved list',
    });
  } catch (error) {
    next(error);
  }
};

export const getPopularUsersController = async (req, res, next) => {
  try {
    const { page, perPage } = parsePaginationParams(req.query);

    const { users, pagination } = await getPopularUsersService({
      page,
      perPage,
    });

    res.status(200).json({
      status: 200,
      message: 'Popular users fetched successfully',
      data: {
        users,
        pagination,
      },
    });
  } catch (error) {
    next(error);
  }
};
