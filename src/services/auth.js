import bcrypt from 'bcryptjs';
import { UsersCollection } from '../db/models/users.js';

export const registerUser = async ({ name, email, password }) => {
  if (!name || name.length < 2 || name.length > 32) {
    const error = new Error(
      'The name must be between 2 and 32 characters long',
    );
    error.status = 400;
    throw error;
  }

  if (!email || email.length > 64) {
    const error = new Error('Invalid email address');
    error.status = 400;
    throw error;
  }

  if (!password || password.length < 8 || password.length > 64) {
    const error = new Error(
      'Password must be between 8 and 64 characters long',
    );
    error.status = 400;
    throw error;
  }

  const existingUser = await UsersCollection.findOne({ email });
  if (existingUser) {
    const error = new Error('A user with this email already exists');
    error.status = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await UsersCollection.create({
    name,
    email,
    password: hashedPassword,
  });

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
  };
};
