/**
 * Tests for PaymentManagerService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PaymentManagerService } from '../PaymentManagerService';

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

import { getProvider, getSigner } from '@/lib/0g/fees';

describe('PaymentManagerService', () => {
  let paymentManagerService: PaymentManagerService;

  beforeEach(() => {
    paymentManagerService = new PaymentManagerService();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  it('should initialize with a default payment fee', () => {
    expect(paymentManagerService.getAccessFee()).toBe(BigInt('1000000000000000')); // 0.001 ETH in wei
  });

  it('should process access payment successfully', async () => {
    // Mock provider and signer
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

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    // Mock the Contract constructor to return our mock contract
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await paymentManagerService.processAccessPayment(
      'provider-123',
      'patient-456',
      'record-789',
      1000000000000000 // 0.001 ETH in wei
    );

    expect(result.status).toBe('confirmed');
    expect(result.providerId).toBe('provider-123');
    expect(result.patientId).toBe('patient-456');
    expect(result.amount).toBe(1000000000000000);
  });

  it('should handle payment processing failure', async () => {
    // Mock provider and signer to fail
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xProviderAddress') };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, new Error('Provider error')]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);

    const result = await paymentManagerService.processAccessPayment(
      'provider-123',
      'patient-456',
      'record-789'
    );

    expect(result.status).toBe('failed');
    expect(result.failureReason).toContain('Provider not available');
  });

  it('should return formatted access fee', () => {
    const fee = paymentManagerService.getFormattedAccessFee();
    expect(fee).toBe('0.001');
  });

  it('should calculate fee for record based on size and type', () => {
    // Test base fee
    let fee = paymentManagerService.calculateFeeForRecord(1000000, 'lab-results'); // 1MB
    expect(fee).toBe(BigInt('1000000000000000') * BigInt(2)); // 2x for sensitive type

    // Test fee with larger file
    fee = paymentManagerService.calculateFeeForRecord(50000000, 'lab-results'); // 50MB
    expect(fee).toBe(BigInt('1000000000000000') * BigInt(2) * BigInt(2)); // 2x for large file + 2x for sensitive

    // Test fee with very large file
    fee = paymentManagerService.calculateFeeForRecord(150000000, 'general'); // 150MB
    expect(fee).toBe(BigInt('1000000000000000') * BigInt(5)); // 5x for very large file
  });

  it('should request refund successfully', async () => {
    // Mock provider and signer
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xPatientAddress') };
    const mockContract = {
      connect: vi.fn().mockReturnThis(),
      requestRefund: vi.fn().mockResolvedValue({
        wait: vi.fn().mockResolvedValue({})
      })
    };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, null]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);
    
    const { Contract } = await import('ethers');
    (Contract as vi.Mock).mockImplementation(() => mockContract);

    const result = await paymentManagerService.requestRefund(123, 'Wrong charges');

    expect(result.success).toBe(true);
  });

  it('should handle refund request failure', async () => {
    // Mock provider and signer to fail
    const mockProvider = {};
    const mockSigner = { getAddress: vi.fn().mockResolvedValue('0xPatientAddress') };

    (getProvider as vi.Mock).mockResolvedValue([mockProvider, new Error('Provider error')]);
    (getSigner as vi.Mock).mockResolvedValue([mockSigner, null]);

    const result = await paymentManagerService.requestRefund(123, 'Wrong charges');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Provider not available');
  });
});