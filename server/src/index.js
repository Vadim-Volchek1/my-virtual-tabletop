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

    const server = createServer();
    const io = setupSocketIO(server);
    const app = createApp(io);
    server.on('request', app);

    server.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('💥 Server failed:', err);
    process.exit(1);
  }
}

startServer();
