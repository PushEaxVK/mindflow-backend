import Joi from 'joi';
import { SORT_ORDER } from '../constants/sortOrder.js';

export const authorProfileSchema = Joi.object({
  sortBy: Joi.string()
    .valid('createdAt', 'views', 'title', 'updatedAt', '_id')
    .default('createdAt'),
  sortOrder: Joi.string()
    .valid(SORT_ORDER.ASC, SORT_ORDER.DESC)
    .default(SORT_ORDER.DESC),
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(20).default(10),
  isSaved: Joi.boolean().optional(),
});
