import { createServer } from 'http';
import { initializeDatabase } from './config/database.js';
import { setupSocketIO } from './config/socket.js';
import { createApp } from './app.js';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    console.log('🚀 Starting server...');
    await initializeDatabase();

    // 1️⃣ Сначала создаём Express app
    const app = createApp();

    // 2️⃣ Создаём HTTP-сервер с app как обработчиком
    const server = createServer(app);

    // 3️⃣ Подключаем socket.io
    const io = setupSocketIO(server);

    // 4️⃣ Передаём io обратно в app, если нужно
    app.set('io', io);

    // 5️⃣ Запускаем сервер
    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('💥 Server failed:', err);
    process.exit(1);
  }
}

startServer();
