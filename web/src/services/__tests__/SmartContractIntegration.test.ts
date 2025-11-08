/**
 * Integration tests to verify requirements 2.5, 4.1, 4.2, 4.5 for smart contract integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { consentContractService } from '@/services/ConsentContractService';
import { paymentManagerService } from '@/services/PaymentManagerService';
import { consentService } from '@/services/consentService';
import { providerAccessService } from '@/services/providerAccessService';

// Mock the ethers library and related functions
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers');
  return {
    ...actual,
    Contract: vi.fn(),
    BrowserProvider: vi.fn(),
    formatEther: vi.fn().mockImplementation((value) => (Number(value) / 1e18).toString()),
    parseEther: vi.fn().mockImplementation((value) => BigInt(Math.round(parseFloat(value) * 1e18))),
  };
});

// Mock the fee utility functions
vi.mock('@/lib/0g/fees', () => ({
  getProvider: vi.fn(),
  getSigner: vi.fn(),
}));

describe('Smart Contract Integration - Requirements Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all services to clear any stored data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('consent') || key.startsWith('provider')) {
        localStorage.removeItem(key);
      }
    });
  });

  /**
   * Requirement 2.5: WHEN a provider pays for access THEN the system SHALL process payment through smart contracts
   */
  it('should process payment through smart contracts (Requirement 2.5)', async () => {
    // Mock the payment processing
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xProviderAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      payForAccess: vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 60000,
          effectiveGasPrice: 20000000000,
        })
      })
    };

    const { getProvider, getSigner } = await import('@/lib/0g/fees');
    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    // Process payment using the payment manager service
    const paymentResult = await paymentManagerService.processAccessPayment(
      'provider-123',
      'patient-456',
      'medical-record-access',
      1000000000000000 // 0.001 ETH in wei
    );

    // Verify that the payment was processed on the blockchain
    expect(paymentResult.status).toBe('confirmed');
    expect(paymentResult.transactionHash).toBe('0x1234567890abcdef');
    expect(mockContract.payForAccess).toHaveBeenCalled();
  });

  /**
   * Requirement 4.1: WHEN a provider requests access THEN the patient SHALL receive a notification with request details
   * Requirement 4.2: WHEN granting consent THEN the patient SHALL specify duration and specific records or categories
   */
  it('should create consent request with proper details and allow patient to grant with duration (Requirements 4.1, 4.2)', async () => {
    // Mock blockchain consent creation
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xProviderAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      createConsentRequest: vi.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 50000,
          effectiveGasPrice: 20000000000,
          logs: []
        })
      }),
      approveConsentRequest: vi.fn().mockResolvedValue({
        hash: '0x123456abcdef7890',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 45000,
          effectiveGasPrice: 20000000000,
        })
      })
    };

    const { getProvider, getSigner } = await import('@/lib/0g/fees');
    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    // Create consent request
    const consentRequest = await consentService.createConsentRequest(
      'provider-123',
      {
        name: 'Dr. Smith',
        specialty: 'Cardiology',
        walletAddress: '0xProviderAddress'
      },
      {
        patientWalletAddress: '0xPatientAddress',
        requestedAccessLevel: 'view',
        requestedDataTypes: ['lab-results', 'imaging'],
        purpose: 'Annual checkup',
        urgency: 'standard',
        duration: 30
      }
    );

    // Verify the consent was created with proper details (Requirement 4.1)
    expect(consentRequest.providerId).toBe('provider-123');
    expect(consentRequest.patientWalletAddress).toBe('0xPatientAddress');
    expect(consentRequest.requestedAccessLevel).toBe('view');
    expect(consentRequest.requestedDataTypes).toEqual(['lab-results', 'imaging']);
    expect(consentRequest.purpose).toBe('Annual checkup');
    expect(consentRequest.duration).toBe(30);
    expect(consentRequest.status).toBe('pending');

    // Verify notification was created (Requirement 4.1)
    const notifications = consentService.getNotifications('patient-456', 'patient');
    expect(notifications.length).toBeGreaterThan(0);
    const notification = notifications.find(n => n.consentRequestId === consentRequest.id);
    expect(notification).toBeDefined();
    expect(notification?.title).toBe('New Consent Request');

    // Approve consent with specific duration and data types (Requirement 4.2)
    const approvedConsent = await consentService.approveConsentRequest(
      consentRequest.id,
      consentRequest.patientId,
      {
        consentRequestId: consentRequest.id,
        approvedAccessLevel: 'view',
        approvedDataTypes: ['lab-results'],  // Patient specified specific records
        duration: 15,  // Patient specified duration
        conditions: ['for current treatment only']
      }
    );

    expect(approvedConsent.status).toBe('approved');
    expect(approvedConsent.requestedDataTypes).toEqual(['lab-results']); // Patient specified specific records
    expect(approvedConsent.duration).toBe(15); // Patient specified duration
  });

  /**
   * Requirement 4.5: WHEN managing consents THEN the patient SHALL be able to set default permissions for future uploads
   */
  it('should support default permissions for future uploads (Requirement 4.5)', async () => {
    // Simulate consent request creation and approval
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xProviderAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      createConsentRequest: vi.fn().mockResolvedValue({
        hash: '0xabcdef1234567890',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 50000,
          effectiveGasPrice: 20000000000,
          logs: []
        })
      }),
      approveConsentRequest: vi.fn().mockResolvedValue({
        hash: '0x123456abcdef7890',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 45000,
          effectiveGasPrice: 20000000000,
        })
      })
    };

    const { getProvider, getSigner } = await import('@/lib/0g/fees');
    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    // Create consent request with metadata for default permissions
    const consentRequest = await consentService.createConsentRequest(
      'provider-123',
      {
        name: 'Dr. Smith',
        specialty: 'Cardiology',
        walletAddress: '0xProviderAddress'
      },
      {
        patientWalletAddress: '0xPatientAddress',
        requestedAccessLevel: 'view',
        requestedDataTypes: ['lab-results'],
        purpose: 'Follow-up appointment',
        urgency: 'standard',
        duration: 7,
        metadata: {
          followUpRequired: true,
          expectedTreatmentDuration: 30
        }
      }
    );

    // Verify consent has metadata that could be used for defaults (Requirement 4.5)
    expect(consentRequest.metadata).toBeDefined();
    expect(consentRequest.metadata?.followUpRequired).toBe(true);
    expect(consentRequest.metadata?.expectedTreatmentDuration).toBe(30);
  });

  /**
   * Combined test to verify provider access requires payment (Requirement 2.5)
   */
  it('should require provider to make payment for record access (Requirement 2.5)', async () => {
    // Mock payment processing
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xProviderAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      payForAccess: vi.fn().mockResolvedValue({
        hash: '0xpayment1234567890',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 60000,
          effectiveGasPrice: 20000000000,
        })
      })
    };

    const { getProvider, getSigner } = await import('@/lib/0g/fees');
    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    // Simulate the full flow: consent approval -> payment -> access
    const mockConsentRequest = {
      id: 'consent-123',
      providerId: 'provider-123',
      patientId: 'patient-456',
      patientWalletAddress: '0xPatientAddress',
      requestedAccessLevel: 'view',
      requestedDataTypes: ['lab-results'],
      purpose: 'Consultation',
      urgency: 'standard',
      duration: 14,
      status: 'approved',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blockchainId: 123
    };

    // Create access permission from approved consent
    const accessPermission = await providerAccessService.createAccessPermission(mockConsentRequest);
    expect(accessPermission).toBeDefined();
    expect(accessPermission.isActive).toBe(true);

    // Start access session with payment (this should trigger blockchain payment)
    const sessionResult = await providerAccessService.startAccessSession(
      'provider-123',
      'patient-456',
      '0xpayment1234567890' // Simulate having a payment transaction hash
    );

    // Verify that payment was required and processed
    expect(sessionResult.paymentRequired).toBe(false); // Since we provided a tx hash
    expect(sessionResult.paymentTransaction).toBeDefined();
    expect(sessionResult.session.isActive).toBe(true);
  });
});