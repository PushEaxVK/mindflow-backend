import express from 'express';
import {
  fetchArticleById,
  fetchRecommendedArticles,
  createManyArticles,
  deleteAllArticles,
  fetchAllArticles,
  createSingleArticle,
  fetchSavedArticles,
  updateArticleById,
  deleteArticleById,
  saveArticle,
  removeSavedArticle,
  fetchPopularArticles,
} from '../controllers/articlesController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.get('/', fetchAllArticles);

router.get('/popular', fetchPopularArticles);

router.post('/create', authenticate, createSingleArticle);

router.patch('/:id', authenticate, updateArticleById);

router.delete('/:id', authenticate, deleteArticleById);

router.post('/:id/save', authenticate, saveArticle);

router.delete('/:id/save', authenticate, removeSavedArticle);

router.get('/saved', authenticate, fetchSavedArticles);

router.get('/recommend', fetchRecommendedArticles);

router.get('/:id', fetchArticleById);

router.post('/', createManyArticles);

router.delete('/all', deleteAllArticles);

export default router;
