import express from 'express';
import {
  fetchArticleById,
  fetchRecommendedArticles,
  createManyArticles,
  deleteAllArticles,
  fetchAllArticles,
  fetchSavedArticles,
  deleteArticleById,
  saveArticle,
  removeSavedArticle,
  fetchPopularArticles,
  updateArticleController,
  createArticleController,
} from '../controllers/articlesController.js';

import { authenticate } from '../middlewares/authenticate.js';
import {
  articleSchema,
  updateArticleSchema,
} from '../validation/articlesValidation.js';
import { validateBody } from '../middlewares/validateBody.js';
import { upload } from '../middlewares/multer.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';

const router = express.Router();

router.get('/', fetchAllArticles);

router.get('/:id', fetchArticleById);

router.delete('/:id', authenticate, deleteArticleById);

router.post(
  '/create',
  authenticate,
  upload.single('img'),
  validateBody(articleSchema),
  ctrlWrapper(createArticleController),
);

router.patch(
  '/:id',
  authenticate,
  upload.single('img'),
  validateBody(updateArticleSchema),
  ctrlWrapper(updateArticleController),
);

router.get('/popular', fetchPopularArticles);

router.delete('/all', deleteAllArticles);

router.post('/:id/save', authenticate, saveArticle);

router.delete('/:id/save', authenticate, removeSavedArticle);

router.get('/saved', authenticate, fetchSavedArticles);

router.get('/recommend', fetchRecommendedArticles);

router.post('/', createManyArticles);

export default router;
