import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';

// SQLite database initialization
let db;

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');

      // Create tables
      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            creator_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT,
            x INTEGER DEFAULT 0,
            y INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Check if we have any users, if not create a test user
        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
          if (err) {
            console.error('Error counting users:', err);
            reject(err);
            return;
          }

          if (row.count === 0) {
            bcrypt.hash('password123', 12).then(hashedPassword => {
              db.run(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                ['testuser', 'test@test.com', hashedPassword],
                function(err) {
                  if (err) {
                    console.error('Error creating test user:', err);
                    reject(err);
                    return;
                  }
                  console.log('Test user created: test@test.com / password123');
                  resolve();
                }
              );
            });
          } else {
            resolve();
          }
        });
      });
    });
  });
}

// Database helper functions
const dbHelpers = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
};

// Initialize database
initializeDatabase().then(() => {
  console.log('Database initialized successfully');
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

console.log('Running with SQLite database');

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static('uploads'));

// Add io to request object for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// API endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const existingUser = await dbHelpers.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const result = await dbHelpers.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    const newUser = await dbHelpers.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [result.id]
    );

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      token, 
      user: newUser,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ 
        message: 'User with this email or username already exists' 
      });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await dbHelpers.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at
    };

    res.json({ 
      token, 
      user: userResponse,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await dbHelpers.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all users (for testing)
app.get('/api/auth/users', authenticateToken, async (req, res) => {
  try {
    const users = await dbHelpers.all(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Basic route for testing
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await dbHelpers.get('SELECT COUNT(*) as count FROM users');
    const sessionCount = await dbHelpers.get('SELECT COUNT(*) as count FROM sessions');
    
    res.json({ 
      status: 'Server is running', 
      database: 'SQLite',
      users: userCount.count,
      sessions: sessionCount.count,
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    res.json({ 
      status: 'Server is running', 
      database: 'SQLite (error getting stats)',
      timestamp: new Date().toISOString() 
    });
  }
});

// Sessions endpoints
app.get('/api/sessions', (req, res) => {
  res.json([]);
});

// Socket.io
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down gracefully...');
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err);
      } else {
        console.log('Database connection closed');
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Database file: ./database.sqlite`);
  console.log('Test user: test@test.com / password123');
});