import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { UsersCollection } from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, THERTY_DAYS } from '../constants/index.js';
import { sendEmail } from '../utils/send-email.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';
import Handlebars from 'handlebars';
import fs from 'node:fs';
import path from 'node:path';
import { TEMPLATE_DIR } from '../constants/paths.js';
import { jwtTokenPayloadValidationSchema } from '../validation/auth.js';

const resetPasswordEmailTemplate = fs
  .readFileSync(path.join(TEMPLATE_DIR, 'reset-password-email-template.html'))
  .toString('utf8');

export const registerUser = async (payload) => {
  const existingUser = await UsersCollection.findOne({ email: payload.email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await UsersCollection.create({
    ...payload,
    password: hashedPassword,
  });

  return user;
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THERTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });

  if (!user) {
    throw createHttpError(401, 'Invalid credentials!');
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, 'Invalid credentials!');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const newSession = createSession();

  return await SessionsCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const refreshUserSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found!');
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);

  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired!');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetPwdEmail = async ({ email }) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const token = jwt.sign(
    {
      sub: user._id.toString(),
      email,
    },
    getEnvVar(ENV_VARS.JWT_SECRET),
    {
      expiresIn: '5m',
    },
  );

  const template = Handlebars.compile(resetPasswordEmailTemplate);

  const html = template({
    name: user.name,
    link: `${getEnvVar(ENV_VARS.APP_DOMAIN)}/reset-password?token=${token}`,
  });

  const subject = 'Reset password';

  await sendEmail({ email, html, subject });
};

export const resetPassword = async ({ token, password }) => {
  let entries;

  try {
    entries = jwt.verify(token, getEnvVar(ENV_VARS.JWT_SECRET));
    const { error } = jwtTokenPayloadValidationSchema.validate(entries, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(`Payload validation error: ${error.message}`);
    }
  } catch (err) {
    if (err instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw err;
  }

  const { email, sub: _id } = entries;

  const user = await UsersCollection.findOne({ email, _id });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await UsersCollection.updateOne(
    { _id: user._id },
    { password: hashedPassword },
  );

  await SessionsCollection.deleteOne({ userId: user._id });
};
