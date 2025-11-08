/**
 * Tests for ConsentContractService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ConsentContractService } from '../ConsentContractService';

// Mock the ethers library and related functions
vi.mock('ethers', async () => {
  const actual = await vi.importActual('ethers');
  return {
    ...actual,
    Contract: vi.fn(),
    BrowserProvider: vi.fn(),
    formatEther: vi.fn(),
    parseEther: vi.fn(),
  };
});

// Mock the fee utility functions
vi.mock('@/lib/0g/fees', () => ({
  getProvider: vi.fn(),
  getSigner: vi.fn(),
}));

import { getProvider, getSigner } from '@/lib/0g/fees';

describe('ConsentContractService', () => {
  let consentContractService: ConsentContractService;

  beforeEach(() => {
    consentContractService = new ConsentContractService();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should initialize with a contract address', () => {
    const service = new ConsentContractService('0x1234567890123456789012345678901234567890');
    expect((service as any).consentContractAddress).toBe('0x1234567890123456789012345678901234567890');
  });

  it('should create a consent on blockchain', async () => {
    // Mock provider and signer
    const mockProvider = { getSigner: vi.fn() };
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xPatientAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      createConsentRequest: vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 50000,
          effectiveGasPrice: 20000000000,
          logs: [{}, {}] // Simulate logs for consent ID extraction
        })
      })
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    // Mock the Contract constructor to return our mock contract
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await consentContractService.createConsentOnBlockchain(
      'provider-123',
      'patient-456',
      'view',
      30,
      'For medical consultation'
    );

    expect(result.type).toBe('creation');
    expect(result.status).toBe('confirmed');
    expect(result.from).toBe('0xPatientAddress');
  });

  it('should handle errors when creating consent on blockchain', async () => {
    // Mock provider and signer
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xPatientAddress') };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    // Mock the Contract constructor to throw an error
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => {
      throw new Error('Contract error');
    });

    await expect(
      consentContractService.createConsentOnBlockchain(
        'provider-123',
        'patient-456',
        'view',
        30,
        'For medical consultation'
      )
    ).rejects.toThrow('Contract error');
  });

  it('should approve a consent on blockchain', async () => {
    // Mock provider and signer
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xPatientAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      approveConsentRequest: vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 45000,
          effectiveGasPrice: 20000000000,
        })
      })
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await consentContractService.approveConsentOnBlockchain(123);

    expect(result.type).toBe('approval');
    expect(result.status).toBe('confirmed');
    expect(result.consentId).toBe(123);
  });

  it('should revoke a consent on blockchain', async () => {
    // Mock provider and signer
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xPatientAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      revokeConsent: vi.fn().mockResolvedValue({
        hash: '0x1234567890abcdef',
        wait: vi.fn().mockResolvedValue({
          gasUsed: 40000,
          effectiveGasPrice: 20000000000,
        })
      })
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await consentContractService.revokeConsentOnBlockchain(123, 'Patient revoked consent');

    expect(result.type).toBe('revocation');
    expect(result.status).toBe('confirmed');
    expect(result.consentId).toBe(123);
  });

  it('should check if consent is valid on blockchain', async () => {
    // Mock provider
    const mockProvider = {};
    const mockContract = {
      isConsentValid: vi.fn().mockResolvedValue(true)
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await consentContractService.isConsentValidOnBlockchain(123);

    expect(result).toBe(true);
  });

  it('should return false when checking consent validity with error', async () => {
    // Mock provider
    const mockProvider = {};
    const mockContract = {
      isConsentValid: vi.fn().mockRejectedValue(new Error('Contract error'))
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await consentContractService.isConsentValidOnBlockchain(123);

    expect(result).toBe(false);
  });

  it('should get consent details from blockchain', async () => {
    // Mock provider
    const mockProvider = {};
    const mockContract = {
      getConsentDetails: vi.fn().mockResolvedValue([
        'provider-123',
        'patient-456',
        'view',
        30,
        1678886400, // Unix timestamp
        true
      ])
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await consentContractService.getConsentDetailsFromBlockchain(123);

    expect(result).toEqual({
      providerId: 'provider-123',
      patientId: 'patient-456',
      accessLevel: 'view',
      duration: 30,
      createdAt: 1678886400,
      active: true
    });
  });
});