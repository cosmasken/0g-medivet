/**
 * ConsentContract Service
 * Handles blockchain-based consent management for patient-provider relationships
 */

import { BrowserProvider, Contract, ethers } from 'ethers';
import { getProvider, getSigner } from '@/lib/0g/fees';
import { ConsentRequest } from './consentService';
import { AccessPermission } from './providerAccessService';

// ABI for the consent contract (simplified for this implementation)
const CONSENT_CONTRACT_ABI = [
  // Function to create a consent request
  "function createConsentRequest(string memory providerId, string memory patientId, string memory accessLevel, uint256 durationDays, string memory purpose) public returns (uint256)",
  // Function to approve a consent request
  "function approveConsentRequest(uint256 requestId) public",
  // Function to revoke a consent
  "function revokeConsent(uint256 consentId) public",
  // Function to check if consent is valid
  "function isConsentValid(uint256 consentId) public view returns (bool)",
  // Function to get consent details
  "function getConsentDetails(uint256 consentId) public view returns (string memory providerId, string memory patientId, string memory accessLevel, uint256 duration, uint256 createdAt, bool active)",
  // Events
  "event ConsentCreated(uint256 indexed consentId, string indexed providerId, string indexed patientId, uint256 duration)",
  "event ConsentApproved(uint256 indexed consentId, string indexed patientId)",
  "event ConsentRevoked(uint256 indexed consentId, string indexed patientId, string reason)"
];

export interface ConsentTransaction {
  id: string;
  consentId: number;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'creation' | 'approval' | 'revocation' | 'verification';
  timestamp: string;
  from: string;
  to: string;
  gasUsed?: number;
  gasPrice?: number;
  error?: string;
}

export class ConsentContractService {
  private consentContractAddress: string;
  private consentContract: Contract | null = null;
  private readonly transactionHistory: ConsentTransaction[] = [];

  constructor(consentContractAddress: string = import.meta.env.VITE_CONSENT_CONTRACT_ADDRESS || '0x7b8Ec89Eb27a3638408F17aa5Fe72Ed08a620362') {
    this.consentContractAddress = consentContractAddress;
  }

  /**
   * Initialize the consent contract instance
   */
  async initializeContract(): Promise<void> {
    if (!this.consentContractAddress) {
      throw new Error('Consent contract address not configured');
    }

    const [provider, providerError] = await getProvider();
    if (providerError) {
      throw providerError;
    }

    if (!provider) {
      throw new Error('Provider not available');
    }

    this.consentContract = new Contract(
      this.consentContractAddress,
      CONSENT_CONTRACT_ABI,
      provider
    );
  }

