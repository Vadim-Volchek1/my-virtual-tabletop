import jwt from 'jsonwebtoken';

export const socketAuth = (socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    
    socket.userId = decoded.userId;
    next();
  });
};