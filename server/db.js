import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function hashPassword(password, salt) {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

const DEFAULT_USERS = [
  {
    email: 'amil@navi3d.internal',
    password: 'password123',
    name: 'Amil Bhatt',
    role: 'Student',
    avatar: 'AB',
  },
  {
    email: 'sarah@navi3d.internal',
    password: 'director123',
    name: 'Dr. Sarah Chen',
    role: 'Facility Director',
    avatar: 'SC',
  },
  {
    email: 'marcus@navi3d.internal',
    password: 'secure123',
    name: 'Marcus Vance',
    role: 'Safety Lead',
    avatar: 'MV',
  },
];

let adapter = null;

// ============================================================================
// POSTGRESQL ADAPTER
// ============================================================================
class PostgresAdapter {
  constructor(connectionString) {
    this.connectionString = connectionString;
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    this.pool = new pg.Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  async init() {
    // 1. Create tables
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL DEFAULT 'Student',
        avatar VARCHAR(10) NOT NULL DEFAULT 'AB',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS sessions (
        token VARCHAR(255) PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(255) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Check seed count
    const res = await this.pool.query('SELECT COUNT(*) as count FROM users');
    const count = parseInt(res.rows[0].count, 10);
    if (count === 0) {
      for (const u of DEFAULT_USERS) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(u.password, salt);
        await this.pool.query(
          'INSERT INTO users (email, password_hash, salt, name, role, avatar) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (email) DO NOTHING',
          [u.email.toLowerCase().trim(), hash, salt, u.name, u.role, u.avatar]
        );
      }
    }
  }

  async getUserByEmail(email) {
    if (!email) return null;
    const res = await this.pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()]);
    return res.rows[0] || null;
  }

  async getUserById(id) {
    if (!id) return null;
    const res = await this.pool.query(
      'SELECT id, email, name, role, avatar, created_at, last_login FROM users WHERE id = $1',
      [id]
    );
    return res.rows[0] || null;
  }

  async getAllUsers() {
    const res = await this.pool.query(
      'SELECT id, email, name, role, avatar, created_at, last_login FROM users ORDER BY id ASC'
    );
    return res.rows;
  }

  async createUser({ email, password, name, role = 'Student', avatar }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const resolvedAvatar =
      avatar ||
      name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const res = await this.pool.query(
      'INSERT INTO users (email, password_hash, salt, name, role, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, name, role, avatar, created_at',
      [cleanEmail, hash, salt, name.trim(), role, resolvedAvatar]
    );

    const user = res.rows[0];
    await this.logActivity(user.id, 'user_registered', `Registered with role: ${role}`);
    return user;
  }

  async verifyLogin(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const user = await this.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.password_hash) {
      throw new Error('Invalid email or password.');
    }

    await this.pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);
    await this.logActivity(user.id, 'user_login', `Logged in via REST API`);

    const { password_hash, salt, ...safeUser } = user;
    return safeUser;
  }

  async createSession(userId, hoursValid = 72) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + hoursValid * 3600 * 1000);
    await this.pool.query('INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)', [
      token,
      userId,
      expiresAt,
    ]);
    return { token, expiresAt };
  }

  async verifySession(token) {
    if (!token) return null;
    const res = await this.pool.query(
      `SELECT u.id, u.email, u.name, u.role, u.avatar, u.created_at, u.last_login 
       FROM sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.token = $1 AND s.expires_at > CURRENT_TIMESTAMP`,
      [token]
    );
    return res.rows[0] || null;
  }

  async deleteSession(token) {
    if (!token) return;
    await this.pool.query('DELETE FROM sessions WHERE token = $1', [token]);
  }

  async logActivity(userId, action, details = null) {
    try {
      await this.pool.query('INSERT INTO activity_logs (user_id, action, details) VALUES ($1, $2, $3)', [
        userId || null,
        action,
        details,
      ]);
    } catch (_) {}
  }

  async getDbStats() {
    const uRes = await this.pool.query('SELECT COUNT(*) as count FROM users');
    const sRes = await this.pool.query('SELECT COUNT(*) as count FROM sessions WHERE expires_at > CURRENT_TIMESTAMP');
    const aRes = await this.pool.query('SELECT COUNT(*) as count FROM activity_logs');
    return {
      database: 'PostgreSQL (Cloud Database)',
      host: new URL(this.connectionString).host || 'cloud-pg',
      userCount: parseInt(uRes.rows[0].count, 10),
      sessionCount: parseInt(sRes.rows[0].count, 10),
      logCount: parseInt(aRes.rows[0].count, 10),
      status: 'online',
    };
  }
}

// ============================================================================
// SQLITE ADAPTER (Node.js Built-in SQLite)
// ============================================================================
class SqliteAdapter {
  constructor() {
    const DB_DIR = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    this.dbFile = path.join(DB_DIR, 'aegis_users.db');
  }

