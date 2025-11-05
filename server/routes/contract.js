const express = require('express');
const { ethers } = require('ethers');
const contractService = require('../services/contractService');
const router = express.Router();

// Contract ABI for write operations
const CONTRACT_ABI = [
  "function giveConsent(address provider, bytes32 recordId, uint256 durationDays) external",
  "function revokeConsent(address provider, bytes32 recordId) external",
  "function accessRecord(address patient, bytes32 recordId, bytes32 purpose) external payable",
  "function stakeAsProvider() external payable",
  "function unstake() external"
];

// Give consent endpoint
router.post('/consent/give', async (req, res) => {
  try {
    const { providerAddress, recordId, durationDays, patientPrivateKey } = req.body;
    
    if (!providerAddress || !recordId || !durationDays || !patientPrivateKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create patient wallet
    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_ENDPOINT || 'https://evmrpc.0g.ai');
    const patientWallet = new ethers.Wallet(patientPrivateKey, provider);
    const contract = new ethers.Contract(contractService.contractAddress, CONTRACT_ABI, patientWallet);

    // Call giveConsent
    const tx = await contract.giveConsent(providerAddress, recordId, durationDays);
    await tx.wait();

    res.json({
      success: true,
      txHash: tx.hash,
      message: 'Consent given successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke consent endpoint
router.post('/consent/revoke', async (req, res) => {
  try {
    const { providerAddress, recordId, patientPrivateKey } = req.body;
    
    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_ENDPOINT || 'https://evmrpc.0g.ai');
    const patientWallet = new ethers.Wallet(patientPrivateKey, provider);
    const contract = new ethers.Contract(contractService.contractAddress, CONTRACT_ABI, patientWallet);

    const tx = await contract.revokeConsent(providerAddress, recordId);
    await tx.wait();

    res.json({
      success: true,
      txHash: tx.hash,
      message: 'Consent revoked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Provider stake endpoint
router.post('/provider/stake', async (req, res) => {
  try {
    const { providerPrivateKey } = req.body;
    
    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_ENDPOINT || 'https://evmrpc.0g.ai');
    const providerWallet = new ethers.Wallet(providerPrivateKey, provider);
    const contract = new ethers.Contract(contractService.contractAddress, CONTRACT_ABI, providerWallet);

    const tx = await contract.stakeAsProvider({ value: ethers.parseEther('0.1') });
    await tx.wait();

    res.json({
      success: true,
      txHash: tx.hash,
      message: 'Provider staked successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Access record with payment
router.post('/record/access', async (req, res) => {
  try {
    const { patientAddress, recordId, purpose, providerPrivateKey } = req.body;
    
    const provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_ENDPOINT || 'https://evmrpc.0g.ai');
    const providerWallet = new ethers.Wallet(providerPrivateKey, provider);
    const contract = new ethers.Contract(contractService.contractAddress, CONTRACT_ABI, providerWallet);

    const tx = await contract.accessRecord(
      patientAddress, 
      recordId, 
      ethers.keccak256(ethers.toUtf8Bytes(purpose)),
      { value: ethers.parseEther('0.001') }
    );
    await tx.wait();

    res.json({
      success: true,
      txHash: tx.hash,
      message: 'Record accessed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
