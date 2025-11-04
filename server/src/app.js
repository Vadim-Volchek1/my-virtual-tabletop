import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import healthRoutes from './routes/health.js';
import sessionRoutes from './routes/sessions.js';

export const createApp = (io) => {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(morgan('combined'));
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use('/uploads', express.static('uploads'));

  // Добавляем io в req
  app.use((req, res, next) => {
    req.io = io;
    next();
  });

  // Маршруты
  app.use('/api/auth', authRoutes);
  app.use('/api/health', healthRoutes);
  app.use('/api/sessions', sessionRoutes);

  // Ошибки
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  return app;
};
