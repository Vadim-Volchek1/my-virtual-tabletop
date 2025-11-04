import { Server } from 'socket.io';

export function setupSocketIO(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log('🟢 User connected:', socket.id);

    socket.on('join-session', (sessionId) => {
      socket.join(sessionId);
      console.log(`User ${socket.id} joined session ${sessionId}`);
    });

    socket.on('token-moved', (data) => {
      socket.to(data.sessionId).emit('token-updated', data);
    });

    socket.on('drawing', (data) => {
      socket.to(data.sessionId).emit('drawing-update', data);
    });

    socket.on('disconnect', () => {
      console.log('🔴 User disconnected:', socket.id);
    });
  });

  return io;
}
