import jwt from 'jsonwebtoken';
import User from '../db/models/users.js';
import { SessionsCollection } from '../db/models/sessions.js';
import { getEnvVar } from '../utils/getEnvVar.js';

const JWT_SECRET = getEnvVar('JWT_SECRET');

export const authOptional = async (req, res, next) => {
  const sessionId = req.cookies?.sessionId;
  const authHeader = req.headers?.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token || !sessionId) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded._id || decoded.userId;

    const user = await User.findById(userId);
    const session = await SessionsCollection.findOne({
      _id: sessionId,
      userId,
    });

    if (user && session) {
      req.user = user;
    }
  } catch {
    //
  }

  next();
};
