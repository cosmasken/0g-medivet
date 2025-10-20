require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose(); // Keep for compute jobs that are still in SQLite
const path = require('path');
const encryption = require('./lib/encryption');
const { apiLimiter, computeLimiter, authLimiter, auditLimiter } = require('./middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for deployment behind load balancer/reverse proxy
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// Apply compute-specific rate limiting
app.use('/api/compute/', computeLimiter);

// Apply auth-specific rate limiting
app.use('/api/users/auth', authLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/register', authLimiter);

// Apply audit-specific rate limiting
app.use('/api/audit', auditLimiter);

// Import routes
const computeRouter = require('./routes/compute');
const downloadRouter = require('./routes/download');

// Always available routes (using SQLite)
app.use('/api/compute', computeRouter);
app.use('/api/download', downloadRouter);

// Conditionally import Supabase-dependent routes
const supabaseClient = require('./supabase').supabase;
if (supabaseClient) {
  const usersRouter = require('./routes/users');
  const recordsRouter = require('./routes/records');
  const healthRouter = require('./routes/health');
  const healthConnectRouter = require('./routes/healthConnect');
  const providersRouter = require('./routes/providers');
  const sharingRouter = require('./routes/sharing');

  app.use('/api/users', usersRouter);
  app.use('/api/records', recordsRouter);
  app.use('/api/health', healthRouter);
  app.use('/api/health-connect', healthConnectRouter);
  app.use('/api/providers', providersRouter);
  app.use('/api', sharingRouter);
} else {
  // Provide fallback endpoints for missing Supabase
  app.use('/api/users/*', (req, res) => {
    res.status(503).json({ error: 'User service unavailable - Supabase not configured' });
  });
  app.use('/api/records/*', (req, res) => {
    res.status(503).json({ error: 'Records service unavailable - Supabase not configured' });
  });
  app.use('/api/health/*', (req, res) => {
    res.status(503).json({ error: 'Health service unavailable - Supabase not configured' });
  });
  app.use('/api/providers/*', (req, res) => {
    res.status(503).json({ error: 'Providers service unavailable - Supabase not configured' });
  });
}

// Initialize SQLite database - keeping only compute-related tables
// Audit logs are now handled by Supabase
const db = new sqlite3.Database(path.join(__dirname, 'audit.db'));

// Create compute_jobs table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS compute_jobs (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      file_id TEXT,
      job_type TEXT NOT NULL CHECK (job_type IN ('medical-analysis', 'enhanced-analysis')),
      status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
      parameters TEXT,
      result TEXT,
      error_message TEXT,
      compute_time_ms INTEGER,
      cost_eth REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      zero_g_job_id TEXT,
      provider_address TEXT,
      is_valid BOOLEAN DEFAULT 0
    )
  `);

  // Create compute_usage table
  db.run(`
    CREATE TABLE IF NOT EXISTS compute_usage (
      id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
      user_id TEXT NOT NULL,
      date DATE NOT NULL,
      total_jobs INTEGER DEFAULT 0,
      successful_jobs INTEGER DEFAULT 0,
      total_compute_time_ms INTEGER DEFAULT 0,
      total_cost_eth REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, date)
    )
  `);

  // Create indexes
  db.run(`CREATE INDEX IF NOT EXISTS idx_compute_jobs_user_id ON compute_jobs(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_compute_jobs_status ON compute_jobs(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_compute_usage_user_date ON compute_usage(user_id, date)`);
});

// Routes

// Get audit logs for a wallet address
app.get('/api/audit/:walletAddress', async (req, res) => {
  const { walletAddress } = req.params;
  const { limit = 50, offset = 0 } = req.query;

  // Validate inputs to prevent injection attacks
  if (!walletAddress || typeof walletAddress !== 'string' || !/^[a-fA-F0-9x]+$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address format' });
  }

  const limitInt = parseInt(limit);
  const offsetInt = parseInt(offset);

  if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
    return res.status(400).json({ error: 'Invalid limit parameter (1-1000)' });
  }

  if (isNaN(offsetInt) || offsetInt < 0) {
    return res.status(400).json({ error: 'Invalid offset parameter' });
  }

  try {
    const { data, error } = await supabaseClient
      .from('audit_logs')
      .select('*')
      .eq('wallet_address', walletAddress)
      .order('timestamp', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);

    if (error) {
      console.error('Supabase audit logs error:', error);
      throw error;
    }

    // Decrypt sensitive details if they exist
    const decryptedLogs = data.map(log => {
      if (log.details) {
        try {
          log.details = JSON.parse(encryption.decrypt(log.details));
        } catch (e) {
          // If decryption fails, keep original value
          console.warn('Could not decrypt audit log details:', e.message);
        }
      }
      return log;
    });

    res.json({ logs: decryptedLogs });
  } catch (error) {
    console.error('Audit logs fetch error:', error);
    res.status(500).json({ error: 'Internal server error occurred during audit logs fetch' });
  }
});

// Create audit log entry
app.post('/api/audit', async (req, res) => {
  const {
    wallet_address,
    action,
    resource_type,
    resource_id,
    details
  } = req.body;

  // Validate required fields
  if (!wallet_address || !action || !resource_type) {
    return res.status(400).json({ error: 'Missing required fields: wallet_address, action, resource_type' });
  }

  // Validate data formats
  if (typeof wallet_address !== 'string' || !/^[a-fA-F0-9x]+$/.test(wallet_address)) {
    return res.status(400).json({ error: 'Invalid wallet address format' });
  }

  if (typeof action !== 'string' || action.length > 100) {
    return res.status(400).json({ error: 'Invalid action format or too long' });
  }

  if (typeof resource_type !== 'string' || resource_type.length > 100) {
    return res.status(400).json({ error: 'Invalid resource_type format or too long' });
  }

  if (resource_id && (typeof resource_id !== 'string' || resource_id.length > 255)) {
    return res.status(400).json({ error: 'Invalid resource_id format or too long' });
  }

  // Find user ID from wallet address
  let user_id = null;
  try {
    const { data: user, error: userError } = await supabaseClient
      .from('users')
      .select('id')
      .eq('wallet_address', wallet_address)
      .single();

    if (userError) {
      console.error('Error finding user by wallet address:', userError);
      // We can still log the audit without user_id if user doesn't exist
    } else {
      user_id = user.id;
    }
  } catch (error) {
    console.error('Error finding user for audit:', error);
    // Continue without user_id
  }

  const ip_address = req.ip || req.connection.remoteAddress || 'unknown';
  const user_agent = req.get('User-Agent') || 'unknown';

  // Encrypt sensitive details
  let encryptedDetails = details;
  if (details && typeof details === 'object') {
    encryptedDetails = encryption.encrypt(JSON.stringify(details));
  } else if (details && typeof details === 'string') {
    encryptedDetails = encryption.encrypt(details);
  }

  try {
    const { data, error } = await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user_id || null,  // Use user_id if found, otherwise null
        wallet_address,
        action,
        resource_type,
        resource_id,
        details: encryptedDetails,
        ip_address,
        user_agent
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase audit creation error:', error);
      throw error;
    }

    res.json({
      success: true,
      id: data.id,
      message: 'Audit log created successfully'
    });
  } catch (error) {
    console.error('Audit creation error:', error);
    res.status(500).json({ error: 'Internal server error occurred during audit creation' });
  }
});

// Get audit statistics
app.get('/api/audit/:walletAddress/stats', async (req, res) => {
  const { walletAddress } = req.params;

  // Validate wallet address format
  if (!walletAddress || typeof walletAddress !== 'string' || !/^[a-fA-F0-9x]+$/.test(walletAddress)) {
    return res.status(400).json({ error: 'Invalid wallet address format' });
  }

  try {
    const { data, error } = await supabaseClient.rpc('get_audit_stats', {
      wallet_addr: walletAddress
    });

    if (error) {
      console.error('Supabase audit stats error:', error);

      // If RPC function doesn't exist, fall back to raw query
      if (error.code === '42883') { // undefined function
        const { data: fallbackData, error: fallbackError } = await supabaseClient
          .from('audit_logs')
          .select(`
            action,
            resource_type,
            count(*)::int as count,
            max(timestamp) as last_activity
          `)
          .eq('wallet_address', walletAddress)
          .group('action, resource_type')
          .order('count', { ascending: false });

        if (fallbackError) {
          console.error('Fallback audit stats error:', fallbackError);
          throw fallbackError;
        }

        res.json({ stats: fallbackData });
      } else {
        throw error;
      }
    } else {
      res.json({ stats: data });
    }
  } catch (error) {
    console.error('Audit stats error:', error);
    res.status(500).json({ error: 'Internal server error occurred during audit stats fetch' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: 'OK',
      supabase: supabaseClient ? 'OK' : 'Not configured',
      compute: 'Available'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`MediVet server running on port ${PORT}`);
  console.log(`Services available: Database ✓, Compute ✓${supabaseClient ? ', Supabase ✓' : ''}`);
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
