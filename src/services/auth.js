import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import UsersCollection from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';
import { FIFTEEN_MINUTES, THERTY_DAYS } from '../constants/index.js';

const createSession = () => ({
  accessToken: crypto.randomBytes(30).toString('base64'),
  refreshToken: crypto.randomBytes(30).toString('base64'),
  accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
  refreshTokenValidUntil: new Date(Date.now() + THERTY_DAYS),
});

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

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

  const session = await SessionsCollection.create({
    ...createSession(),
    userId: user._id,
  });

  return session;
};

export const logoutUser = async (sessionId, sessionToken) => {
  await SessionsCollection.findOneAndDelete({
    _id: sessionId,
    refreshToken: sessionToken,
  });
};

export const refreshSession = async (sessionId, sessionToken) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken: sessionToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  if (session.refreshTokenValidUntil < new Date()) {
    await SessionsCollection.findByIdAndDelete(sessionId);
    throw createHttpError(401, 'Session expired!');
  }

  await SessionsCollection.findByIdAndDelete(sessionId);

  const newSession = await SessionsCollection.create({
    ...createSession(),
    userId: session.userId,
  });

  return newSession;
};
