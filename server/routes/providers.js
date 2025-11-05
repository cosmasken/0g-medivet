const express = require('express');
const { pool } = require('../lib/database');
const router = express.Router();

// Get all providers
router.get('/', async (req, res) => {
  console.log('GET /providers');
  try {
    const result = await pool.query(
      'SELECT id, wallet_address, email, created_at FROM users WHERE user_type = $1',
      ['provider']
    );
    res.json({ providers: result.rows });
  } catch (error) {
    console.error('GET /providers error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
