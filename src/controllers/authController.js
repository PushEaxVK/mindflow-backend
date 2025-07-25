import {
  registerUser,
  loginUser,
  createUserSession,
  logoutUser,
  refreshUserSession,
} from '../services/auth.js';
import { SEVEN_DAYS } from '../constants/index.js';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'Strict',
  expires: new Date(Date.now() + SEVEN_DAYS),
};

export const registerUserController = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    const session = await createUserSession(user._id);

    res.cookie('refreshToken', session.refreshToken, cookieOptions);
    res.cookie('sessionId', session._id.toString(), cookieOptions);

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

export const loginUserController = async (req, res) => {
  try {
    const session = await loginUser(req.body);

    res.cookie('refreshToken', session.refreshToken, cookieOptions);
    res.cookie('sessionId', session._id.toString(), cookieOptions);

    res.status(200).json({
      status: 200,
      message: 'Successfully logged in',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    const statusCode = error.status || 400;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Login failed',
      data: null,
    });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (!sessionId) {
      return res.status(400).json({
        status: 400,
        message: 'No session to logout',
        data: null,
      });
    }

    await logoutUser(sessionId);

    res.clearCookie('refreshToken', cookieOptions);
    res.clearCookie('sessionId', cookieOptions);

    res.status(200).json({
      status: 200,
      message: 'Successfully logged out',
      data: null,
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    const statusCode = error.status || 400;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Logout failed',
      data: null,
    });
  }
};

export const refreshSessionController = async (req, res) => {
  try {
    const sessionId = req.cookies.sessionId;
    const refreshToken = req.cookies.refreshToken;

    if (!sessionId || !refreshToken) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized',
        data: null,
      });
    }

    const session = await refreshUserSession({ sessionId, refreshToken });

    res.cookie('refreshToken', session.refreshToken, cookieOptions);
    res.cookie('sessionId', session._id.toString(), cookieOptions);

    res.status(200).json({
      status: 200,
      message: 'Session refreshed',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Refresh session error:', error.message);
    const statusCode = error.status || 401;
    res.status(statusCode).json({
      status: statusCode,
      message: error.message || 'Could not refresh session',
      data: null,
    });
  }
};
