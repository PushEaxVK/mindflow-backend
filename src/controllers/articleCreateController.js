import Article from '../db/models/articleModel.js';
import mongoose from 'mongoose';
import createHttpError from 'http-errors';

export const createArticleFromForm = async (req, res, next) => {
  try {
    const { title, desc, article, date, ownerId } = req.body;

    if (!title || title.length < 3 || title.length > 48) {
      throw createHttpError(400, 'Title must be between 3 and 48 characters');
    }

    if (!desc || desc.length < 5 || desc.length > 100) {
      throw createHttpError(400, 'Description must be between 5 and 100 characters');
    }

    if (!article || article.length < 100 || article.length > 4000) {
      throw createHttpError(400, 'Article must be between 100 and 4000 characters');
    }

    if (!date || isNaN(Date.parse(date))) {
      throw createHttpError(400, 'Date is required and must be a valid date');
    }

    if (!ownerId || !mongoose.Types.ObjectId.isValid(ownerId)) {
      throw createHttpError(400, 'Invalid or missing ownerId');
    }

    if (!req.file) {
      throw createHttpError(400, 'Image is required');
    }

    if (req.file.size > 1024 * 1024) {
      throw createHttpError(400, 'Image size exceeds 1MB');
    }

    const newArticle = await Article.create({
      title,
      desc,
      article,
      img: req.file.filename,
      date: new Date(date),
      ownerId,
    });

    res.status(201).json({ _id: newArticle._id });
  } catch (err) {
    console.error('Create article error:', err);
    next(err);
  }
};