  async init() {
    const { DatabaseSync } = await import('node:sqlite');
    this.db = new DatabaseSync(this.dbFile);

    this.db.exec(`
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

    const userCountRow = this.db.prepare('SELECT COUNT(*) as count FROM users').get();
    if (!userCountRow || userCountRow.count === 0) {
      const insertStmt = this.db.prepare(
        'INSERT INTO users (email, password_hash, salt, name, role, avatar) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const u of DEFAULT_USERS) {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = hashPassword(u.password, salt);
        insertStmt.run(u.email, hash, salt, u.name, u.role, u.avatar);
      }
    }
  }

  async getUserByEmail(email) {
    if (!email) return null;
    return this.db.prepare('SELECT * FROM users WHERE email = ? COLLATE NOCASE').get(email.trim()) || null;
  }

  async getUserById(id) {
    if (!id) return null;
    return (
      this.db
        .prepare('SELECT id, email, name, role, avatar, created_at, last_login FROM users WHERE id = ?')
        .get(id) || null
    );
  }

  async getAllUsers() {
    return this.db
      .prepare('SELECT id, email, name, role, avatar, created_at, last_login FROM users ORDER BY id ASC')
      .all();
  }

  async createUser({ email, password, name, role = 'Student', avatar }) {
    const cleanEmail = email.toLowerCase().trim();
    const existing = await this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('An account with this email already exists.');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = hashPassword(password, salt);
    const resolvedAvatar =
      avatar ||
      name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

    const result = this.db
      .prepare('INSERT INTO users (email, password_hash, salt, name, role, avatar) VALUES (?, ?, ?, ?, ?, ?)')
      .run(cleanEmail, hash, salt, name.trim(), role, resolvedAvatar);

    const user = await this.getUserById(result.lastInsertRowid);
    await this.logActivity(user.id, 'user_registered', `Registered with role: ${role}`);
    return user;
  }

  async verifyLogin(email, password) {
    const cleanEmail = (email || '').toLowerCase().trim();
    const user = await this.getUserByEmail(cleanEmail);
    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const testHash = hashPassword(password, user.salt);
    if (testHash !== user.password_hash) {
      throw new Error('Invalid email or password.');
    }

    this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?').run(user.id);
    await this.logActivity(user.id, 'user_login', `Logged in via REST API`);

    const { password_hash, salt, ...safeUser } = user;
    return safeUser;
  }

  async createSession(userId, hoursValid = 72) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + hoursValid * 3600 * 1000).toISOString();
    this.db.prepare('INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)').run(
      token,
      userId,
      expiresAt
    );
    return { token, expiresAt };
  }

  async verifySession(token) {
    if (!token) return null;
    return (
      this.db
        .prepare(
          `SELECT u.id, u.email, u.name, u.role, u.avatar, u.created_at, u.last_login 
           FROM sessions s 
           JOIN users u ON s.user_id = u.id 
           WHERE s.token = ? AND s.expires_at > CURRENT_TIMESTAMP`
        )
        .get(token) || null
    );
  }

  async deleteSession(token) {
    if (!token) return;
    this.db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }

  async logActivity(userId, action, details = null) {
    try {
      this.db
        .prepare('INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)')
        .run(userId || null, action, details);
    } catch (_) {}
  }

  async getDbStats() {
    const userCount = this.db.prepare('SELECT COUNT(*) as count FROM users').get()?.count || 0;
    const sessionCount =
      this.db.prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > CURRENT_TIMESTAMP').get()?.count || 0;
    const logCount = this.db.prepare('SELECT COUNT(*) as count FROM activity_logs').get()?.count || 0;

    let fileSizeKb = '0';
    try {
      const stat = fs.statSync(this.dbFile);
      fileSizeKb = (stat.size / 1024).toFixed(1);
    } catch (_) {}

    return {
      database: 'SQLite (node:sqlite)',
      filePath: this.dbFile,
      fileSizeKb,
      userCount,
      sessionCount,
      logCount,
      status: 'online',
    };
  }
}

// ============================================================================
// SINGLETON GETTER
// ============================================================================
export async function getDb() {
  if (adapter) return adapter;

  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
    console.log('[NAVI-3D DB] Initializing Cloud PostgreSQL Adapter...');
    adapter = new PostgresAdapter(dbUrl);
  } else {
    console.log('[NAVI-3D DB] Initializing Local SQLite Adapter...');
    adapter = new SqliteAdapter();
  }

  await adapter.init();
  console.log('[NAVI-3D DB] Database initialized and seeded successfully.');
  return adapter;
}

export default {
  getDb,
  hashPassword,
};
