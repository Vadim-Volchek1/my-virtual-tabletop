import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let dbInstance = null;

export const getDB = () => {
  return dbInstance;
};

export const initializeDB = async () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  return dbInstance;
};

export const closeDB = async () => {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
  }
};

// Database helper functions
export const dbHelpers = {
  // User operations
  createUser: async (userData) => {
    const db = getDB();
    const result = await db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [userData.username, userData.email, userData.password]
    );
    return result.lastID;
  },

  getUserById: async (id) => {
    const db = getDB();
    return await db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
  },

  getUserByEmail: async (email) => {
    const db = getDB();
    return await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  },

  getUserByUsername: async (username) => {
    const db = getDB();
    return await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
  },

  getAllUsers: async () => {
    const db = getDB();
    return await db.all(
      'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
    );
  }
};