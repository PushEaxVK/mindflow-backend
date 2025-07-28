import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/users.js';
import { UsersCollection } from '../db/models/users.js';
// import crypto from 'node:crypto';
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/sessions.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';

const JWT_ACCESS_SECRET = getEnvVar(ENV_VARS.JWT_ACCESS_SECRET);
const JWT_REFRESH_SECRET = getEnvVar(ENV_VARS.JWT_REFRESH_SECRET);

import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const ACCESS_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

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

// const createSession = () => ({
//   accessToken: crypto.randomBytes(30).toString('base64'),
//   refreshToken: crypto.randomBytes(30).toString('base64'),
//   accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
//   refreshTokenValidUntil: new Date(Date.now() + THERTY_DAYS),
// });

// const generateAccessToken = (userId) => {
//   return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
//     expiresIn: ACCESS_TOKEN_EXPIRES_IN,
//   });
// };

// const generateRefreshToken = (userId) => {
//   return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
//     expiresIn: REFRESH_TOKEN_EXPIRES_IN,
//   });
// };

// export const createUserSession = async (userId) => {
//   const refreshToken = generateRefreshToken(userId);
//   const accessToken = generateAccessToken(userId);
//   const now = new Date();
//   const session = await SessionsCollection.create({
//     userId,
//     accessToken,
//     refreshToken,
//     accessTokenValidUntil: new Date(now.getTime() + ACCESS_TOKEN_EXPIRES_IN_MS),
//     refreshTokenValidUntil: new Date(
//       now.getTime() + REFRESH_TOKEN_EXPIRES_IN_MS,
//     ),
//   });
//   return {
//     _id: session._id,
//     userId,
//     accessToken,
//     refreshToken,
//   };
// };


export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  
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

// export const loginUser = async ({ email, password }) => {
//   email = email?.trim().toLowerCase();
//   if (!email || !password)
//     throw createHttpError(400, 'Email and password are required');
//   const user = await UsersCollection.findOne({ email });
//   if (!user) throw createHttpError(401, 'Email or password invalid');
//   const passwordMatch = await bcrypt.compare(password, user.password);
//   if (!passwordMatch) throw createHttpError(401, 'Email or password invalid');
//   return await createUserSession(user._id);
// };

// export const loginUser = async (payload) => {
//   const user = await UsersCollection.findOne({ email: payload.email });
//   if (!user) {
//     throw createHttpError(401, 'User login and password does not match!');
//   }
//   const arePasswordsEqual = await bcrypt.compare(
//     payload.password,
//     user.password,
//   );
//   if (!arePasswordsEqual) {
//     throw createHttpError(401, 'User login and password does not match!');
//   }
//   await SessionsCollection.findOneAndDelete({ userId: user._id });
//   const session = await SessionsCollection.create({
//     ...createSession(),
//     userId: user._id,
//   });
//   return session;
// };

export const registerUser = async ({ name, email, password }) => {
  name = name?.trim();
  email = email?.trim().toLowerCase();

  if (!name || name.length < 2 || name.length > 32)
    throw createHttpError(
      400,
      'The name must be between 2 and 32 characters long',
    );

  if (
    !email ||
    typeof email !== 'string' ||
    email.length > 64 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    throw createHttpError(400, 'Invalid email address');
  if (!password || password.length < 8 || password.length > 64)
    throw createHttpError(
      400,
      'Password must be between 8 and 64 characters long',
    );

  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password))
    throw createHttpError(
      400,
      'Password must contain both letters and numbers',
    );

  const existingUser = await UsersCollection.findOne({ email });
  if (existingUser)
    throw createHttpError(409, 'A user with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await UsersCollection.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
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


// export const refreshUserSession = async ({ sessionId, refreshToken }) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken,
//   });
//   if (!session) throw createHttpError(401, 'Session not found or invalid');

//   try {
//     jwt.verify(refreshToken, JWT_REFRESH_SECRET);
//   } catch {
//     await SessionsCollection.deleteOne({ _id: sessionId });
//     throw createHttpError(401, 'Refresh token expired or invalid');
//   }

//   const newRefreshToken = generateRefreshToken(session.userId);
//   const newAccessToken = generateAccessToken(session.userId);

//   const now = new Date();

//   const updatedSession = await SessionsCollection.findByIdAndUpdate(
//     sessionId,
//     {
//       refreshToken: newRefreshToken,
//       accessToken: newAccessToken,
//       accessTokenValidUntil: new Date(
//         now.getTime() + ACCESS_TOKEN_EXPIRES_IN_MS,
//       ),
//       refreshTokenValidUntil: new Date(
//         now.getTime() + REFRESH_TOKEN_EXPIRES_IN_MS,
//       ),
//     },
//     { new: true },
//   );

//   return {
//     _id: updatedSession._id,
//     userId: updatedSession.userId,
//     accessToken: newAccessToken,
//     refreshToken: newRefreshToken,
//   };
// };

// export const refreshSession = async (sessionId, sessionToken) => {
//   const session = await SessionsCollection.findOne({
//     _id: sessionId,
//     refreshToken: sessionToken,
//   });
//   if (!session) {
//     throw createHttpError(401, 'Session not found!');
//   }
//   if (session.refreshTokenValidUntil < new Date()) {
//     await SessionsCollection.findByIdAndDelete(sessionId);
//     throw createHttpError(401, 'Session expired!');
//   }
//   await SessionsCollection.findByIdAndDelete(sessionId);
//   const newSession = await SessionsCollection.create({
//     ...createSession(),
//     userId: session.userId,
//   });
//   return newSession;
// };

// export const logoutUser = async (sessionId, sessionToken) => {
//   await SessionsCollection.findOneAndDelete({
//     _id: sessionId,
//     refreshToken: sessionToken,
//   });
// };

// export const logoutUser = async (sessionId) => {
//   await SessionsCollection.deleteOne({ _id: sessionId });
// };