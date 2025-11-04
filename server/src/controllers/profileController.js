import { dbHelpers } from '../config/database.js';
import bcrypt from 'bcryptjs';

/**
 * 🔹 Получить профиль текущего пользователя
 */
export const getProfile = async (req, res) => {
    try {
      const user = await dbHelpers.get(
        'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
  
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
  
      res.json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ message: 'Ошибка при получении профиля' });
    }
  };
  

/**
 * 🔹 Обновить данные профиля (имя, email, пароль)
 */
export const updateProfile = async (req, res) => {
    try {
      const { username, email, password, avatar } = req.body;
  
      // Проверяем, есть ли пользователь
      const user = await dbHelpers.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
      if (!user) return res.status(404).json({ message: 'Пользователь не найден' });
  
      let newPassword = user.password;
      if (password) {
        newPassword = await bcrypt.hash(password, 12);
      }
  
      await dbHelpers.run(
        'UPDATE users SET username = ?, email = ?, password = ?, avatar = ? WHERE id = ?',
        [
          username || user.username,
          email || user.email,
          newPassword,
          avatar || user.avatar,
          req.user.id,
        ]
      );
  
      const updated = await dbHelpers.get(
        'SELECT id, username, email, avatar, created_at FROM users WHERE id = ?',
        [req.user.id]
      );
  
      res.json({
        message: 'Профиль успешно обновлён',
        user: updated,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ message: 'Ошибка при обновлении профиля' });
    }
  };
  
