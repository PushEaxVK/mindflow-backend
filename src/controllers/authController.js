import { registerUser } from '../services/auth.js';

export const registerUserController = async (req, res, next) => {
  try {
    const user = await registerUser(req.body);

    res.status(201).json({
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Register Error:', error);

    res.status(error.status || 500).json({
      message: error.message || 'Internal Server Error',
    });
  }
};
