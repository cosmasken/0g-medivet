const { ethers } = require('ethers');

// Contract ABI for MedicalRecordAccess
const CONTRACT_ABI = [
  "function payForRecordAccess(address patient, bytes32 recordId) external payable returns (bool)",
  "function getAccessRate() external view returns (uint256)",
  "function authorizeProvider(address provider) external",
  "event RecordAccessPayment(address indexed provider, address indexed patient, bytes32 indexed recordId, uint256 amount, uint256 timestamp)"
];

const CONTRACT_ADDRESS = '0x6a301456A5274dF720913Ec5C9A48992DFF2a830';
const RPC_URL = 'https://evmrpc-mainnet.0g.ai';

class PaymentService {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(RPC_URL);
    this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, this.provider);
  }

  /**
   * Process payment for record access
   */
  async processRecordAccessPayment(providerPrivateKey, patientAddress, recordId) {
    try {
      // Create signer from provider's private key
      const signer = new ethers.Wallet(providerPrivateKey, this.provider);
      const contractWithSigner = this.contract.connect(signer);

      // Get current access rate
      const accessRate = await this.contract.getAccessRate();
      
      // Convert recordId to bytes32
      const recordIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(recordId));

      // Execute payment transaction
      const tx = await contractWithSigner.payForRecordAccess(
        patientAddress,
        recordIdBytes32,
        { value: accessRate }
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        paymentAmount: ethers.formatEther(accessRate),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Get current access rate from contract
   */
  async getAccessRate() {
    try {
      const rate = await this.contract.getAccessRate();
      return ethers.formatEther(rate);
    } catch (error) {
      console.error('Error getting access rate:', error);
      return '0.001'; // Fallback rate
    }
  }
}

module.exports = new PaymentService();
