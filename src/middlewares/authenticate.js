import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { UsersCollection } from '../db/models/users.js';
import { ENV_VARS } from '../constants/envVars.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw createHttpError(401, 'Please provide Authorization header');
  }

  const [bearer, token] = authHeader.split(' ');
  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Auth header should be of type Bearer');
  }

  const payload = jwt.verify(token, ENV_VARS.JWT_ACCESS_SECRET);

  const user = await UsersCollection.findById(payload.userId);
  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  if (req.params.userId && req.params.userId !== user._id.toString()) {
    throw createHttpError(403, 'Forbidden: access denied for this userId');
  }

  req.user = user;
  next();
};
