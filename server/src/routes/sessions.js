import express from 'express';
import { 
  getSessions, 
  createSession, 
  getSession, 
  joinSession 
} from '../controllers/sessionController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, getSessions);
router.post('/', authenticateToken, createSession);
router.get('/:id', authenticateToken, getSession);
router.post('/:id/join', authenticateToken, joinSession);

export default router;