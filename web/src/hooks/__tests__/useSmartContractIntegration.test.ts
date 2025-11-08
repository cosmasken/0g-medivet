/**
 * Tests for useSmartContractIntegration hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '@/lib/config';
import { useSmartContractIntegration } from '../useSmartContractIntegration';

// Mock the services
vi.mock('@/services/ConsentContractService', () => ({
  consentContractService: {
    createConsentOnBlockchain: vi.fn(),
    approveConsentOnBlockchain: vi.fn(),
    revokeConsentOnBlockchain: vi.fn(),
    isConsentValidOnBlockchain: vi.fn(),
    getConsentDetailsFromBlockchain: vi.fn(),
  }
}));

vi.mock('@/services/PaymentManagerService', () => ({
  paymentManagerService: {
    processAccessPayment: vi.fn(),
    verifyPaymentOnBlockchain: vi.fn(),
    getAccessFee: vi.fn().mockReturnValue(BigInt('1000000000000000')),
    getFormattedAccessFee: vi.fn().mockReturnValue('0.001'),
    requestRefund: vi.fn(),
    calculateFeeForRecord: vi.fn(),
  }
}));

// Mock wagmi
vi.mock('wagmi', async () => {
  const actual = await vi.importActual('wagmi');
  return {
    ...actual,
    useAccount: vi.fn().mockReturnValue({ address: '0x1234567890123456789012345678901234567890' }),
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  </WagmiProvider>
);

describe('useSmartContractIntegration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct state', async () => {
    const { result } = renderHook(() => useSmartContractIntegration(), { wrapper });

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
      expect(result.current.state.error).toBe(null);
      expect(result.current.state.accessFee).toBe('0.001');
    });
  });

  it('should process access payment', async () => {
    const mockPaymentResult = {
      id: 'payment-123',
      providerId: 'provider-123',
      patientId: 'patient-456',
      accessPermissionId: '',
      amount: 1000000000000000,
      currency: 'ETH',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      confirmedAt: new Date().toISOString(),
    };

    const { processAccessPayment } = await vi.importMock('@/services/PaymentManagerService');
    (processAccessPayment.processAccessPayment as vi.Mock).mockResolvedValue(mockPaymentResult);

    const { result } = renderHook(() => useSmartContractIntegration(), { wrapper });

    await waitFor(async () => {
      const paymentResult = await result.current.processAccessPayment('provider-123', 'patient-456', 'record-789');
      expect(paymentResult.id).toBe('payment-123');
      expect(paymentResult.status).toBe('confirmed');
    });
  });

  it('should handle payment processing error', async () => {
    const { processAccessPayment } = await vi.importMock('@/services/PaymentManagerService');
    (processAccessPayment.processAccessPayment as vi.Mock).mockRejectedValue(new Error('Payment failed'));

    const { result } = renderHook(() => useSmartContractIntegration(), { wrapper });

    await waitFor(async () => {
      await expect(
        result.current.processAccessPayment('provider-123', 'patient-456', 'record-789')
      ).rejects.toThrow('Payment failed');
      
      expect(result.current.state.error).toBe('Payment failed');
    });
  });

  it('should create consent on blockchain', async () => {
    const mockConsentResult = {
      consentId: 123,
      transactionHash: '0x1234567890abcdef',
      status: 'confirmed',
      type: 'creation',
      timestamp: new Date().toISOString(),
      from: '0xPatientAddress',
      to: '0xContractAddress',
      gasUsed: 50000,
      gasPrice: 20000000000
    };

    const { consentContractService } = await vi.importMock('@/services/ConsentContractService');
    (consentContractService.createConsentOnBlockchain as vi.Mock).mockResolvedValue(mockConsentResult);

    const { result } = renderHook(() => useSmartContractIntegration(), { wrapper });

    await waitFor(async () => {
      const consentResult = await result.current.createConsentOnBlockchain(
        'provider-123',
        'patient-456',
        'view',
        30,
        'For medical consultation'
      );
      expect(consentResult.status).toBe('confirmed');
      expect(consentResult.type).toBe('creation');
    });
  });

  it('should get formatted access fee', async () => {
    const { result } = renderHook(() => useSmartContractIntegration(), { wrapper });

    await waitFor(() => {
      const fee = result.current.getFormattedAccessFee();
      expect(fee).toBe('0.001');
    });
  });

  it('should request refund', async () => {
    const mockRefundResult = { success: true };

    const { paymentManagerService } = await vi.importMock('@/services/PaymentManagerService');
    (paymentManagerService.requestRefund as vi.Mock).mockResolvedValue(mockRefundResult);

    const { result } = renderHook(() => useSmartContractIntegration(), { wrapper });

    await waitFor(async () => {
      const refundResult = await result.current.requestRefund(123, 'Wrong charges');
      expect(refundResult.success).toBe(true);
    });
  });
});