const express = require('express');
const router = express.Router();

// Stub for syncing health data
router.post('/sync', (req, res) => {
  console.log('STUB: /health-connect/sync');
  res.json({ success: true, message: 'Data sync stub' });
});

// Stub for getting health data
router.get('/user/:userId', (req, res) => {
  console.log('STUB: /health-connect/user/:userId');
  res.json({ data: [], message: 'Health data stub' });
});

// Stub for getting health stats
router.get('/user/:userId/stats', (req, res) => {
  console.log('STUB: /health-connect/user/:userId/stats');
  res.json({ stats: {}, message: 'Health stats stub' });
});

// Stub for getting health data summary
router.get('/user/:userId/summary', (req, res) => {
  console.log('STUB: /health-connect/user/:userId/summary');
  res.json({ summary: {}, message: 'Health summary stub' });
});

// Stub for deleting health data
router.delete('/user/:userId', (req, res) => {
  console.log('STUB: /health-connect/user/:userId/delete');
  res.json({ success: true, message: 'Delete data stub' });
});

module.exports = router;
