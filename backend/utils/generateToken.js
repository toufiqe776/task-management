import jwt from 'jsonwebtoken';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || 'task-manager-secret', {
    expiresIn: '7d',
  });

export default generateToken;
