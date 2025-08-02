import {
  getAllUsersService,
  getSavedArticlesService,
  getUserByIdService,
  getUserCreatedArticlesService,
} from '../services/usersServices.js';

export const getAllUsersController = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10 } = req.query;

    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    const { users, pagination } = await getAllUsersService({
      page: pageNum,
      perPage: perPageNum,
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

    const { page = 1, perPage = 10 } = req.query;

    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    const { userArticles, pagination } = await getUserCreatedArticlesService({
      userId,
      page: pageNum,
      perPage: perPageNum,
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
    const { page = 1, perPage = 10 } = req.query;
    const pageNum = parseInt(page);
    const perPageNum = parseInt(perPage);

    const { articles, pagination } = await getSavedArticlesService({
      userId,
      page: pageNum,
      perPage: perPageNum,
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

export const saveArticleToUserController = async (req, res, next) => {};

export const deleteArticleFromUserController = async (req, res, next) => {};
