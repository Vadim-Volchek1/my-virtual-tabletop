import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

const gameSessionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  gameSystem: { type: String, default: 'generic' },
  isPublic: { type: Boolean, default: true },
  password: { type: String, default: null },
  maxPlayers: { type: Number, default: 10 },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  players: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['gm', 'player'], default: 'player' },
    color: { type: String, default: '#000000' },
    joinedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const mapSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  gridSize: { type: Number, default: 50 },
  gridEnabled: { type: Boolean, default: true },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', required: true },
  createdAt: { type: Date, default: Date.now }
});

const tokenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  x: { type: Number, default: 0 },
  y: { type: Number, default: 0 },
  width: { type: Number, default: 50 },
  height: { type: Number, default: 50 },
  rotation: { type: Number, default: 0 },
  isVisible: { type: Boolean, default: true },
  isLocked: { type: Boolean, default: false },
  metadata: { type: Object, default: {} },
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'GameSession', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Map' },
  createdAt: { type: Date, default: Date.now }
});

export const User = mongoose.model('User', userSchema);
export const GameSession = mongoose.model('GameSession', gameSessionSchema);
export const Map = mongoose.model('Map', mapSchema);
export const Token = mongoose.model('Token', tokenSchema);