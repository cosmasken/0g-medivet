const express = require('express');
const { pool } = require('../lib/database');
const router = express.Router();

// Create audit log entry
router.post('/', async (req, res) => {
  try {
    const { wallet_address, action, resource_type, resource_id, details = {} } = req.body;

    if (!wallet_address || !action || !resource_type) {
      return res.status(400).json({ error: 'Missing required fields: wallet_address, action, resource_type' });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const client = await pool.connect();
    try {
      // First, get user ID based on wallet address
      const userResult = await client.query(
        'SELECT id FROM users WHERE wallet_address = $1',
        [wallet_address.toLowerCase()]
      );

      let userId = null;
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }

      // Create audit log entry
      const result = await client.query(
        `INSERT INTO audit_logs 
         (user_id, wallet_address, action, resource_type, resource_id, details, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, timestamp`,
        [
          userId,
          wallet_address.toLowerCase(),
          action,
          resource_type,
          resource_id,
          JSON.stringify(details),
          req.ip,
          req.get('User-Agent') || ''
        ]
      );

      res.json({
        logId: result.rows[0].id,
        timestamp: result.rows[0].timestamp
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Audit log creation error:', error);
    res.status(500).json({ error: 'Failed to create audit log entry' });
  }
});

// Get audit logs for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId) && 
        !(userId.startsWith('0x') && userId.length === 42))) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const client = await pool.connect();
    try {
      let userUuid = userId;
      if (userId.startsWith('0x')) {
        // If userId is a wallet address, convert to user UUID
        const userResult = await client.query(
          'SELECT id FROM users WHERE wallet_address = $1',
          [userId.toLowerCase()]
        );

        if (userResult.rows.length === 0) {
          return res.json({ logs: [] });
        }
        userUuid = userResult.rows[0].id;
      }

      // Get audit logs for the user
      const result = await client.query(`
        SELECT id, wallet_address, action, resource_type, resource_id, 
               details, timestamp, ip_address
        FROM audit_logs 
        WHERE user_id = $1 OR wallet_address = $1
        ORDER BY timestamp DESC
        LIMIT 100
      `, [userUuid]);

      res.json({ logs: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// Get audit logs by action type
router.get('/action/:action', async (req, res) => {
  try {
    const { action } = req.params;
    
    const client = await pool.connect();
    try {
      const result = await client.query(`
        SELECT id, wallet_address, resource_type, resource_id, 
               details, timestamp, ip_address
        FROM audit_logs 
        WHERE action = $1
        ORDER BY timestamp DESC
        LIMIT 100
      `, [action]);

      res.json({ logs: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get audit logs by action error:', error);
    res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

module.exports = router;