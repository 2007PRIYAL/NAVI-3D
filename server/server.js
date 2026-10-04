import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { getDb } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow all origins in production API (CORS enabled for Vercel/Netlify/local frontend)
      callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health' && req.path !== '/api/health') {
      console.log(`[NAVI-3D API] ${req.method} ${req.path} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// Helper: Extract Bearer Token
function extractBearerToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

// ----------------------------------------------------------------------------
// HEALTH & DIAGNOSTIC ENDPOINTS
// ----------------------------------------------------------------------------
app.get(['/health', '/api/health'], async (req, res) => {
  try {
    const db = await getDb();
    const stats = await db.getDbStats();
    res.json({
      status: 'healthy',
      service: 'NAVI-3D Backend Engine',
      version: '1.2.0',
      uptime: Math.round(process.uptime()),
      database: stats.database,
      dbStatus: stats.status,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ----------------------------------------------------------------------------
// AUTHENTICATION & SPATIAL IDENTITY ROUTES
// ----------------------------------------------------------------------------

// 1. GET /api/auth/stats — Database Health & Node Counts
app.get('/api/auth/stats', async (req, res) => {
  try {
    const db = await getDb();
    const stats = await db.getDbStats();
    res.json({ success: true, data: stats });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. GET /api/auth/users — List Registered Spatial Accounts
app.get('/api/auth/users', async (req, res) => {
  try {
    const db = await getDb();
    const users = await db.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. POST /api/auth/login — User Authentication
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const db = await getDb();
    const user = await db.verifyLogin(email, password);
    const { token, expiresAt } = await db.createSession(user.id);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user,
        token,
        expiresAt,
      },
    });
  } catch (err) {
    res.status(401).json({ success: false, message: err.message || 'Login failed.' });
  }
});

// 4. POST /api/auth/register — Account Creation
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, avatar } = req.body || {};
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, message: 'Email, password, and name are required.' });
    }

    const db = await getDb();
    const user = await db.createUser({ email, password, name, role, avatar });
    const { token, expiresAt } = await db.createSession(user.id);

    res.status(201).json({
      success: true,
      message: `Account created successfully for ${user.name}!`,
      data: {
        user,
        token,
        expiresAt,
      },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message || 'Registration failed.' });
  }
});

// 5. GET /api/auth/me — Active Session Introspection
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing Authorization header.' });
    }

    const db = await getDb();
    const user = await db.verifySession(token);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid or expired session token.' });
    }

    res.json({ success: true, data: { user } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. POST /api/auth/logout — Invalidate Session
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = extractBearerToken(req);
    if (token) {
      const db = await getDb();
      await db.deleteSession(token);
    }
    res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Optional Static Frontend Serving (if dist exists and unified deployment is enabled)
const DIST_PATH = path.resolve(__dirname, '../dist');
if (fs.existsSync(DIST_PATH)) {
  console.log('[NAVI-3D API] Serving static production frontend from /dist');
  app.use(express.static(DIST_PATH));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path === '/health') return next();
    res.sendFile(path.join(DIST_PATH, 'index.html'));
  });
}

// ----------------------------------------------------------------------------
// SERVER BOOTSTRAP
// ----------------------------------------------------------------------------
async function startServer() {
  try {
    // Pre-initialize database connection
    await getDb();

    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`🚀 NAVI-3D Production Backend Online`);
      console.log(`📡 URL: http://0.0.0.0:${PORT}`);
      console.log(`🏥 Health: http://0.0.0.0:${PORT}/api/health`);
      console.log(`=======================================================`);
    });

    const shutdown = () => {
      console.log('[NAVI-3D API] Gracefully shutting down...');
      server.close(() => {
        console.log('[NAVI-3D API] Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    console.error('[NAVI-3D API] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();

export default app;
