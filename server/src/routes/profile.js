import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

// Получить профиль текущего пользователя
router.get('/me', protect, getProfile);

// Обновить профиль текущего пользователя
router.put('/me', protect, updateProfile);

export default router;
