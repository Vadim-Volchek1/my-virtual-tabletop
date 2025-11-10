import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProfile, updateProfile } from '../controllers/profileController.js';

const router = express.Router();

console.log('🧭 [ROUTER] Profile router загружен');

router.get(
  '/me',
  (req, res, next) => {
    console.log('🛣 [ROUTER] /me route сработал — перед вызовом protect');
    next();
  },
  protect,
  (req, res, next) => {
    console.log('🛡 [ROUTER] protect прошёл — перед getProfile');
    next();
  },
  getProfile
);

router.put(
  '/me',
  (req, res, next) => {
    console.log('🛠 [ROUTER] PUT /me route сработал — перед protect');
    next();
  },
  protect,
  (req, res, next) => {
    console.log('🛡 [ROUTER] protect прошёл — перед updateProfile');
    next();
  },
  updateProfile
);

export default router;
