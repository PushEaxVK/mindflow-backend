import {
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  createUserSession,
} from '../services/auth.js';

import { THIRTY_DAYS } from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const NODE_ENV = getEnvVar('NODE_ENV', 'dev');

const cookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'Strict',
  expires: new Date(Date.now() + THIRTY_DAYS),
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, cookieOptions);
  res.cookie('sessionId', session._id.toString(), cookieOptions);
};

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
      user: session.user,
    },
  });
};

export const logoutUserController = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      status: 401,
      message: 'Access token required',
      data: {
        message: 'No access token provided',
      },
    });
  }

  await logoutUser(token);

  res.json({
    status: 200,
    message: 'Successfully logged out!',
    data: {
      message: 'User logged out successfully',
    },
  });
};

export const refreshSessionController = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(400).json({
      status: 400,
      message: 'Refresh token required',
      data: {
        message: 'No refresh token provided',
      },
    });
  }

  const session = await refreshSession(refreshToken);

  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
      user: session.user,
    },
  });
};

export const registerUserController = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    const session = await createUserSession(user._id);

    setupSession(res, session);

    res.status(201).json({
      status: 201,
      message: 'Successfully registered user!',
      data: {
        user,
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Register error:', error.message);
    const statusCode = error.status || 400;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Registration failed',
      data: null,
    });
  }
};
