/**
 * Smart Contract Integration Hook
 * Provides unified access to consent and payment smart contract functionality
 */

import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { formatEther } from 'ethers';
import { consentContractService } from '@/services/ConsentContractService';
import { paymentManagerService } from '@/services/PaymentManagerService';
import { ConsentRequest } from '@/services/consentService';
import { PaymentTransaction } from '@/services/providerAccessService';

interface SmartContractIntegrationState {
  loading: boolean;
  error: string | null;
  accessFee: string;
  consentTransactions: any[];
  paymentTransactions: PaymentTransaction[];
}

interface UseSmartContractIntegrationReturn {
  state: SmartContractIntegrationState;
  createConsentOnBlockchain: (
    providerId: string,
    patientId: string,
    accessLevel: string,
    durationDays: number,
    purpose: string
  ) => Promise<any>;
  approveConsentOnBlockchain: (consentId: number) => Promise<any>;
  revokeConsentOnBlockchain: (consentId: number, reason?: string) => Promise<any>;
  processAccessPayment: (
    providerId: string,
    patientId: string,
    recordId: string,
    amount?: number
  ) => Promise<PaymentTransaction>;
  verifyPaymentOnBlockchain: (transactionHash: string, paymentId: number) => Promise<PaymentTransaction | null>;
  getConsentDetailsFromBlockchain: (consentId: number) => Promise<any>;
  isConsentValidOnBlockchain: (consentId: number) => Promise<boolean>;
  getFormattedAccessFee: () => string;
  requestRefund: (paymentId: number, reason: string) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
}

export function useSmartContractIntegration(): UseSmartContractIntegrationReturn {
  const { address: walletAddress } = useAccount();
  const [state, setState] = useState<SmartContractIntegrationState>({
    loading: false,
    error: null,
    accessFee: paymentManagerService.getFormattedAccessFee(),
    consentTransactions: [],
    paymentTransactions: []
  });

  // Create consent on blockchain
  const createConsentOnBlockchain = useCallback(async (
    providerId: string,
    patientId: string,
    accessLevel: string,
    durationDays: number,
    purpose: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await consentContractService.createConsentOnBlockchain(
        providerId,
        patientId,
        accessLevel,
        durationDays,
        purpose
      );

      setState(prev => ({
        ...prev,
        loading: false,
        accessFee: paymentManagerService.getFormattedAccessFee()
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create consent on blockchain';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Approve consent on blockchain
  const approveConsentOnBlockchain = useCallback(async (consentId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await consentContractService.approveConsentOnBlockchain(consentId);

      setState(prev => ({
        ...prev,
        loading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve consent on blockchain';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Revoke consent on blockchain
  const revokeConsentOnBlockchain = useCallback(async (consentId: number, reason?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await consentContractService.revokeConsentOnBlockchain(consentId, reason);

      setState(prev => ({
        ...prev,
        loading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to revoke consent on blockchain';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Process access payment
  const processAccessPayment = useCallback(async (
    providerId: string,
    patientId: string,
    recordId: string,
    amount?: number
  ): Promise<PaymentTransaction> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await paymentManagerService.processAccessPayment(
        providerId,
        patientId,
        recordId,
        amount
      );

      setState(prev => ({
        ...prev,
        loading: false,
        paymentTransactions: [result, ...prev.paymentTransactions],
        accessFee: paymentManagerService.getFormattedAccessFee()
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to process payment';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Verify payment on blockchain
  const verifyPaymentOnBlockchain = useCallback(async (
    transactionHash: string,
    paymentId: number
  ): Promise<PaymentTransaction | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await paymentManagerService.verifyPaymentOnBlockchain(
        transactionHash,
        paymentId
      );

      if (result) {
        setState(prev => ({
          ...prev,
          loading: false,
          paymentTransactions: prev.paymentTransactions.map(tx => 
            tx.transactionHash === transactionHash ? result : tx
          )
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false
        }));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to verify payment on blockchain';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Get consent details from blockchain
  const getConsentDetailsFromBlockchain = useCallback(async (consentId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await consentContractService.getConsentDetailsFromBlockchain(consentId);

      setState(prev => ({
        ...prev,
        loading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get consent details from blockchain';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Check if consent is valid on blockchain
  const isConsentValidOnBlockchain = useCallback(async (consentId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await consentContractService.isConsentValidOnBlockchain(consentId);

      setState(prev => ({
        ...prev,
        loading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check consent validity on blockchain';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  // Get formatted access fee
  const getFormattedAccessFee = useCallback((): string => {
    return paymentManagerService.getFormattedAccessFee();
  }, []);

  // Request refund
  const requestRefund = useCallback(async (
    paymentId: number,
    reason: string
  ): Promise<{ success: boolean; error?: string }> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await paymentManagerService.requestRefund(paymentId, reason);

      setState(prev => ({
        ...prev,
        loading: false
      }));

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to request refund';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    state,
    createConsentOnBlockchain,
    approveConsentOnBlockchain,
    revokeConsentOnBlockchain,
    processAccessPayment,
    verifyPaymentOnBlockchain,
    getConsentDetailsFromBlockchain,
    isConsentValidOnBlockchain,
    getFormattedAccessFee,
    requestRefund,
    clearError
  };
}