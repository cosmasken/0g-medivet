/**
 * PaymentManager Service
 * Handles blockchain-based payments for provider access to patient records
 */

import { BrowserProvider, Contract, ethers, formatEther, parseEther } from 'ethers';
import { getProvider, getSigner } from '@/lib/0g/fees';
import { PaymentTransaction } from './providerAccessService';

// ABI for the payment contract (simplified for this implementation)
const PAYMENT_CONTRACT_ABI = [
  // Function to process payment for record access
  "function payForAccess(string memory providerId, string memory patientId, string memory recordId, uint256 amount) public payable returns (uint256 paymentId)",
  // Function to check payment status
  "function getPaymentStatus(uint256 paymentId) public view returns (bool paid, address payer, uint256 amount, uint256 timestamp, bool refunded)",
  // Function to request refund
  "function requestRefund(uint256 paymentId, string memory reason) public",
  // Function to process refund
  "function processRefund(uint256 paymentId) public",
  // Events
  "event PaymentProcessed(uint256 indexed paymentId, string indexed providerId, string indexed patientId, uint256 amount, address payer)",
  "event PaymentRefunded(uint256 indexed paymentId, string indexed patientId, uint256 amount)"
];

export interface PaymentRequest {
  providerId: string;
  patientId: string;
  recordId: string;
  amount: number; // in wei
  currency: 'ETH';
}

export interface RefundRequest {
  paymentId: number;
  reason: string;
}

export class PaymentManagerService {
  private paymentContractAddress: string;
  private paymentContract: Contract | null = null;
  private paymentFee: bigint; // Amount in wei

  constructor(paymentContractAddress: string = import.meta.env.VITE_PAYMENT_CONTRACT_ADDRESS || '0x7b8Ec89Eb27a3638408F17aa5Fe72Ed08a620361') {
    this.paymentContractAddress = paymentContractAddress;
    
    // Default access fee: 0.001 ETH in wei (1000000000000000)
    this.paymentFee = BigInt('1000000000000000');
  }

  /**
   * Initialize the payment contract instance
   */
  async initializeContract(): Promise<void> {
    if (!this.paymentContractAddress) {
      throw new Error('Payment contract address not configured');
    }

    const [provider, providerError] = await getProvider();
    if (providerError) {
      throw providerError;
    }

    if (!provider) {
      throw new Error('Provider not available');
    }

    this.paymentContract = new Contract(
      this.paymentContractAddress,
      PAYMENT_CONTRACT_ABI,
      provider
    );
  }

  /**
   * Process payment for provider access to patient record
   */
  async processAccessPayment(
    providerId: string,
    patientId: string,
    recordId: string,
    amount?: number
  ): Promise<PaymentTransaction> {
    if (!this.paymentContract) {
      await this.initializeContract();
    }

    const [provider, providerError] = await getProvider();
    if (providerError || !provider) {
      throw new Error('Provider not available: ' + (providerError?.message || 'Unknown error'));
    }

    const [signer, signerError] = await getSigner(provider);
    if (signerError || !signer) {
      throw new Error('Signer not available: ' + (signerError?.message || 'Unknown error'));
    }

    // Use provided amount or default fee
    const paymentAmount = amount ? BigInt(amount) : this.paymentFee;

    try {
      // Update contract instance with signer
      const contractWithSigner = this.paymentContract!.connect(signer);

      // Process the payment - send the amount as value in the transaction
      const tx = await contractWithSigner.payForAccess(
        providerId,
        patientId,
        recordId,
        paymentAmount,
        { value: paymentAmount } // Send the amount as msg.value
      );

      // Create payment transaction record
      const paymentTransaction: PaymentTransaction = {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        providerId,
        patientId,
        accessPermissionId: '', // This would be set after access is granted
        amount: Number(paymentAmount),
        currency: 'ETH',
        transactionHash: tx.hash,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update transaction status
      paymentTransaction.status = 'confirmed';
      paymentTransaction.confirmedAt = new Date().toISOString();
      paymentTransaction.gasUsed = Number(receipt.gasUsed);
      paymentTransaction.gasPrice = Number(receipt.effectiveGasPrice);

      return paymentTransaction;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      return {
        id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        providerId,
        patientId,
        accessPermissionId: '',
        amount: amount || Number(this.paymentFee),
        currency: 'ETH',
        status: 'failed',
        createdAt: new Date().toISOString(),
        failureReason: errorMessage
      };
    }
  }

  /**
   * Verify a payment transaction on the blockchain
   */
  async verifyPaymentOnBlockchain(
    transactionHash: string,
    paymentId: number
  ): Promise<PaymentTransaction | null> {
    if (!this.paymentContract) {
      await this.initializeContract();
    }

    try {
      // Get payment status from blockchain
      const [paid, , amount, timestamp, refunded] = await this.paymentContract!.getPaymentStatus(paymentId);

      if (!paid || refunded) {
        return null;
      }

      // Since we can't easily get the transaction details by hash from the contract,
      // we'll verify that the payment was made by checking the status on the blockchain
      return {
        id: `payment-${paymentId}`,
        providerId: '', // Would need to get from additional contract call
        patientId: '', // Would need to get from additional contract call
        accessPermissionId: '',
        amount: Number(amount),
        currency: 'ETH',
        transactionHash,
        status: 'confirmed',
        createdAt: new Date(Number(timestamp) * 1000).toISOString(),
        confirmedAt: new Date(Number(timestamp) * 1000).toISOString()
      };
    } catch (error) {
      console.error('Error verifying payment on blockchain:', error);
      return null;
    }
  }

  /**
   * Get the standard access fee
   */
  getAccessFee(): bigint {
    return this.paymentFee;
  }

  /**
   * Set the access fee (only callable by admin in real implementation)
   */
  setAccessFee(fee: bigint): void {
    this.paymentFee = fee;
  }

  /**
   * Get formatted access fee in ETH
   */
  getFormattedAccessFee(): string {
    return formatEther(this.paymentFee);
  }

  /**
   * Request a refund for a payment
   */
  async requestRefund(
    paymentId: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!this.paymentContract) {
      await this.initializeContract();
    }

    const [provider, providerError] = await getProvider();
    if (providerError || !provider) {
      throw new Error('Provider not available: ' + (providerError?.message || 'Unknown error'));
    }

    const [signer, signerError] = await getSigner(provider);
    if (signerError || !signer) {
      throw new Error('Signer not available: ' + (signerError?.message || 'Unknown error'));
    }

    try {
      // Update contract instance with signer
      const contractWithSigner = this.paymentContract!.connect(signer);

      // Request refund
      const tx = await contractWithSigner.requestRefund(paymentId, reason);
      await tx.wait();

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Calculate access fee based on record size and type
   */
  calculateFeeForRecord(recordSize: number, recordType: string): bigint {
    // Base fee
    let fee = this.paymentFee;

    // Increase fee for larger files
    if (recordSize > 100 * 1024 * 1024) { // 100MB
      fee = fee * BigInt(5); // 5x for very large files
    } else if (recordSize > 10 * 1024 * 1024) { // 10MB
      fee = fee * BigInt(2); // 2x for large files
    }

    // Increase fee for sensitive record types
    const sensitiveTypes = ['lab-results', 'imaging', 'prescriptions'];
    if (sensitiveTypes.includes(recordType)) {
      fee = fee * BigInt(2); // 2x for sensitive records
    }

    return fee;
  }
}

// Export singleton instance
export const paymentManagerService = new PaymentManagerService();