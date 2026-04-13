const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Unblocker = require('unblocker');
const { Transform } = require('stream');
//const https = require('https'); // Import https
//const fs = require('fs'); // Import fs
const app = express();
require('dotenv').config();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const originCheck = require('./middleware/originCheck');

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

const unblocker = new Unblocker({ 
  prefix: '/proxy/',
  responseMiddleware: [
    (data) => {
      if (data.contentType && data.contentType.includes('text/html')) {
        let injected = false;
        const injectTransform = new Transform({
          transform(chunk, encoding, callback) {
            let chunkStr = chunk.toString();
            // Try to inject before </body>, if present in the current chunk
            if (!injected && /<\/body>/i.test(chunkStr)) {
              chunkStr = chunkStr.replace(/<\/body>/i, `
                <script>
                  document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.target === '_blank') {
                      e.preventDefault();
                      window.parent.postMessage({
                        type: 'OPEN_PROXIED_WINDOW',
                        url: link.href
                      }, '*');
                    }
                  });
                </script>
              </body>`);
              injected = true;
            }
            this.push(Buffer.from(chunkStr));
            callback();
          },
          flush(callback) {
            // If we didn't inject near </body> (perhaps the stream ended before or there was no body), append it at the end
            if (!injected) {
              this.push(Buffer.from(`
                <script>
                  document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.target === '_blank') {
                      e.preventDefault();
                      window.parent.postMessage({
                        type: 'OPEN_PROXIED_WINDOW',
                        url: link.href
                      }, '*');
                    }
                  });
                </script>
              `));
            }
            callback();
          }
        });
        
        data.stream = data.stream.pipe(injectTransform);
      }
    }
  ]
});
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

server.listen(4000, '0.0.0.0', () => console.log('Server running on http://0.0.0.0:4000 (accessible on your LAN)'));