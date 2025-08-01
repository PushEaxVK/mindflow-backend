import {
  getArticleById,
  getRecommendedArticles,
  getSavedArticles,
  getPopularArticles,
  getPaginatedArticles,
} from '../services/articlesService.js';
import { readFile } from 'fs/promises';
import path from 'path';
import Article from '../db/models/articleModel.js';
import User from '../db/models/users.js';
import { ROOT_DIR } from '../constants/paths.js';
import mongoose from 'mongoose';

export const fetchPopularArticles = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;
    const articles = await getPopularArticles(limit);
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

export const fetchAllArticles = async (req, res, next) => {
  try {
    const { page, limit, sort, order, tags, author } = req.query;
    const data = await getPaginatedArticles({
      page,
      limit,
      sort,
      order,
      tags,
      author,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const fetchArticleById = async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    next(err);
  }
};

export const fetchRecommendedArticles = async (req, res, next) => {
  try {
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const articles = await getRecommendedArticles(tags);
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

export const createManyArticles = async (req, res, next) => {
  try {
    const filePath = path.join(ROOT_DIR, '../articles.json');
    const data = await readFile(filePath, 'utf-8');
    const articles = JSON.parse(data);

    const normalizedArticles = articles.map((article) => {
      return {
        ...article,
        _id: new mongoose.Types.ObjectId(article._id?.$oid || article._id),
        author: new mongoose.Types.ObjectId(
          article.author?.$oid || article.author,
        ),
      };
    });

    await Article.insertMany(normalizedArticles);

    res.status(201).json({ message: 'Articles added successfully' });
  } catch (err) {
    next(err);
  }
};

export const deleteAllArticles = async (req, res, next) => {
  try {
    await Article.deleteMany({});
    res.json({ message: 'All articles deleted' });
  } catch (err) {
    next(err);
  }
};

// ❌ Вимкнено: createSingleArticle
// Замість цього використовується createArticleFromForm з підтримкою файлів

/*
export const createSingleArticle = async (req, res, next) => {
  try {
    const newArticle = await Article.create({
      ...req.body,
      author: req.user._id,
    });
    res.status(201).json(newArticle);
  } catch (err) {
    next(err);
  }
};
*/

export const fetchSavedArticles = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const articles = await getSavedArticles(userId);
    res.json(articles);
  } catch (err) {
    next(err);
  }
};

export const saveArticle = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const articleId = req.params.id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(userId);
    if (user.savedArticles.includes(articleId)) {
      return res.status(400).json({ message: 'Article already saved' });
    }

    user.savedArticles.push(articleId);
    await user.save();

    res.json({ message: 'Article saved successfully' });
  } catch (err) {
    next(err);
  }
};

export const removeSavedArticle = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const articleId = req.params.id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(userId);

    const initialLength = user.savedArticles.length;
    user.savedArticles = user.savedArticles.filter(
      (id) => id.toString() !== articleId,
    );

    if (user.savedArticles.length === initialLength) {
      return res.status(400).json({ message: 'Article was not saved' });
    }

    await user.save();
    res.json({ message: 'Article removed from saved' });
  } catch (err) {
    next(err);
  }
};

export const updateArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    if (
      article.author &&
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You are not the author or admin' });
    }
    const updatedArticle = await Article.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true },
    );
    res.json(updatedArticle);
  } catch (err) {
    next(err);
  }
};

export const deleteArticleById = async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }
    if (
      article.author &&
      article.author.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res
        .status(403)
        .json({ message: 'You are not the author or admin' });
    }
    await Article.findByIdAndDelete(req.params.id);
    res.json({ message: 'Article deleted successfully' });
  } catch (err) {
    next(err);
  }
};
