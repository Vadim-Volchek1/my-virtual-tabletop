import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

let db;

export async function initializeDatabase() {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database('./database.sqlite', (err) => {
      if (err) {
        console.error('Error opening database:', err);
        return reject(err);
      }

      console.log('✅ Connected to SQLite database');

      db.serialize(() => {
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            creator_id INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            image_url TEXT,
            x INTEGER DEFAULT 0,
            y INTEGER DEFAULT 0
          )
        `);

        db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
          if (row.count === 0) {
            const hashed = await bcrypt.hash('password123', 12);
            db.run(
              'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
              ['testuser', 'test@test.com', hashed]
            );
            console.log('👤 Created test user: test@test.com / password123');
          }
          resolve();
        });
      });
    });
  });
}

export const dbHelpers = {
  run: (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  }),

  get: (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  }),

  all: (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  })
};
