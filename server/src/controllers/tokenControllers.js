import { Token } from '../models/index.js';

export const getTokens = async (req, res) => {
  try {
    const tokens = await Token.find({ sessionId: req.params.sessionId })
      .populate('ownerId', 'username');
    res.json(tokens);
  } catch (error) {
    console.error('Get tokens error:', error);
    res.status(500).json({ error: 'Ошибка загрузки токенов' });
  }
};

export const createToken = async (req, res) => {
  try {
    const { name, imageUrl, width, height, x, y } = req.body;
    
    if (!name || !imageUrl) {
      return res.status(400).json({ error: 'Название и изображение обязательны' });
    }

    const token = await Token.create({
      name,
      imageUrl,
      width: width || 50,
      height: height || 50,
      x: x || 0,
      y: y || 0,
      sessionId: req.params.sessionId,
      ownerId: req.user.userId
    });

    const populatedToken = await Token.findById(token._id)
      .populate('ownerId', 'username');

    // Emit socket event
    if (req.io) {
      req.io.to(req.params.sessionId).emit('token-created', populatedToken);
    }

    res.status(201).json(populatedToken);
  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ error: 'Ошибка создания токена' });
  }
};

export const updateToken = async (req, res) => {
  try {
    const token = await Token.findByIdAndUpdate(
      req.params.tokenId,
      req.body,
      { new: true }
    ).populate('ownerId', 'username');

    if (!token) {
      return res.status(404).json({ error: 'Токен не найден' });
    }

    // Emit socket event
    if (req.io) {
      req.io.to(token.sessionId.toString()).emit('token-updated', token);
    }

    res.json(token);
  } catch (error) {
    console.error('Update token error:', error);
    res.status(500).json({ error: 'Ошибка обновления токена' });
  }
};

export const deleteToken = async (req, res) => {
  try {
    const token = await Token.findByIdAndDelete(req.params.tokenId);
    
    if (!token) {
      return res.status(404).json({ error: 'Токен не найден' });
    }

    // Emit socket event
    if (req.io) {
      req.io.to(token.sessionId.toString()).emit('token-deleted', token._id);
    }

    res.json({ message: 'Токен удален' });
  } catch (error) {
    console.error('Delete token error:', error);
    res.status(500).json({ error: 'Ошибка удаления токена' });
  }
};