import express from 'express';
import multer from 'multer';
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
} from '../controllers/articlesController.js';
import { createArticleFromForm } from '../controllers/articleCreateController.js'; // 🆕 Імпорт нового контролера
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Налаштування multer для обробки файлів (одне зображення)
const upload = multer({
  limits: {
    fileSize: 1024 * 1024, // 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Тільки зображення дозволені'));
    }
    cb(null, true);
  },
});

router.get('/', fetchAllArticles);

router.get('/popular', fetchPopularArticles);

// 🆕 ОНОВЛЕНО: створення статті тепер через multipart/form-data + авторизація
router.post(
  '/create',
  authenticate,
  upload.single('image'),
  createArticleFromForm,
);

router.delete('/all', deleteAllArticles);

router.delete('/:id', authenticate, deleteArticleById);

router.post('/:id/save', authenticate, saveArticle);

router.delete('/:id/save', authenticate, removeSavedArticle);

router.get('/saved', authenticate, fetchSavedArticles);

router.get('/recommend', fetchRecommendedArticles);

router.get('/:id', fetchArticleById);

router.post('/', createManyArticles);

export default router;
