import Joi from 'joi';

export const loginUserSchema = Joi.object({
  email: Joi.string().trim().email().max(64).required(),
  password: Joi.string().min(8).max(64).required(),
});

export const refreshSessionSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const registerUserSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(32)
    .pattern(/^[^<>]*$/)
    .required()
    .messages({
      'string.pattern.base': 'Name must not contain HTML tags.',
    }),

  email: Joi.string().trim().email().max(64).required(),

  password: Joi.string()
    .min(8)
    .max(64)
    .required()
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*\\d).+$'))
    .messages({
      'string.pattern.base': 'Password must contain both letters and numbers',
    }),
});
