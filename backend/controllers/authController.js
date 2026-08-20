import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { isDatabaseReady } from '../config/db.js';
import generateToken from '../utils/generateToken.js';
import { createMemoryUser, findMemoryUserByEmail, findMemoryUserById } from '../utils/memoryStore.js';

const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (isDatabaseReady()) {
      const existingUser = await User.findOne({ email: normalizedEmail });

      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    const existingUser = findMemoryUserByEmail(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = createMemoryUser({
      _id: `${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (isDatabaseReady()) {
      const user = await User.findOne({ email: email.trim().toLowerCase() });

      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    }

    const user = findMemoryUserByEmail(email.trim().toLowerCase());

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res) => {
  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
  });
};

export { registerUser, loginUser, getMe };
