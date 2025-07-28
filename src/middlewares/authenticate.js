import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import User from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';

export const authenticate = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    throw createHttpError(401, 'Session not found');
  }

  const authHeader = req.get('Authorization');

  if (!authHeader) {
    throw createHttpError(401, 'Please provide Authorization header');
  }

  const [bearer, rawToken] = authHeader.split(' ');
  const token = rawToken?.trim();

  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Auth header should be of type Bearer');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id || decoded.userId);

    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    const session = await SessionsCollection.findOne({
      _id: sessionId,
      userId: decoded.userId || decoded._id,
    });

    if (!session) {
      throw createHttpError(401, 'Session not found!');
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Access token expired');
    } else if (err.name === 'JWTError') {
      throw createHttpError(401, 'Invalid access token');
    } else if (err.name === 'NotBeforeError') {
      throw createHttpError(401, 'Token not active yet');
    }
    throw err;
  }
};
