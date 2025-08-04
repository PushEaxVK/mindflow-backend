// import Article from '../db/models/articleModel.js';
// import mongoose from 'mongoose';
// import createHttpError from 'http-errors';

// export const createArticleFromForm = async (req, res, next) => {
//   try {
//     const { title, article, date, author } = req.body;

//     if (!title || title.length < 3 || title.length > 48) {
//       throw createHttpError(400, 'Title must be between 3 and 48 characters');
//     }

//     if (!article || article.length < 100 || article.length > 4000) {
//       throw createHttpError(400, 'Article must be between 100 and 4000 characters');
//     }

//     if (!date || isNaN(Date.parse(date))) {
//       throw createHttpError(400, 'Date is required and must be a valid date');
//     }

//     if (!author || !mongoose.Types.ObjectId.isValid(author)) {
//       throw createHttpError(400, 'Invalid or missing author');
//     }

//     if (!req.file) {
//       throw createHttpError(400, 'Image is required');
//     }

//     if (req.file.size > 1024 * 1024) {
//       throw createHttpError(400, 'Image size exceeds 1MB');
//     }

//     const newArticle = await Article.create({
//       title,
//       article,
//       img: req.file.filename,
//       createdAt: new Date(date),
//       author,
//     });

//     res.status(201).json({ _id: newArticle._id });
//   } catch (err) {
//     next(err);
//   }
// };
