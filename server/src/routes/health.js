import express from 'express';
import { dbHelpers } from '../config/database.js'; // если у тебя есть отдельный файл с БД

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const userCount = await dbHelpers.get('SELECT COUNT(*) as count FROM users');
    const sessionCount = await dbHelpers.get('SELECT COUNT(*) as count FROM sessions');

    res.json({
      status: 'Server is running',
      database: 'SQLite',
      users: userCount.count,
      sessions: sessionCount.count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.json({
      status: 'Server is running',
      database: 'SQLite (error getting stats)',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;
