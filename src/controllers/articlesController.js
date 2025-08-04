import {
  getArticleById,
  // getRecommendedArticles,
  // getSavedArticles,
  // getPopularArticles,
  getPaginatedArticles,
  // createArticleService,
  updateArticleService,
} from '../services/articlesService.js';
// import { readFile } from 'fs/promises';
// import path from 'path';
import Article from '../db/models/articleModel.js';
// import User from '../db/models/users.js';
// import { ROOT_DIR } from '../constants/paths.js';
// import mongoose from 'mongoose';
// import createHttpError from 'http-errors';
// import { articleSchema } from '../validation/articlesValidation.js';
import { saveFiles } from '../utils/saveFiles.js';

import createHttpError from 'http-errors';

// export const fetchPopularArticles = async (req, res, next) => {
//   try {
//     const limit = Number(req.query.limit) || 10;
//     const articles = await getPopularArticles(limit);
//     res.json(articles);
//   } catch (err) {
//     next(err);
//   }
// };


// GET /articles — список статей (з пагінацією, фільтрами, сортуванням)
export const fetchAllArticles = async (req, res, next) => {
  try {
    const { page, limit, sort, order, tags, ownerId } = req.query;
    const data = await getPaginatedArticles({
      page,
      limit,
      sort,
      order,
      tags,
      ownerId,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
};


// GET /articles/{id} — отримати статтю по id

export const fetchArticleById = async (req, res, next) => {
  try {
    const article = await getArticleById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (err) {
    next(err);
  }
};


// POST /articles — створити статтю
export const createArticleController = async (req, res, next) => {
  try {
    const { title, article, date, author, ownerId } = req.body;

    if (!title || title.length < 3 || title.length > 48) {
      throw createHttpError(400, 'Title must be between 3 and 48 characters');
    }

    if (!article || article.length < 100 || article.length > 4000) {
      throw createHttpError(400, 'Article must be between 100 and 4000 characters');
    }

    if (!date || isNaN(Date.parse(date))) {
      throw createHttpError(400, 'Date is required and must be a valid date');
    }

    if (!author || author.length < 4 || author.length > 50) {
      throw createHttpError(400, 'Author must be between 4 and 50 characters');
    }

    if (!req.file) {
      throw createHttpError(400, 'Image is required');
    }

    if (req.file.size > 1024 * 1024) {
      throw createHttpError(400, 'Image size exceeds 1MB');
    }

    const newArticle = await Article.create({
      title,
      article,
      img: req.file ? req.file.filename : null,
      date: new Date(date),
      ownerId,
    });

    res.status(201).json({ _id: newArticle._id });
  } catch (err) {
    next(err);
  }
};


// DELETE /articles/{id} — видалити статтю
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

// export const createArticleController = async (req, res, next) => {
//   try {
//     const image = await saveFiles(req.file);

//     const articleData = {
//       ...req.body,
//       img: image,
//       rate: req.body.rate || 0,
//     };

//     const newArticle = await createArticleService(articleData);

//     const article = newArticle.toObject();
//     article.date = new Date(article.date).toISOString().split('T')[0];

//     res.status(201).json({
//       status: 201,
//       message: 'Successfully created an article',
//       data: { ...article },
//     });
//   } catch (error) {
//     next(error);
//   }
// };



// PUT /articles/{id} — редагувати статтю
export const updateArticleController = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    if (!articleId) {
      return res.status(400).json({
        status: 400,
        message: 'Article ID is required',
      });
    }

    const updatedData = {
      ...req.body,
      rate: req.body.rate || 0,
    };

    if (req.file) {
      const imageUrl = await saveFiles(req.file);
      updatedData.img = imageUrl;
    }

    const updatedArticle = await updateArticleService(articleId, updatedData);

    if (!updatedArticle) {
      throw createHttpError(404, 'Article not found');
    }
    const article = updatedArticle.toObject();
    article.date = new Date(article.date).toISOString().split('T')[0];

    if (!updatedArticle) {
      return res
        .status(404)
        .json({ status: 404, message: 'Article not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Article updated successfully',
      data: { ...article },
    });
  } catch (err) {
    next(err);
  }
};

// export const fetchRecommendedArticles = async (req, res, next) => {
//   try {
//     const tags = req.query.tags ? req.query.tags.split(',') : [];
//     const articles = await getRecommendedArticles(tags);
//     res.json(articles);
//   } catch (err) {
//     next(err);
//   }
// };

// export const createManyArticles = async (req, res, next) => {
//   try {
//     const filePath = path.join(ROOT_DIR, '../articles.json');
//     const data = await readFile(filePath, 'utf-8');
//     const articles = JSON.parse(data);

//     const normalizedArticles = articles.map((article) => {
//       return {
//         ...article,
//         _id: new mongoose.Types.ObjectId(article._id?.$oid || article._id),
//         author: new mongoose.Types.ObjectId(
//           article.author?.$oid || article.author,
//         ),
//       };
//     });

//     await Article.insertMany(normalizedArticles);

//     res.status(201).json({ message: 'Articles added successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// export const deleteAllArticles = async (req, res, next) => {
//   try {
//     await Article.deleteMany({});
//     res.status(200).json({
//       status: 200,
//       message: 'Article have been deleted successfully',
//     });
//   } catch (err) {
//     next(err);
//   }
// };

// export const fetchSavedArticles = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const articles = await getSavedArticles(userId);
//     res.json(articles);
//   } catch (err) {
//     next(err);
//   }
// };

// export const saveArticle = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const articleId = req.params.id;

//     const article = await Article.findById(articleId);
//     if (!article) {
//       return res.status(404).json({ message: 'Article not found' });
//     }

//     const user = await User.findById(userId);
//     if (user.savedArticles.includes(articleId)) {
//       return res.status(400).json({ message: 'Article already saved' });
//     }

//     user.savedArticles.push(articleId);
//     await user.save();

//     res.json({ message: 'Article saved successfully' });
//   } catch (err) {
//     next(err);
//   }
// };

// export const removeSavedArticle = async (req, res, next) => {
//   try {
//     const userId = req.user._id;
//     const articleId = req.params.id;

//     const article = await Article.findById(articleId);
//     if (!article) {
//       return res.status(404).json({ message: 'Article not found' });
//     }

//     const user = await User.findById(userId);

//     const initialLength = user.savedArticles.length;
//     user.savedArticles = user.savedArticles.filter(
//       (id) => id.toString() !== articleId,
//     );

//     if (user.savedArticles.length === initialLength) {
//       return res.status(400).json({ message: 'Article was not saved' });
//     }

//     await user.save();
//     res.json({ message: 'Article removed from saved' });
//   } catch (err) {
//     next(err);
//   }
// };

// export const updateArticleById = async (req, res, next) => {
//   try {
//     const article = await Article.findById(req.params.id);
//     if (!article) {
//       return res.status(404).json({ message: 'Article not found' });
//     }
//     if (
//       article.author &&
//       article.author.toString() !== req.user._id.toString() &&
//       req.user.role !== 'admin'
//     ) {
//       return res
//         .status(403)
//         .json({ message: 'You are not the author or admin' });
//     }
//     const updatedArticle = await Article.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true, runValidators: true },
//     );
//     res.json(updatedArticle);
//   } catch (err) {
//     next(err);
//   }
// };

