import { GameSession } from '../models/index.js';

export const getSessions = async (req, res) => {
  try {
    const sessions = await GameSession.find()
      .populate('creatorId', 'username avatar')
      .populate('players.userId', 'username avatar');
    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Ошибка загрузки сессий' });
  }
};

export const createSession = async (req, res) => {
  try {
    const { name, description, gameSystem, isPublic, password, maxPlayers } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Название сессии обязательно' });
    }

    const session = await GameSession.create({
      name,
      description,
      gameSystem,
      isPublic,
      password,
      maxPlayers,
      creatorId: req.user.userId,
      players: [{
        userId: req.user.userId,
        role: 'gm'
      }]
    });

    const populatedSession = await GameSession.findById(session._id)
      .populate('creatorId', 'username avatar')
      .populate('players.userId', 'username avatar');

    res.status(201).json(populatedSession);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Ошибка создания сессии' });
  }
};

export const getSession = async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.id)
      .populate('creatorId', 'username avatar')
      .populate('players.userId', 'username avatar');
    
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Ошибка загрузки сессии' });
  }
};

export const joinSession = async (req, res) => {
  try {
    const session = await GameSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ error: 'Сессия не найдена' });
    }

    // Check if session is full
    if (session.players.length >= session.maxPlayers) {
      return res.status(400).json({ error: 'Сессия заполнена' });
    }

    const alreadyJoined = session.players.some(
      player => player.userId.toString() === req.user.userId
    );

    if (!alreadyJoined) {
      session.players.push({
        userId: req.user.userId,
        role: 'player'
      });
      await session.save();
    }

    const populatedSession = await GameSession.findById(session._id)
      .populate('creatorId', 'username avatar')
      .populate('players.userId', 'username avatar');

    res.json(populatedSession);
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({ error: 'Ошибка присоединения к сессии' });
  }
};