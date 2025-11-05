const express = require('express');
const { pool } = require('../lib/database');
const router = express.Router();

// Create medical record
router.post('/', async (req, res) => {
  console.log('POST /records:', req.body);
  try {
    const { user_id, file_name, file_type, file_size, storage_hash } = req.body;
    
    if (!user_id || !file_name || !storage_hash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const client = await pool.connect();
    try {
      // If user_id looks like a wallet address, look up the user UUID
      let userUuid = user_id;
      if (user_id.startsWith('local-0x') || user_id.startsWith('0x')) {
        const walletAddress = user_id.replace('local-', '');
        const userResult = await client.query(
          'SELECT id FROM users WHERE wallet_address = $1',
          [walletAddress]
        );
        
        if (userResult.rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        userUuid = userResult.rows[0].id;
      }

      const { rows } = await client.query(
        'INSERT INTO medical_records (user_id, file_name, file_type, file_size, storage_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userUuid, file_name, file_type, file_size, storage_hash]
      );

      res.json({ record: rows[0] });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create record error:', error);
    res.status(500).json({ error: 'Failed to create record' });
  }
});

// Get records for user
router.get('/user/:userId', async (req, res) => {
  console.log('GET /records/user:', req.params.userId);
  try {
    const { userId } = req.params;
    
    const client = await pool.connect();
    try {
      // If userId looks like a wallet address, look up the user UUID
      let userUuid = userId;
      if (userId.startsWith('local-0x') || userId.startsWith('0x')) {
        const walletAddress = userId.replace('local-', '');
        const userResult = await client.query(
          'SELECT id FROM users WHERE wallet_address = $1',
          [walletAddress]
        );
        
        if (userResult.rows.length === 0) {
          return res.json({ records: [] });
        }
        userUuid = userResult.rows[0].id;
      }

      const { rows } = await client.query(
        'SELECT * FROM medical_records WHERE user_id = $1 ORDER BY created_at DESC',
        [userUuid]
      );

      res.json({ records: rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get records error:', error);
    res.status(500).json({ error: 'Failed to get records' });
  }
});

module.exports = router;
