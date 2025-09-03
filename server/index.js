const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const usersRouter = require('./routes/users');
const recordsRouter = require('./routes/records');
const healthRouter = require('./routes/health');
const providersRouter = require('./routes/providers');

// Use routes
app.use('/api/users', usersRouter);
app.use('/api/records', recordsRouter);
app.use('/api/health', healthRouter);
app.use('/api/providers', providersRouter);

// Initialize SQLite database
const db = new sqlite3.Database(path.join(__dirname, 'audit.db'));

// Create audit_logs table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      wallet_address TEXT NOT NULL,
      action TEXT NOT NULL,
      resource_type TEXT NOT NULL,
      resource_id TEXT,
      details TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      ip_address TEXT,
      user_agent TEXT
    )
  `);
});

// Routes

// Get audit logs for a wallet address
app.get('/api/audit/:walletAddress', (req, res) => {
  const { walletAddress } = req.params;
  const { limit = 50, offset = 0 } = req.query;
  
  db.all(
    `SELECT * FROM audit_logs 
     WHERE wallet_address = ? 
     ORDER BY timestamp DESC 
     LIMIT ? OFFSET ?`,
    [walletAddress, parseInt(limit), parseInt(offset)],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ logs: rows });
    }
  );
});

// Create audit log entry
app.post('/api/audit', (req, res) => {
  const { 
    wallet_address, 
    action, 
    resource_type, 
    resource_id, 
    details 
  } = req.body;
  
  const ip_address = req.ip || req.connection.remoteAddress;
  const user_agent = req.get('User-Agent');
  
  db.run(
    `INSERT INTO audit_logs 
     (wallet_address, action, resource_type, resource_id, details, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [wallet_address, action, resource_type, resource_id, details, ip_address, user_agent],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        id: this.lastID,
        message: 'Audit log created successfully' 
      });
    }
  );
});

// Get audit statistics
app.get('/api/audit/:walletAddress/stats', (req, res) => {
  const { walletAddress } = req.params;
  
  db.all(
    `SELECT 
       action,
       resource_type,
       COUNT(*) as count,
       MAX(timestamp) as last_activity
     FROM audit_logs 
     WHERE wallet_address = ?
     GROUP BY action, resource_type
     ORDER BY count DESC`,
    [walletAddress],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ stats: rows });
    }
  );
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`MediVet audit server running on port ${PORT}`);
});

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