  /**
   * Create a consent request on the blockchain
   */
  async createConsentOnBlockchain(
    providerId: string,
    patientId: string,
    accessLevel: string,
    durationDays: number,
    purpose: string
  ): Promise<Omit<ConsentTransaction, 'id' | 'status' | 'timestamp'>> {
    if (!this.consentContract) {
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
      const contractWithSigner = this.consentContract!.connect(signer);

      // Create the consent request
      const tx = await contractWithSigner.createConsentRequest(
        providerId,
        patientId,
        accessLevel,
        durationDays,
        purpose
      );

      // Add pending transaction to history
      const transaction: ConsentTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        consentId: 0, // Will be updated after confirmation
        transactionHash: tx.hash,
        status: 'pending',
        type: 'creation',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
      };

      this.transactionHistory.push(transaction);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update transaction status
      const confirmedTx = this.transactionHistory.find(t => t.transactionHash === tx.hash);
      if (confirmedTx) {
        confirmedTx.status = 'confirmed';
        confirmedTx.gasUsed = Number(receipt.gasUsed);
        confirmedTx.gasPrice = Number(receipt.effectiveGasPrice);
        
        // Extract consent ID from event logs (simplified)
        if (receipt.logs && receipt.logs.length > 0) {
          // This is a placeholder - in a real contract we'd parse logs for the consent ID
          confirmedTx.consentId = receipt.logs.length; // Placeholder for actual ID
        }
      }

      return {
        consentId: confirmedTx?.consentId || 0,
        transactionHash: tx.hash,
        status: 'confirmed',
        type: 'creation',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
        gasUsed: Number(receipt.gasUsed),
        gasPrice: Number(receipt.effectiveGasPrice)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const transaction: ConsentTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        consentId: 0,
        transactionHash: '',
        status: 'failed',
        type: 'creation',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
        error: errorMessage
      };

      this.transactionHistory.push(transaction);
      
      throw error;
    }
  }

  /**
   * Approve a consent request on the blockchain
   */
  async approveConsentOnBlockchain(
    consentId: number
  ): Promise<Omit<ConsentTransaction, 'id' | 'status' | 'timestamp'>> {
    if (!this.consentContract) {
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
      const contractWithSigner = this.consentContract!.connect(signer);

      // Approve the consent
      const tx = await contractWithSigner.approveConsentRequest(consentId);

      // Add pending transaction to history
      const transaction: ConsentTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        consentId,
        transactionHash: tx.hash,
        status: 'pending',
        type: 'approval',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
      };

      this.transactionHistory.push(transaction);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update transaction status
      const confirmedTx = this.transactionHistory.find(t => t.transactionHash === tx.hash);
      if (confirmedTx) {
        confirmedTx.status = 'confirmed';
        confirmedTx.gasUsed = Number(receipt.gasUsed);
        confirmedTx.gasPrice = Number(receipt.effectiveGasPrice);
      }

      return {
        consentId,
        transactionHash: tx.hash,
        status: 'confirmed',
        type: 'approval',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
        gasUsed: Number(receipt.gasUsed),
        gasPrice: Number(receipt.effectiveGasPrice)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const transaction: ConsentTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        consentId,
        transactionHash: '',
        status: 'failed',
        type: 'approval',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
        error: errorMessage
      };

      this.transactionHistory.push(transaction);
      
      throw error;
    }
  }

  /**
   * Revoke a consent on the blockchain
   */
  async revokeConsentOnBlockchain(
    consentId: number,
    reason: string = 'Consent revoked by patient'
  ): Promise<Omit<ConsentTransaction, 'id' | 'status' | 'timestamp'>> {
    if (!this.consentContract) {
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
      const contractWithSigner = this.consentContract!.connect(signer);

      // Revoke the consent
      const tx = await contractWithSigner.revokeConsent(consentId);

      // Add pending transaction to history
      const transaction: ConsentTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        consentId,
        transactionHash: tx.hash,
        status: 'pending',
        type: 'revocation',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
      };

      this.transactionHistory.push(transaction);

      // Wait for confirmation
      const receipt = await tx.wait();

      // Update transaction status
      const confirmedTx = this.transactionHistory.find(t => t.transactionHash === tx.hash);
      if (confirmedTx) {
        confirmedTx.status = 'confirmed';
        confirmedTx.gasUsed = Number(receipt.gasUsed);
        confirmedTx.gasPrice = Number(receipt.effectiveGasPrice);
      }

      return {
        consentId,
        transactionHash: tx.hash,
        status: 'confirmed',
        type: 'revocation',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
        gasUsed: Number(receipt.gasUsed),
        gasPrice: Number(receipt.effectiveGasPrice)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      const transaction: ConsentTransaction = {
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        consentId,
        transactionHash: '',
        status: 'failed',
        type: 'revocation',
        timestamp: new Date().toISOString(),
        from: await signer.getAddress(),
        to: this.consentContractAddress,
        error: errorMessage
      };

      this.transactionHistory.push(transaction);
      
      throw error;
    }
  }

  /**
   * Check if consent is valid on the blockchain
   */
  async isConsentValidOnBlockchain(consentId: number): Promise<boolean> {
    if (!this.consentContract) {
      await this.initializeContract();
    }

    try {
      const isValid = await this.consentContract!.isConsentValid(consentId);
      return isValid;
    } catch (error) {
      console.error('Error checking consent validity on blockchain:', error);
      return false;
    }
  }

  /**
   * Get consent details from the blockchain
   */
  async getConsentDetailsFromBlockchain(consentId: number): Promise<{
    providerId: string;
    patientId: string;
    accessLevel: string;
    duration: number;
    createdAt: number;
    active: boolean;
  } | null> {
    if (!this.consentContract) {
      await this.initializeContract();
    }

    try {
      const details = await this.consentContract!.getConsentDetails(consentId);
      return {
        providerId: details[0],
        patientId: details[1],
        accessLevel: details[2],
        duration: Number(details[3]),
        createdAt: Number(details[4]),
        active: details[5]
      };
    } catch (error) {
      console.error('Error getting consent details from blockchain:', error);
      return null;
    }
  }

  /**
   * Sync consent request with blockchain status
   */
  async syncConsentWithBlockchain(consentRequest: ConsentRequest): Promise<ConsentRequest> {
    // Find matching consent on blockchain by comparing metadata
    // This is a simplified approach - in practice, we'd have a mapping between our internal IDs and blockchain IDs
    
    // For now, we'll check if the status has changed on blockchain
    const consentDetails = await this.getConsentDetailsFromBlockchain(parseInt(consentRequest.id.replace('consent-', '')) || 1);
    
    if (consentDetails) {
      const updatedRequest = { ...consentRequest };
      
      // Update status based on blockchain status
      if (!consentDetails.active) {
        if (updatedRequest.status === 'approved') {
          updatedRequest.status = 'revoked';
          updatedRequest.revokedAt = new Date().toISOString();
        } else if (updatedRequest.status === 'pending' && consentDetails.createdAt > 0) {
          // If it existed on chain but is no longer active, it might have been denied
          updatedRequest.status = 'denied';
          updatedRequest.deniedAt = new Date().toISOString();
        }
      }
      
      // Update expiration if needed
      if (consentDetails.duration) {
        const createdAt = new Date(consentDetails.createdAt * 1000); // Convert from Unix timestamp
        const expirationDate = new Date(createdAt.getTime() + consentDetails.duration * 24 * 60 * 60 * 1000);
        updatedRequest.expiresAt = expirationDate.toISOString();
      }
      
      return updatedRequest;
    }
    
    return consentRequest;
  }

  /**
   * Get transaction history for a specific consent
   */
  getConsentTransactions(consentId: number): ConsentTransaction[] {
    return this.transactionHistory
      .filter(tx => tx.consentId === consentId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  /**
   * Get all consent transactions
   */
  getAllTransactions(): ConsentTransaction[] {
    return [...this.transactionHistory]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

// Export singleton instance
export const consentContractService = new ConsentContractService();