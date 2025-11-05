require('dotenv').config();
const { ethers } = require('ethers');

// Contract ABI - minimal functions we need
const CONTRACT_ABI = [
  "function giveConsent(address provider, bytes32 recordId, uint256 durationDays) external",
  "function revokeConsent(address provider, bytes32 recordId) external", 
  "function accessRecord(address patient, bytes32 recordId, bytes32 purpose) external payable",
  "function stakeAsProvider() external payable",
  "function getConsentExpiry(address patient, address provider, bytes32 recordId) external view returns (uint256)",
  "function hasAccessed(address provider, bytes32 recordId) external view returns (bool)",
  "function providerStakes(address provider) external view returns (uint256)",
  "function MINIMUM_STAKE() external view returns (uint256)",
  "function ACCESS_FEE() external view returns (uint256)"
];

class ContractService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(process.env.ZG_RPC_ENDPOINT || 'https://evmrpc.0g.ai');
    this.contractAddress = process.env.CONTRACT_ADDRESS; // Set when deployed
    this.contract = null;
    
    if (this.contractAddress) {
      this.contract = new ethers.Contract(this.contractAddress, CONTRACT_ABI, this.provider);
    }
  }

  // Check if provider has minimum stake
  async isProviderStaked(providerAddress) {
    if (!this.contract) return false;
    
    try {
      const stake = await this.contract.providerStakes(providerAddress);
      const minStake = await this.contract.MINIMUM_STAKE();
      return stake >= minStake;
    } catch (error) {
      console.error('Error checking provider stake:', error);
      return false;
    }
  }

  // Check if provider has valid consent for record
  async hasValidConsent(patientAddress, providerAddress, recordId) {
    if (!this.contract) return false;
    
    try {
      const expiry = await this.contract.getConsentExpiry(patientAddress, providerAddress, recordId);
      return expiry > Math.floor(Date.now() / 1000);
    } catch (error) {
      console.error('Error checking consent:', error);
      return false;
    }
  }

  // Check if provider has accessed record
  async hasAccessedRecord(providerAddress, recordId) {
    if (!this.contract) return false;
    
    try {
      return await this.contract.hasAccessed(providerAddress, recordId);
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }

  // Get contract constants
  async getConstants() {
    if (!this.contract) return { minStake: '0', accessFee: '0' };
    
    try {
      const [minStake, accessFee] = await Promise.all([
        this.contract.MINIMUM_STAKE(),
        this.contract.ACCESS_FEE()
      ]);
      
      return {
        minStake: ethers.formatEther(minStake),
        accessFee: ethers.formatEther(accessFee)
      };
    } catch (error) {
      console.error('Error getting constants:', error);
      return { minStake: '0', accessFee: '0' };
    }
  }
}

module.exports = new ContractService();
