import { dbHelpers } from '../config/database.js';

// 🧩 Получить все сессии
export const getSessions = async (req, res) => {
  try {
    const sessions = await dbHelpers.all(
      `SELECT s.*, u.username AS creator_name
       FROM sessions s
       JOIN users u ON s.creator_id = u.id
       ORDER BY s.created_at DESC`
    );
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Ошибка загрузки сессий' });
  }
};

// ➕ Создать новую сессию
export const createSession = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Название сессии обязательно' });

    const result = await dbHelpers.run(
      'INSERT INTO sessions (name, creator_id) VALUES (?, ?)',
      [name, req.user.id]
    );

    const session = await dbHelpers.get(
      `SELECT s.*, u.username AS creator_name
       FROM sessions s
       JOIN users u ON s.creator_id = u.id
       WHERE s.id = ?`,
      [result.id]
    );

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Ошибка создания сессии' });
  }
};

// 🔍 Получить конкретную сессию
export const getSession = async (req, res) => {
  try {
    const session = await dbHelpers.get(
      `SELECT s.*, u.username AS creator_name
       FROM sessions s
       JOIN users u ON s.creator_id = u.id
       WHERE s.id = ?`,
      [req.params.id]
    );
    if (!session) return res.status(404).json({ error: 'Сессия не найдена' });
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Ошибка загрузки сессии' });
  }
};
export const joinSession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.id;

    // Проверяем, существует ли сессия
    const session = await dbHelpers.get('SELECT * FROM sessions WHERE id = ?', [sessionId]);
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    // Проверяем, есть ли пользователь уже в списке игроков
    const playerExists = await dbHelpers.get(
      'SELECT * FROM session_players WHERE session_id = ? AND user_id = ?',
      [sessionId, userId]
    );

    if (playerExists) {
      return res.status(400).json({ error: 'Вы уже участвуете в этой сессии' });
    }

    // Добавляем пользователя в сессию
    await dbHelpers.run(
      'INSERT INTO session_players (session_id, user_id, role) VALUES (?, ?, ?)',
      [sessionId, userId, 'player']
    );

    res.json({ message: 'Вы успешно присоединились к сессии' });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Ошибка присоединения к сессии' });
  }
};