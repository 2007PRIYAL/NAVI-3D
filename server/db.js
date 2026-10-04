import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_FILE = path.join(DB_DIR, 'aegis_users.db');
const db = new DatabaseSync(DB_FILE);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'Student',
    avatar TEXT NOT NULL DEFAULT 'AB',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Seed default accounts if table is empty
const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
if (!userCountRow || userCountRow.count === 0) {
  const defaultUsers = [
    {
      email: 'amil@aegis.edu',
      password: 'password123',
      name: 'Amil Bhatt',
      role: 'Student',
      avatar: 'AB',
    },
    {
      email: 'sarah@aegis.edu',
      password: 'director123',
      name: 'Dr. Sarah Chen',
      role: 'Facility Director',
      avatar: 'SC',
    },
    {
      email: 'marcus@aegis.edu',
      password: 'secure123',
      name: 'Marcus Vance',
      role: 'Safety Lead',
      avatar: 'MV',
    },
  ];

  const insertStmt = db.prepare(
    'INSERT INTO users (email, password_hash, salt, name, role, avatar) VALUES (?, ?, ?, ?, ?, ?)'
  );

  for (const u of defaultUsers) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(u.password, salt);
    insertStmt.run(u.email, hash, salt, u.name, u.role, u.avatar);
  }
}

// User Operations
export function getUserByEmail(email) {
  if (!email) return null;
  return db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim());
}

export function getUserById(id) {
  if (!id) return null;
  return db.prepare('SELECT id, email, name, role, avatar, created_at, last_login FROM users WHERE id = ?').get(id);
}

export function getAllUsers() {
  return db
    .prepare('SELECT id, email, name, role, avatar, created_at, last_login FROM users ORDER BY id ASC')
    .all();
}

export function createUser({ email, password, name, role = 'Student', avatar }) {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanName = (name || '').trim();
  if (!cleanEmail || !password || !cleanName) {
    throw new Error('Email, password, and name are required.');
  }

  const existing = getUserByEmail(cleanEmail);
  if (existing) {
    throw new Error('An account with this email address already exists.');
  }

  const initials =
    avatar ||
    cleanName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() ||
    'U';

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword(password, salt);

  const result = db
    .prepare('INSERT INTO users (email, password_hash, salt, name, role, avatar) VALUES (?, ?, ?, ?, ?, ?)')
    .run(cleanEmail, passwordHash, salt, cleanName, role, initials);

  const newUser = getUserById(Number(result.lastInsertRowid));
  logActivity(newUser.id, 'USER_REGISTERED', `User ${cleanEmail} registered`);
  return newUser;
}

export function verifyLogin(email, password) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const user = getUserByEmail(email);
  if (!user) {
    throw new Error('No account found with this email address.');
  }

  const computedHash = hashPassword(password, user.salt);
  if (computedHash !== user.password_hash) {
    throw new Error('Incorrect password. Please try again.');
  }

  // Update last login
  const now = new Date().toISOString();
  db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(now, user.id);
  logActivity(user.id, 'USER_LOGIN', `User ${email} signed in`);

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    created_at: user.created_at,
    last_login: now,
  };
}

// Session Operations
export function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

  db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(token, userId, expiresAt);
  return { token, expiresAt };
}

export function getUserByToken(token) {
  if (!token) return null;
  const session = db
    .prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > ?')
    .get(token, new Date().toISOString());

  if (!session) return null;
  return getUserById(session.user_id);
}

export function deleteSession(token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

// Activity & Audit Logging
export function logActivity(userId, action, details = '') {
  try {
    db.prepare('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)').run(
      userId || null,
      action,
      details
    );
  } catch (e) {
    console.error('Failed to log activity:', e);
  }
}

export function getDbStats() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
  const sessionCount = db.prepare('SELECT COUNT(*) as count FROM sessions').get()?.count || 0;
  const logCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get()?.count || 0;
  let fileSize = 0;
  try {
    fileSize = fs.statSync(DB_FILE).size;
  } catch (e) {}

  return {
    database: 'SQLite (node:sqlite)',
    filePath: DB_FILE,
    fileSizeKb: (fileSize / 1024).toFixed(1),
    userCount,
    sessionCount,
    logCount,
    status: 'online',
  };
}

export default {
  getUserByEmail,
  getUserById,
  getAllUsers,
  createUser,
  verifyLogin,
  createSession,
  getUserByToken,
  deleteSession,
  logActivity,
  getDbStats,
};
