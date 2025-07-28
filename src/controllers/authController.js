import User from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    
    await SessionsCollection.create({
      userId: user._id,
      accessToken: token,
      accessTokenValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      refreshToken: token, 
      refreshTokenValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) 
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }
    next(err);
  }
};
