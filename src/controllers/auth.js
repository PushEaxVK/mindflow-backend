import { loginUser, logoutUser, refreshSession } from '../services/auth.js';

export const loginUserController = async (req, res) => {
  const session = await loginUser(req.body);

  res.json({
    status: 200,
    message: 'Successfully logged in a user!',
    data: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
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
  const { refreshToken } = req.body;

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

  res.json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    },
  });
};
