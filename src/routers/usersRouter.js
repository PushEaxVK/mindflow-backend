import { Router } from 'express';

import {
  getAllUsersController,
  getUserByIdController,
  getUserCreatedArticlesController,
  getUserSavedArticlesController,
  saveArticleToUserController,
  deleteArticleFromUserController,
} from '../controllers/usersController.js';
import { isValidId } from '../middlewares/isValidId.js';
import { authenticate } from '../middlewares/authenticate.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const usersRouter = Router();

usersRouter.get('/', ctrlWrapper(getAllUsersController));

usersRouter.get('/:userId', isValidId, ctrlWrapper(getUserByIdController));

usersRouter.get(
  '/:userId/articles',
  isValidId,
  ctrlWrapper(getUserCreatedArticlesController),
);

usersRouter.get(
  '/:userId/saved-articles',
  authenticate,
  ctrlWrapper(getUserSavedArticlesController),
);

usersRouter.post(
  '/:userId/saved-articles/:articleId',
  authenticate,
  isValidId,
  ctrlWrapper(saveArticleToUserController),
);

usersRouter.delete(
  '/:userId/saved-articles/:articleId',
  authenticate,
  isValidId,
  ctrlWrapper(deleteArticleFromUserController),
);

export default usersRouter;
