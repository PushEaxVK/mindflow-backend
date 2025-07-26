import createHttpError from 'http-errors';
import mongoose from 'mongoose';
import { SessionsCollection } from '../db/models/sessions.js';
import User from '../db/models/users.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  if (!authHeader) {
    throw createHttpError(401, 'Please provide Authorization header');
  }

  const [bearer, rawToken] = authHeader.split(' ');
  const token = rawToken?.trim();

  if (bearer !== 'Bearer' || !token) {
    throw createHttpError(401, 'Auth header should be of type Bearer');
  }
  
  const session = await SessionsCollection.findOne({ accessToken: token });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isAccessTokenExpired = new Date() > new Date(session.accessTokenValidUntil);

  if (isAccessTokenExpired) {
    throw createHttpError(401, 'Access token expired');
  }

  console.log('Looking for user with id:', session.userId);
  console.log('Found session:', session);
  console.log('Trying to find user with _id:', session.userId);
  console.log('Type of session.userId:', typeof session.userId);
  console.log('Is valid ObjectId:', mongoose.Types.ObjectId.isValid(session.userId));

  const user = await User.findOne({
    _id: mongoose.Types.ObjectId.isValid(session.userId)
      ? new mongoose.Types.ObjectId(session.userId)
      : session.userId,
  });
  
  req.user = user;
  next(); 
};

