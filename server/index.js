require('dotenv').config();
const express = require('express');
const corsConfig = require('./cors-config');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const encryption = require('./lib/encryption');
const { apiLimiter, authLimiter, auditLimiter } = require('./middleware/rateLimit');
const { pool, initDatabase } = require('./lib/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for deployment behind load balancer/reverse proxy
app.set('trust proxy', 1);

// Initialize PostgreSQL database
initDatabase();

// Initialize SQLite for compute jobs
const db = new sqlite3.Database(path.join(__dirname, 'audit.db'));

// Middleware
app.use(corsConfig);
app.use(express.json());

// Add explicit OPTIONS handler for all routes
app.options('*', (req, res) => {
  console.log('OPTIONS request from:', req.get('Origin'));
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/users/auth', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);
app.use('/api/audit', auditLimiter);

// Import routes
const contractRouter = require('./routes/contract');
const usersRouter = require('./routes/users');
const recordsRouter = require('./routes/records');
const providersRouter = require('./routes/providers');
const sharingRouter = require('./routes/sharing');
const healthRouter = require('./routes/health');
const healthConnectRouter = require('./routes/health-connect');
const auditRouter = require('./routes/audit');

// Always available routes
app.use('/api/contract', contractRouter);
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/providers', providersRouter);
app.use('/api/sharing', sharingRouter);
app.use('/api/health', healthRouter);
app.use('/api/health-connect', healthConnectRouter);
app.use('/api/audit', auditRouter);


// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'OK',
      postgresql: 'OK',
      compute: 'Available'
    }
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MediVet Server API',
    status: 'Running',
    version: '1.0.0'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MediVet server running on port ${PORT}`);
  console.log(`Services available: Database ✓, Storage ✓, PostgreSQL ✓`);
});

// Make database available to routes
app.set('db', db);

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Database connection closed.');
    process.exit(0);
  });
});
