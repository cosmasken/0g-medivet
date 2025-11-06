const express = require('express');
const { pool } = require('../lib/database');
const router = express.Router();

// Auth endpoint - create or get user by wallet address
router.post('/auth', async (req, res) => {
  try {
    console.log('Auth request received from origin:', req.get('Origin'));
    console.log('Auth request headers:', req.headers);
    console.log('Auth request body:', req.body);
    
    // Handle both walletAddress and wallet_address formats
    let { wallet_address, walletAddress, role = 'patient' } = req.body;
    wallet_address = wallet_address || walletAddress;
    
    // Remove local- prefix if present
    if (wallet_address && wallet_address.startsWith('local-')) {
      wallet_address = wallet_address.replace('local-', '');
    }
    
    console.log('Processed wallet_address:', wallet_address);
    
    if (!wallet_address || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      console.log('Invalid wallet address:', wallet_address);
      return res.status(400).json({ error: 'Valid wallet address required' });
    }

    const client = await pool.connect();
    try {
      // Check if user exists
      let { rows } = await client.query(
        'SELECT * FROM users WHERE wallet_address = $1',
        [wallet_address.toLowerCase()]
      );

      let user;
      if (rows.length > 0) {
        user = rows[0];
      } else {
        // Create new user
        const insertResult = await client.query(
          'INSERT INTO users (wallet_address, user_type) VALUES ($1, $2) RETURNING *',
          [wallet_address.toLowerCase(), role]
        );
        user = insertResult.rows[0];
      }

      res.json({
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          user_type: user.user_type,
          created_at: user.created_at
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Check username availability
router.get('/check-username/:username', (req, res) => {
  res.json({ available: true });
});

// Get user by ID
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const client = await pool.connect();
    try {
      const { rows } = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = rows[0];
      res.json({
        user: {
          id: user.id,
          wallet_address: user.wallet_address,
          user_type: user.user_type,
          created_at: user.created_at
        }
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

module.exports = router;
