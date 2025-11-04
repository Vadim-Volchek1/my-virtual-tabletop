import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbHelpers } from '../config/database.js';

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await dbHelpers.get(
      'SELECT * FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existing) {
      return res.status(400).json({ message: 'User with this email or username already exists' });
    }

    const hashed = await bcrypt.hash(password, 12);
    const result = await dbHelpers.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashed]
    );

    const token = signToken(result.id);
    res.status(201).json({
      token,
      user: { id: result.id, username, email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await dbHelpers.get('SELECT * FROM users WHERE email = ?', [email]);

    if (!user) return res.status(401).json({ message: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid email or password' });

    const token = signToken(user.id);
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await dbHelpers.get('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to get user' });
  }
};
