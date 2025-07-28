import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { ENV_VARS } from '../constants/envVars.js';

const JWT_ACCESS_SECRET = getEnvVar(ENV_VARS.JWT_ACCESS_SECRET);

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res
        .status(401)
        .json({ status: 401, message: 'Authorization token missing' });
    }

    const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    req.user = { id: decoded.userId };
    next();
  } catch {
    return res
      .status(401)
      .json({ status: 401, message: 'Invalid or expired token' });
  }
};
