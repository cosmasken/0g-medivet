const express = require('express');
const { pool } = require('../lib/database');
const router = express.Router();

// Get health data summary for a user
router.get('/user/:userId', async (req, res) => {
  console.log('GET /health/user:', req.params.userId);
  try {
    const { userId } = req.params;
    const result = await pool.query(`
      SELECT COUNT(*) as total_records,
             COUNT(CASE WHEN file_type LIKE 'image%' THEN 1 END) as images,
             COUNT(CASE WHEN file_type = 'application/pdf' THEN 1 END) as documents
      FROM medical_records 
      WHERE user_id = $1
    `, [userId]);
    
    res.json({ health_summary: result.rows[0] });
  } catch (error) {
    console.error('GET /health/user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
