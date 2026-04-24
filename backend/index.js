const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const createProxy = require('./proxy');
const fs = require('fs'); // Import fs
const path = require('path'); // Import path
const { pathToFileURL } = require('url');
const { db } = require('./db');

const app = express();
const PLUGINS_DIR = path.join(__dirname, 'plugins');

async function bootPlugins() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR);
  }

  const files = fs.readdirSync(PLUGINS_DIR);

  for (const file of files) {
    if (file.endsWith('.js') || file.endsWith('.mjs') || file.endsWith('.cjs')) {
      const appId = path.parse(file).name;

      try {
        // Check if the plugin is enabled in the database
        const isEnabled = await new Promise((resolve, reject) => {
          db.get('SELECT enabled FROM plugins WHERE id = ?', [appId], (err, row) => {
            if (err) reject(err);
            else resolve(row ? row.enabled === 1 : false);
          });
        });

        // Skip if not enabled
        if (!isEnabled) {
          continue;
        }

        const pluginPath = path.join(PLUGINS_DIR, file);
        const plugin = await import(pathToFileURL(pluginPath).href);
        const init = plugin.default?.default || plugin.default || plugin;

        if (typeof init === 'function') {
          const router = express.Router();
          await init(router);
          app.use(`/api/apps/${appId}`, router);

          console.log(`Successfully loaded plugin: ${appId}`);
        }
      } catch (err) {
        console.log(`Failed to load plugin ${appId}:`, err);
      }
    }
  }
}

app.set('trust proxy', 1); // Trust reverse proxy headers (e.g., X-Forwarded-Proto)
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const originCheck = require('./middleware/originCheck');
const { authenticateToken } = require('./middleware/authenticateToken');

const authRoutes = require('./routes/auth');
const appsRoutes = require('./routes/apps');
const dataRoutes = require('./routes/data');
const settingsRoutes = require('./routes/settings');
const wallpapersRoutes = require('./routes/wallpapers');
const continuityRoutes = require('./routes/continuity');

const SECRET = process.env.JWT_SECRET;

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  //origin: true,
  origin: process.env.FRONTEND_ADDRESSES.split(',').map(addr => addr.trim()),
  credentials: true
}));

const unblocker = createProxy();
app.use('/proxy', authenticateToken); // Verify token for all /proxy/* paths
app.use(unblocker);

app.use((req, res, next) => {
  if (!req.path.startsWith('/apps/run') && !req.path.startsWith('/proxy/')) {
    return originCheck(req, res, next);
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/apps', appsRoutes);
app.use('/data', dataRoutes);
app.use('/settings', settingsRoutes);
app.use('/wallpapers', wallpapersRoutes);
app.use('/continuity', continuityRoutes);

const continuityStore = new Map();
app.locals.continuityStore = continuityStore;

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Global Error Handler:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ error: 'Internal Server Error', details: err.message });
});

// Process-level uncaught exception handling to prevent crash
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  // Optional: Clean up resources but keep running if critical
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('UNHANDLED REJECTION:', reason);
});

// Load certificates
//const httpsOptions = {
//  key: fs.readFileSync('./key.pem'),
//  cert: fs.readFileSync('./cert.pem')
//};


// Create HTTPS server instead of app.listen
//https.createServer(httpsOptions, app).listen(4000, '0.0.0.0', () => {
//  console.log('Server running on https://0.0.0.0:4000 (accessible on your LAN)');
//});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_ADDRESSES.split(',').map(addr => addr.trim()),
    credentials: true,
  },
});

app.locals.io = io;

function parseCookieValue(cookieHeader, key) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(';').map(part => part.trim());
  for (const part of parts) {
    if (part.startsWith(`${key}=`)) {
      return decodeURIComponent(part.slice(key.length + 1));
    }
  }
  return null;
}

io.use((socket, next) => {
  const token = parseCookieValue(socket.handshake.headers.cookie, 'token');
  if (!token) {
    return next(new Error('Unauthorized'));
  }

  jwt.verify(token, SECRET, (err, user) => {
    if (err) {
      return next(new Error('Unauthorized'));
    }
    socket.user = user;
    next();
  });
});

io.on('connection', (socket) => {
  const userId = String(socket.user.id);
  const room = `user:${userId}`;
  socket.join(room);

  const userContinuity = continuityStore.get(userId);
  const items = userContinuity
    ? Array.from(userContinuity.entries()).map(([appId, value]) => ({
        appId,
        data: value.data,
        updatedAt: value.updatedAt,
      }))
    : [];

  socket.emit('continuity:sync', { items });

  socket.on('disconnect', () => {
    const userContinuity = continuityStore.get(userId);
    if (!userContinuity) {
      return;
    }

    const dismissedAppIds = [];

    for (const [appId, value] of userContinuity.entries()) {
      if (value?.sourceSocketId === socket.id) {
        userContinuity.delete(appId);
        dismissedAppIds.push(appId);
      }
    }

    if (userContinuity.size === 0) {
      continuityStore.delete(userId);
    }

    dismissedAppIds.forEach((appId) => {
      io.to(room).emit('continuity:dismiss', { appId });
    });
  });
});

async function startServer() {
  await bootPlugins();
  server.listen(4000, '0.0.0.0', () => console.log('Server running on http://0.0.0.0:4000 (accessible on your LAN)'));
}

startServer();