import {
  registerUser,
  loginUser,
  createUserSession,
  logoutUser,
  refreshUserSession,
} from '../services/auth.js';
import { SEVEN_DAYS } from '../constants/index.js';
// import User from '../db/models/users.js';
// import { SessionsCollection } from '../db/models/sessions.js';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

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

// export const registerUser = async (req, res, next) => {
//   try {
//     const { name, email, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = await User.create({
//       name,
//       email,
//       password: hashedPassword,
//     });
//     res.status(201).json({ message: 'User registered successfully', user });
//   } catch (err) {
//     if (err.code === 11000) {
//       return res.status(400).json({ message: 'User already exists' });
//     }
//     next(err);
//   }
// };

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

// export const loginUser = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: 'Invalid credentials' });
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });
//     const token = jwt.sign(
//       { _id: user._id, role: user.role },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );
//     await SessionsCollection.create({
//       userId: user._id,
//       accessToken: token,
//       accessTokenValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
//       refreshToken: token, 
//       refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
//     });
//     res.json({ token });
//   } catch (err) {
//     next(err);
//   }
// };

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

