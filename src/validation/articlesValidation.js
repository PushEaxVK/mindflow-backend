import Joi from 'joi';
import mongoose from 'mongoose';

export const articleSchema = Joi.object({
  title: Joi.string().min(3).max(48).required().messages({
    'any.required': 'Title is required',
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must not exceed 48 characters',
  }),

  desc: Joi.string().max(250).required().messages({
    'string.max': 'Description must not exceed 250 characters',
  }),

  article: Joi.string().min(100).max(4000).required().messages({
    'any.required': 'Article text is required',
    'string.min': 'Article must be at least 100 characters',
    'string.max': 'Article must not exceed 4000 characters',
  }),

  ownerId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'any.invalid': 'Invalid or missing owner ID',
      'any.required': 'Owner ID is required',
    }),
});

export const updateArticleSchema = Joi.object({
  title: Joi.string().min(3).max(48).required().messages({
    'string.min': 'Title must be at least 3 characters',
    'string.max': 'Title must not exceed 48 characters',
  }),

  desc: Joi.string().max(250).required().messages({
    'string.max': 'Description must not exceed 250 characters',
  }),

  article: Joi.string().min(100).max(4000).required().messages({
    'string.min': 'Article must be at least 100 characters',
    'string.max': 'Article must not exceed 4000 characters',
  }),

  ownerId: Joi.string()
    .custom((value, helpers) => {
      if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'Invalid or missing owner ID',
      'any.required': 'Owner ID is required',
    }),
});
