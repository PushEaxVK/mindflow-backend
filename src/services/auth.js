import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { UsersCollection } from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';

const JWT_ACCESS_SECRET = getEnvVar(ENV_VARS.JWT_ACCESS_SECRET);
const JWT_REFRESH_SECRET = getEnvVar(ENV_VARS.JWT_REFRESH_SECRET);

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const ACCESS_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_EXPIRES_IN_MS = 7 * 24 * 60 * 60 * 1000;

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

export const loginUser = async ({ email, password }) => {
  email = email?.trim().toLowerCase();
  if (!email || !password)
    throw createHttpError(400, 'Email and password are required');

  const user = await UsersCollection.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password invalid');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw createHttpError(401, 'Email or password invalid');

  return await createUserSession(user._id);
};

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, JWT_ACCESS_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

export const createUserSession = async (userId) => {
  const refreshToken = generateRefreshToken(userId);
  const accessToken = generateAccessToken(userId);

  const now = new Date();

  const session = await SessionsCollection.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(now.getTime() + ACCESS_TOKEN_EXPIRES_IN_MS),
    refreshTokenValidUntil: new Date(
      now.getTime() + REFRESH_TOKEN_EXPIRES_IN_MS,
    ),
  });

  return {
    _id: session._id,
    userId,
    accessToken,
    refreshToken,
  };
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) throw createHttpError(401, 'Session not found or invalid');

  try {
    jwt.verify(refreshToken, JWT_REFRESH_SECRET);
  } catch {
    await SessionsCollection.deleteOne({ _id: sessionId });
    throw createHttpError(401, 'Refresh token expired or invalid');
  }

  const newRefreshToken = generateRefreshToken(session.userId);
  const newAccessToken = generateAccessToken(session.userId);

  const now = new Date();

  const updatedSession = await SessionsCollection.findByIdAndUpdate(
    sessionId,
    {
      refreshToken: newRefreshToken,
      accessToken: newAccessToken,
      accessTokenValidUntil: new Date(
        now.getTime() + ACCESS_TOKEN_EXPIRES_IN_MS,
      ),
      refreshTokenValidUntil: new Date(
        now.getTime() + REFRESH_TOKEN_EXPIRES_IN_MS,
      ),
    },
    { new: true },
  );

  return {
    _id: updatedSession._id,
    userId: updatedSession.userId,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};
