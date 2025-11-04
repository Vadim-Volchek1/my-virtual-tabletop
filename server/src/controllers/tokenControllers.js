import { dbHelpers } from '../config/database.js';

// 🎲 Получить все токены
export const getTokens = async (req, res) => {
  try {
    const tokens = await dbHelpers.all(
      'SELECT * FROM tokens WHERE session_id = ?',
      [req.params.sessionId]
    );
    res.json(tokens);
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Ошибка загрузки токенов' });
  }
};

// ➕ Создать токен
export const createToken = async (req, res) => {
  try {
    const { name, imageUrl, x, y } = req.body;
    if (!name || !imageUrl) return res.status(400).json({ error: 'Название и изображение обязательны' });

    const result = await dbHelpers.run(
      'INSERT INTO tokens (session_id, name, image_url, x, y) VALUES (?, ?, ?, ?, ?)',
      [req.params.sessionId, name, imageUrl, x || 0, y || 0]
    );

    const token = await dbHelpers.get('SELECT * FROM tokens WHERE id = ?', [result.id]);
    if (req.io) req.io.to(req.params.sessionId).emit('token-created', token);

    res.status(201).json(token);
  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ error: 'Ошибка создания токена' });
  }
};

// 🔄 Обновить токен
export const updateToken = async (req, res) => {
  try {
    const { x, y } = req.body;
    await dbHelpers.run('UPDATE tokens SET x = ?, y = ? WHERE id = ?', [x, y, req.params.tokenId]);

    const token = await dbHelpers.get('SELECT * FROM tokens WHERE id = ?', [req.params.tokenId]);
    if (!token) return res.status(404).json({ error: 'Токен не найден' });

    if (req.io) req.io.to(token.session_id.toString()).emit('token-updated', token);
    res.json(token);
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ error: 'Ошибка обновления токена' });
  }
};

// ❌ Удалить токен
export const deleteToken = async (req, res) => {
  try {
    const token = await dbHelpers.get('SELECT * FROM tokens WHERE id = ?', [req.params.tokenId]);
    if (!token) return res.status(404).json({ error: 'Токен не найден' });

    await dbHelpers.run('DELETE FROM tokens WHERE id = ?', [req.params.tokenId]);

    if (req.io) req.io.to(token.session_id.toString()).emit('token-deleted', token.id);
    res.json({ message: 'Токен удален' });
  } catch (error) {
    console.error('Delete token error:', error);
    res.status(500).json({ error: 'Ошибка удаления токена' });
  }
};
