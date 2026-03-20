const express = require('express');
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

app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors({
  //origin: true,
  origin: process.env.FRONTEND_ADDRESSES.split(',').map(addr => addr.trim()),
  credentials: true
}));

app.use((req, res, next) => {
  if (!req.path.startsWith('/apps/run')) {
    return originCheck(req, res, next);
  }
  next();
});

app.use('/auth', authRoutes);
app.use('/apps', appsRoutes);
app.use('/data', dataRoutes);
app.use('/settings', settingsRoutes);
app.use('/wallpapers', wallpapersRoutes);

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

app.listen(4000, '0.0.0.0', () => console.log('Server running on http://0.0.0.0:4000 (accessible on your LAN)'));