const express = require('express');
const router = express.Router();
const contractService = require('../services/contractService');

// Check provider stake status
router.get('/stake/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Valid wallet address required' });
    }

    const isStaked = await contractService.isProviderStaked(address);

    res.json({
      isStaked,
      address,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Check provider stake error:', error);
    res.status(500).json({ error: 'Failed to check provider stake' });
  }
});

// Get contract constants
router.get('/contract', async (req, res) => {
  try {
    const constants = await contractService.getConstants();

    res.json({
      constants,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get contract constants error:', error);
    res.status(500).json({ error: 'Failed to get contract constants' });
  }
});

module.exports = router;