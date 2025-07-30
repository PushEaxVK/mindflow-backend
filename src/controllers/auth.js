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
  sameSite: NODE_ENV === 'production' ? 'None' : 'Lax',
  expires: new Date(Date.now() + THIRTY_DAYS),
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, cookieOptions);
  res.cookie('sessionId', session._id.toString(), cookieOptions);
};

const clearSession = (res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'Strict',
  });
  res.clearCookie('sessionId', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'Strict',
  });
};

export const loginUserController = async (req, res) => {
  try {
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
  } catch (error) {
    console.error('Login error:', error);
    const statusCode = error.status || 401;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Login failed',
      data: null,
    });
  }
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

export const logoutUserController = async (req, res) => {
  try {
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
    clearSession(res);

    res.json({
      status: 200,
      message: 'Successfully logged out!',
      data: {
        message: 'User logged out successfully',
      },
    });
  } catch (error) {
    console.error('Logout error:', error);
    const statusCode = error.status || 500;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Logout failed',
      data: null,
    });
  }
};

export const refreshSessionController = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({
        status: 400,
        message: 'Refresh token required',
        data: {
          message: 'No refresh token provided in cookies',
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
  } catch (error) {
    console.error('Refresh session error:', error);
    clearSession(res);

    const statusCode = error.status || 401;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Failed to refresh session',
      data: null,
    });
  }
};
