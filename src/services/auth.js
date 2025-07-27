import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';
import { FIFTEEN_MINUTES, THERTY_DAYS } from '../constants/index.js';

const createSession = (userId) => {
  const accessToken = jwt.sign(
    { userId, _id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' },
  );

  const refreshToken = jwt.sign(
    { userId, _id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' },
  );

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THERTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(401, 'User login and password does not match!');
  }

  const arePasswordsEqual = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!arePasswordsEqual) {
    throw createHttpError(401, 'User login and password does not match!');
  }

  await SessionsCollection.findOneAndDelete({ userId: user._id });

  const sessionData = createSession(user._id);

  await SessionsCollection.create({
    ...sessionData,
    userId: user._id,
  });

  return {
    ...sessionData,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  };
};

export const logoutUser = async (accessToken) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    await SessionsCollection.findOneAndDelete({
      userId: decoded.userId || decoded._id,
    });
  } catch (err) {
    console.log(err);
    throw createHttpError(401, 'Invalid access token');
  }
};

export const refreshSession = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const session = await SessionsCollection.findOne({
      userId: decoded.userId || decoded._id,
      refreshToken: refreshToken,
    });

    if (!session) {
      throw createHttpError(401, 'Session not found!');
    }

    if (session.refreshTokenValidUntil < new Date()) {
      await SessionsCollection.findByIdAndDelete(session._id);
      throw createHttpError(401, 'Session expired!');
    }

    const user = await User.findById(decoded.userId || decoded._id);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    await SessionsCollection.findByIdAndDelete(session._id);

    const newSessionData = createSession(user._id);

    await SessionsCollection.create({
      ...newSessionData,
      userId: user._id,
    });

    return {
      ...newSessionData,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      throw createHttpError(401, 'Invalid or expired refresh token');
    }
    throw err;
  }
};
