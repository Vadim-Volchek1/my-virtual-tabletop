import express from 'express';
import { 
  getSessions, 
  createSession, 
  getSession, 
  joinSession 
} from '../controllers/sessionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getSessions);
router.post('/', protect, createSession);
router.get('/:id', protect, getSession);
router.post('/:id/join', protect, joinSession);

export default router;
