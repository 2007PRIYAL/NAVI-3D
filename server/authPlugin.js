import db from './db.js';

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        // 1MB limit
        req.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
    req.on('error', (err) => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function extractBearerToken(req) {
  const authHeader = req.headers['authorization'] || '';
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export function authApiPlugin() {
  return {
    name: 'navi-3d-sqlite-auth-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost:5173'));
        const pathname = url.pathname;

        if (!pathname.startsWith('/api/auth')) {
          return next();
        }

        // Handle CORS Preflight
        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
          return res.end();
        }

        try {
          // 1. GET /api/auth/stats
          if (pathname === '/api/auth/stats' && req.method === 'GET') {
            const stats = db.getDbStats();
            return sendJson(res, 200, { success: true, data: stats });
          }

          // 2. GET /api/auth/users
          if (pathname === '/api/auth/users' && req.method === 'GET') {
            const users = db.getAllUsers();
            return sendJson(res, 200, { success: true, data: users });
          }

          // 3. POST /api/auth/login
          if (pathname === '/api/auth/login' && req.method === 'POST') {
            const body = await readJsonBody(req);
            const { email, password } = body;
            const user = db.verifyLogin(email, password);
            const { token, expiresAt } = db.createSession(user.id);
            return sendJson(res, 200, {
              success: true,
              message: `Welcome back, ${user.name}!`,
              data: {
                user,
                token,
                expiresAt,
              },
            });
          }

          // 4. POST /api/auth/register
          if (pathname === '/api/auth/register' && req.method === 'POST') {
            const body = await readJsonBody(req);
            const { email, password, name, role, avatar } = body;
            const user = db.createUser({ email, password, name, role, avatar });
            const { token, expiresAt } = db.createSession(user.id);
            return sendJson(res, 201, {
              success: true,
              message: `Account created successfully for ${user.name}!`,
              data: {
                user,
                token,
                expiresAt,
              },
            });
          }

          // 5. GET /api/auth/me
          if (pathname === '/api/auth/me' && req.method === 'GET') {
            const token = extractBearerToken(req);
            if (!token) {
              return sendJson(res, 401, { success: false, message: 'Authentication required' });
            }
            const user = db.getUserByToken(token);
            if (!user) {
              return sendJson(res, 401, { success: false, message: 'Session expired or invalid' });
            }
            return sendJson(res, 200, { success: true, data: user });
          }

          // 6. POST /api/auth/logout
          if (pathname === '/api/auth/logout' && req.method === 'POST') {
            const token = extractBearerToken(req);
            if (token) {
              db.deleteSession(token);
            }
            return sendJson(res, 200, { success: true, message: 'Successfully logged out' });
          }

          // 7. POST /api/auth/activity
          if (pathname === '/api/auth/activity' && req.method === 'POST') {
            const token = extractBearerToken(req);
            const user = token ? db.getUserByToken(token) : null;
            const body = await readJsonBody(req);
            db.logActivity(user?.id, body.action || 'CUSTOM_ACTION', JSON.stringify(body.details || {}));
            return sendJson(res, 200, { success: true });
          }

          return sendJson(res, 404, { success: false, message: 'Auth endpoint not found' });
        } catch (error) {
          console.error('API Error:', error);
          return sendJson(res, 400, {
            success: false,
            message: error.message || 'An error occurred processing your request',
          });
        }
      });
    },
  };
}

export default authApiPlugin;
