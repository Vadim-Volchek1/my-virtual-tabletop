import express from 'express';
import { 
  getTokens, 
  createToken, 
  updateToken, 
  deleteToken 
} 
from '../controllers/tokenControllers.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/:sessionId/tokens', authenticateToken, getTokens);
router.post('/:sessionId/tokens', authenticateToken, createToken);
router.put('/:sessionId/tokens/:tokenId', authenticateToken, updateToken);
router.delete('/:sessionId/tokens/:tokenId', authenticateToken, deleteToken);

export default router;