import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isDatabaseReady } from '../config/db.js';
import { findMemoryUserById } from '../utils/memoryStore.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret_key');
      const userId = decoded.id || decoded._id;

      if (!isDatabaseReady || !isDatabaseReady()) {
        const memoryUser = findMemoryUserById ? findMemoryUserById(userId) : null;
        if (!memoryUser) {
          return res.status(401).json({ message: 'User not found' });
        }
        req.user = memoryUser;
        return next();
      }

      req.user = await User.findById(userId).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

export default protect;