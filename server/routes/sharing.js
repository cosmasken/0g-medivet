const express = require('express');
const { pool } = require('../lib/database');
const router = express.Router();

// Get sharing permissions for a user's records
router.get('/user/:userId', async (req, res) => {
  console.log('GET /sharing/user:', req.params.userId);
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
          return res.json({ shared_records: [] });
        }
        userUuid = userResult.rows[0].id;
      }

      const result = await client.query(`
        SELECT mr.id, mr.file_name, mr.created_at,
               al.wallet_address as shared_with,
               al.timestamp as shared_at
        FROM medical_records mr
        LEFT JOIN audit_logs al ON mr.id = al.resource_id 
          AND al.action = 'CONSENT_GIVEN'
        WHERE mr.user_id = $1
      `, [userUuid]);
      
      res.json({ shared_records: result.rows });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('GET /sharing/user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
