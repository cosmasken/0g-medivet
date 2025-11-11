const express = require('express');
const { ethers } = require('ethers');
const contractService = require('../services/contractService');
const router = express.Router();

// Contract ABI for read operations only (write operations happen client-side)
const CONTRACT_ABI = [
  "function giveConsent(address provider, bytes32 recordId, uint256 durationDays) external",
  "function revokeConsent(address provider, bytes32 recordId) external",
  "function accessRecord(address patient, bytes32 recordId, bytes32 purpose) external payable",
  "function stakeAsProvider() external payable",
  "function unstake() external",
  "function providerStakes(address provider) external view returns (uint256)",
  "function getConsentExpiry(address patient, address provider, bytes32 recordId) external view returns (uint256)",
  "function hasAccessed(address provider, bytes32 recordId) external view returns (bool)",
  "function MINIMUM_STAKE() external view returns (uint256)",
  "function ACCESS_FEE() external view returns (uint256)"
];

// Endpoint to verify a signed message (for client-side contract operations)
router.post('/verify-signature', async (req, res) => {
  try {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
      return res.status(400).json({ error: 'Missing required fields: message, signature, address' });
    }

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(400).json({ error: 'Signature verification failed' });
    }

    res.json({
      success: true,
      isValid: true,
      recoveredAddress
    });
  } catch (error) {
    console.error('Signature verification error:', error);
    res.status(500).json({ error: 'Signature verification failed' });
  }
});

// Get contract information and constants
router.get('/info', async (req, res) => {
  try {
    const contractAddress = process.env.CONTRACT_ADDRESS || contractService.contractAddress;
    
    if (!contractAddress) {
      return res.status(500).json({ error: 'Contract address not configured' });
    }
    
    const constants = await contractService.getConstants();
    
    res.json({
      contractAddress,
      constants,
      abi: CONTRACT_ABI,
      rpcEndpoint: process.env.ZG_RPC_ENDPOINT || 'https://evmrpc.0g.ai',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get contract info error:', error);
    res.status(500).json({ error: 'Failed to get contract info' });
  }
});

// Log audit event for contract operations (client-side transactions)
router.post('/log-transaction', async (req, res) => {
  try {
    const { wallet_address, action, transaction_hash, details } = req.body;

    if (!wallet_address || !action || !transaction_hash) {
      return res.status(400).json({ error: 'Missing required fields: wallet_address, action, transaction_hash' });
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const { pool } = require('../lib/database');
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

      // Create audit log entry for the transaction
      const result = await client.query(
        `INSERT INTO audit_logs 
         (user_id, wallet_address, action, resource_type, resource_id, details, ip_address, user_agent) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, timestamp`,
        [
          userId,
          wallet_address.toLowerCase(),
          action,
          'CONTRACT_TX',
          transaction_hash,
          JSON.stringify(details),
          req.ip,
          req.get('User-Agent') || ''
        ]
      );

      res.json({
        logId: result.rows[0].id,
        timestamp: result.rows[0].timestamp,
        success: true
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Log transaction error:', error);
    res.status(500).json({ error: 'Failed to log transaction' });
  }
});

// DEPRECATED ENDPOINTS - These should be handled client-side
// Keeping for backward compatibility during transition

router.post('/consent/give', async (req, res) => {
  return res.status(400).json({ 
    error: 'This endpoint has been deprecated. Consent operations should be handled client-side with proper wallet connection.' 
  });
});

router.post('/consent/revoke', async (req, res) => {
  return res.status(400).json({ 
    error: 'This endpoint has been deprecated. Consent operations should be handled client-side with proper wallet connection.' 
  });
});

router.post('/provider/stake', async (req, res) => {
  return res.status(400).json({ 
    error: 'This endpoint has been deprecated. Staking operations should be handled client-side with proper wallet connection.' 
  });
});

router.post('/record/access', async (req, res) => {
  return res.status(400).json({ 
    error: 'This endpoint has been deprecated. Record access operations should be handled client-side with proper wallet connection.' 
  });
});

module.exports = router;