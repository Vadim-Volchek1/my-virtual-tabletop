import jwt from 'jsonwebtoken';
import { dbHelpers } from '../config/database.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    // Проверяем наличие заголовка Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'You are not logged in' });
    }

    // Проверяем JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Находим пользователя в SQLite
    const user = await dbHelpers.get('SELECT id, username, email FROM users WHERE id = ?', [decoded.id]);

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
};
