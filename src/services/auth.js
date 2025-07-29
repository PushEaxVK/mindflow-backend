import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../db/models/users.js';
<<<<<<< HEAD
=======
import createHttpError from 'http-errors';
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63
import { SessionsCollection } from '../db/models/sessions.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { isTokenExpired } from '../utils/isTokenExpired.js';

<<<<<<< HEAD
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
=======
const JWT_SECRET = getEnvVar(ENV_VARS.JWT_SECRET);
// const JWT_ACCESS_SECRET = getEnvVar(ENV_VARS.JWT_ACCESS_SECRET);
const JWT_REFRESH_SECRET = getEnvVar(ENV_VARS.JWT_REFRESH_SECRET);

// const ACCESS_TOKEN_EXPIRES_IN = '15m';
// const REFRESH_TOKEN_EXPIRES_IN = '7d';
// const ACCESS_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;
// const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

const JWT_ACCESS_EXPIRES_IN = getEnvVar('JWT_ACCESS_EXPIRES_IN', '15m');
const JWT_REFRESH_EXPIRES_IN = getEnvVar('JWT_REFRESH_EXPIRES_IN', '30d');

const generateAccessToken = (userId) => {
  return jwt.sign({ userId, _id: userId }, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRES_IN,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, _id: userId }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
};

export const createSessionData = (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
<<<<<<< HEAD
    refreshTokenValidUntil: new Date(Date.now() + THERTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
=======
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const createUserSession = async (userId) => {
  const sessionData = createSessionData(userId);
  const session = await SessionsCollection.create({
    userId,
    refreshToken: sessionData.refreshToken,
  });

  const result = { _id: session._id, ...sessionData };

  return result;
};

export const loginUser = async (payload) => {
  const email = payload?.email?.trim().toLowerCase();
  const password = payload.password;
  if (!email || !password)
    throw createHttpError(400, 'Email and password are required');
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63

  const user = await User.findOne({ email });

  if (!user) throw createHttpError(401, 'Email or password invalid');

  const arePasswordsEqual = await bcrypt.compare(password, user.password);
  if (!arePasswordsEqual)
    throw createHttpError(401, 'Email or password invalid');

  await SessionsCollection.findOneAndDelete({ userId: user._id });
  const sessionData = await createUserSession(user._id);

<<<<<<< HEAD
  const sessionData = createSession(user._id);

  await SessionsCollection.create({
    ...sessionData,
    userId: user._id,
  });

=======
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63
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

<<<<<<< HEAD
export const logoutUser = async (accessToken) => {
  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

=======
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

  const existingUser = await User.findOne({ email });
  if (existingUser)
    throw createHttpError(409, 'A user with this email already exists');

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
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
    const decoded = jwt.verify(accessToken, JWT_SECRET);

>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63
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
<<<<<<< HEAD
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
=======
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63

    const session = await SessionsCollection.findOne({
      userId: decoded.userId || decoded._id,
      refreshToken: refreshToken,
    });

    if (!session) {
      throw createHttpError(401, 'Session not found!');
    }

<<<<<<< HEAD
    if (session.refreshTokenValidUntil < new Date()) {
=======
    if (isTokenExpired(decoded.exp)) {
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63
      await SessionsCollection.findByIdAndDelete(session._id);
      throw createHttpError(401, 'Session expired!');
    }

    const user = await User.findById(decoded.userId || decoded._id);
    if (!user) {
      throw createHttpError(401, 'User not found');
    }

    await SessionsCollection.findByIdAndDelete(session._id);

<<<<<<< HEAD
    const newSessionData = createSession(user._id);

    await SessionsCollection.create({
      ...newSessionData,
      userId: user._id,
    });
=======
    const newSessionData = await createUserSession(user._id);
>>>>>>> fa98813a9ff17d77ae3a108ebab21a9d7167af63

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
