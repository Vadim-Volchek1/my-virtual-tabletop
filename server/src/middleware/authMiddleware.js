import jwt from 'jsonwebtoken';
import { dbHelpers } from '../config/database.js';

// 🔹 Основной middleware аутентификации (protect)
export const protect = async (req, res, next) => {
  try {
    let token;

    console.log('\n🧩 === AUTH MIDDLEWARE START ===');
    console.log('🔹 Headers:', req.headers);

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('🔑 Token extracted:', token);
    } else {
      console.warn('⚠️ Authorization header missing or invalid:', req.headers.authorization);
    }

    if (!token) {
      console.warn('🚫 Нет токена');
      return res.status(401).json({ 
        success: false,
        message: 'Вы не авторизованы' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-fallback-secret');
    console.log('✅ JWT decoded:', decoded);

    const user = await dbHelpers.get(
      'SELECT id, username, email, avatar FROM users WHERE id = ?', 
      [decoded.id]
    );

    console.log('👤 Найден пользователь:', user);

    if (!user) {
      console.warn('⚠️ Пользователь не найден в БД по ID:', decoded.id);
      return res.status(401).json({ 
        success: false,
        message: 'Пользователь не существует' 
      });
    }

    req.user = user;
    console.log('🧩 === AUTH OK, CONTINUE ===\n');
    next();
  } catch (error) {
    console.error('❌ Auth error:', error);

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Неверный токен' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Токен истек' 
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Ошибка аутентификации',
      error: error.message
    });
  }
};

// 🔹 Middleware для проверки владения персонажем
export const characterOwnership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const character = await dbHelpers.get(
      'SELECT user_id, is_public FROM dnd_characters WHERE id = ?',
      [id]
    );

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Персонаж не найден'
      });
    }

    // Проверяем, является ли пользователь владельцем или персонаж публичный
    if (character.user_id !== userId && !character.is_public) {
      return res.status(403).json({
        success: false,
        message: 'Нет доступа к этому персонажу'
      });
    }

    req.character = character;
    next();
  } catch (error) {
    console.error('Character ownership error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки прав доступа'
    });
  }
};

// 🔹 Middleware для проверки прав редактирования
export const characterEditRights = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const character = await dbHelpers.get(
      'SELECT user_id FROM dnd_characters WHERE id = ?',
      [id]
    );

    if (!character) {
      return res.status(404).json({
        success: false,
        message: 'Персонаж не найден'
      });
    }

    if (character.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Нет прав для редактирования этого персонажа'
      });
    }

    req.character = character;
    next();
  } catch (error) {
    console.error('Character edit rights error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка проверки прав редактирования'
    });
  }
};

// 🔹 Альias для обратной совместимости
export const authMiddleware = protect;