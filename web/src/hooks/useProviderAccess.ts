/**
 * Provider Access Hook
 * Manages provider access to patient records, payments, and audit logging
 */

import { useState, useCallback, useEffect } from 'react';
import {
    providerAccessService,
    AccessPermission,
    AccessSession,
    PaymentTransaction,
    AccessAttempt,
    ProviderAccessStats
} from '@/services/providerAccessService';
import { MedicalFileMetadata } from '@/stores/medicalFilesStore';

interface ProviderAccessState {
    loading: boolean;
    error: string | null;
    permissions: AccessPermission[];
    activeSessions: AccessSession[];
    recentActivity: AccessAttempt[];
    stats: ProviderAccessStats | null;
}

interface UseProviderAccessReturn {
    accessState: ProviderAccessState;
    checkAccess: (
        providerId: string,
        patientId: string,
        dataType?: string,
        accessType?: 'view' | 'edit' | 'full'
    ) => { hasAccess: boolean; permission?: AccessPermission; reason?: string };
    startAccessSession: (
        providerId: string,
        patientId: string,
        paymentTransactionHash?: string
    ) => Promise<{
        session?: AccessSession;
        paymentRequired: boolean;
        paymentTransaction?: PaymentTransaction;
    } | null>;
    accessFile: (
        sessionId: string,
        fileId: string,
        accessType?: 'view' | 'download' | 'edit'
    ) => Promise<{ success: boolean; file?: MedicalFileMetadata; error?: string }>;
    endAccessSession: (sessionId: string) => Promise<boolean>;
    loadProviderPermissions: (providerId: string) => void;
    loadPatientPermissions: (patientId: string) => void;
    loadAccessAttempts: (providerId?: string, patientId?: string, limit?: number) => void;
    loadProviderStats: (providerId: string) => void;
    revokeAccess: (permissionId: string, reason: string) => Promise<boolean>;
    clearError: () => void;
}

export function useProviderAccess(): UseProviderAccessReturn {
    const [accessState, setAccessState] = useState<ProviderAccessState>({
        loading: false,
        error: null,
        permissions: [],
        activeSessions: [],
        recentActivity: [],
        stats: null
    });

    // Check access permissions
    const checkAccess = useCallback((
        providerId: string,
        patientId: string,
        dataType?: string,
        accessType: 'view' | 'edit' | 'full' = 'view'
    ) => {
        return providerAccessService.checkAccess(providerId, patientId, dataType, accessType);
    }, []);

    // Start access session
    const startAccessSession = useCallback(async (
        providerId: string,
        patientId: string,
        paymentTransactionHash?: string
    ) => {
        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await providerAccessService.startAccessSession(
                providerId,
                patientId,
                paymentTransactionHash
            );

            setAccessState(prev => ({ ...prev, loading: false }));
            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start access session';

            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Access file
    const accessFile = useCallback(async (
        sessionId: string,
        fileId: string,
        accessType: 'view' | 'download' | 'edit' = 'view'
    ) => {
        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await providerAccessService.accessFile(sessionId, fileId, accessType);

            setAccessState(prev => ({ ...prev, loading: false }));
            return result;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'File access failed';

            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return { success: false, error: errorMessage };
        }
    }, []);

    // End access session
    const endAccessSession = useCallback(async (sessionId: string): Promise<boolean> => {
        try {
            return await providerAccessService.endAccessSession(sessionId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to end session';

            setAccessState(prev => ({
                ...prev,
                error: errorMessage
            }));

            return false;
        }
    }, []);

    // Load provider permissions
    const loadProviderPermissions = useCallback((providerId: string) => {
        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const permissions = providerAccessService.getProviderPermissions(providerId);

            setAccessState(prev => ({
                ...prev,
                loading: false,
                permissions
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load permissions';

            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Load patient permissions
    const loadPatientPermissions = useCallback((patientId: string) => {
        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const permissions = providerAccessService.getPatientPermissions(patientId);

            setAccessState(prev => ({
                ...prev,
                loading: false,
                permissions
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load permissions';

            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Load access attempts
    const loadAccessAttempts = useCallback((
        providerId?: string,
        patientId?: string,
        limit: number = 100
    ) => {
        try {
            const recentActivity = providerAccessService.getAccessAttempts(providerId, patientId, limit);

            setAccessState(prev => ({
                ...prev,
                recentActivity
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load access attempts';

            setAccessState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Load provider statistics
    const loadProviderStats = useCallback((providerId: string) => {
        try {
            const stats = providerAccessService.getProviderStats(providerId);

            setAccessState(prev => ({
                ...prev,
                stats
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load provider stats';

            setAccessState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Revoke access
    const revokeAccess = useCallback(async (
        permissionId: string,
        reason: string
    ): Promise<boolean> => {
        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const success = await providerAccessService.revokeAccess(permissionId, reason);

            setAccessState(prev => ({ ...prev, loading: false }));
            return success;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to revoke access';

            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return false;
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setAccessState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        accessState,
        checkAccess,
        startAccessSession,
        accessFile,
        endAccessSession,
        loadProviderPermissions,
        loadPatientPermissions,
        loadAccessAttempts,
        loadProviderStats,
        revokeAccess,
        clearError
    };
}

/**
 * Hook for payment management
 */
interface PaymentState {
    loading: boolean;
    error: string | null;
    transactions: PaymentTransaction[];
    pendingPayments: PaymentTransaction[];
}

interface UsePaymentManagementReturn {
    paymentState: PaymentState;
    createPayment: (
        providerId: string,
        patientId: string,
        accessPermissionId: string
    ) => Promise<PaymentTransaction | null>;
    verifyPayment: (transactionHash: string) => Promise<PaymentTransaction | null>;
    getPaymentHistory: (providerId: string) => PaymentTransaction[];
    getPendingPayments: (providerId: string) => PaymentTransaction[];
    clearError: () => void;
}

export function usePaymentManagement(): UsePaymentManagementReturn {
    const [paymentState, setPaymentState] = useState<PaymentState>({
        loading: false,
        error: null,
        transactions: [],
        pendingPayments: []
    });

    // Create payment (placeholder - would integrate with actual payment system)
    const createPayment = useCallback(async (
        providerId: string,
        patientId: string,
        accessPermissionId: string
    ): Promise<PaymentTransaction | null> => {
        setPaymentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // This would integrate with the actual smart contract payment system
            // For now, we'll simulate payment creation
            const mockTransaction: PaymentTransaction = {
                id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                providerId,
                patientId,
                accessPermissionId,
                amount: 1000000000000000, // 0.001 ETH in wei
                currency: 'ETH',
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            setPaymentState(prev => ({
                ...prev,
                loading: false,
                transactions: [mockTransaction, ...prev.transactions],
                pendingPayments: [mockTransaction, ...prev.pendingPayments]
            }));

            return mockTransaction;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create payment';

            setPaymentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Verify payment
    const verifyPayment = useCallback(async (
        transactionHash: string
    ): Promise<PaymentTransaction | null> => {
        setPaymentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // This would verify the transaction on the blockchain
            // For now, we'll simulate verification
            const transaction = paymentState.transactions.find(t => t.transactionHash === transactionHash);

            if (transaction) {
                transaction.status = 'confirmed';
                transaction.confirmedAt = new Date().toISOString();

                setPaymentState(prev => ({
                    ...prev,
                    loading: false,
                    pendingPayments: prev.pendingPayments.filter(p => p.id !== transaction.id)
                }));

                return transaction;
            }

            throw new Error('Transaction not found');

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';

            setPaymentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, [paymentState.transactions]);

    // Get payment history
    const getPaymentHistory = useCallback((providerId: string): PaymentTransaction[] => {
        return paymentState.transactions
            .filter(t => t.providerId === providerId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [paymentState.transactions]);

    // Get pending payments
    const getPendingPayments = useCallback((providerId: string): PaymentTransaction[] => {
        return paymentState.pendingPayments
            .filter(t => t.providerId === providerId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [paymentState.pendingPayments]);

    // Clear error
    const clearError = useCallback(() => {
        setPaymentState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        paymentState,
        createPayment,
        verifyPayment,
        getPaymentHistory,
        getPendingPayments,
        clearError
    };
}

/**
 * Hook for access audit and monitoring
 */
interface AuditState {
    loading: boolean;
    error: string | null;
    auditLog: AccessAttempt[];
    stats: ProviderAccessStats | null;
}

interface UseAccessAuditReturn {
    auditState: AuditState;
    loadAuditLog: (providerId?: string, patientId?: string, limit?: number) => void;
    loadAuditStats: (providerId: string) => void;
    exportAuditLog: (providerId?: string, patientId?: string) => string;
    clearError: () => void;
}

export function useAccessAudit(): UseAccessAuditReturn {
    const [auditState, setAuditState] = useState<AuditState>({
        loading: false,
        error: null,
        auditLog: [],
        stats: null
    });

    // Load audit log
    const loadAuditLog = useCallback((
        providerId?: string,
        patientId?: string,
        limit: number = 100
    ) => {
        setAuditState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const auditLog = providerAccessService.getAccessAttempts(providerId, patientId, limit);

            setAuditState(prev => ({
                ...prev,
                loading: false,
                auditLog
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load audit log';

            setAuditState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Load audit statistics
    const loadAuditStats = useCallback((providerId: string) => {
        try {
            const stats = providerAccessService.getProviderStats(providerId);

            setAuditState(prev => ({
                ...prev,
                stats
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load audit stats';

            setAuditState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Export audit log
    const exportAuditLog = useCallback((
        providerId?: string,
        patientId?: string
    ): string => {
        const auditLog = providerAccessService.getAccessAttempts(providerId, patientId);

        const csvHeader = 'Timestamp,Provider ID,Patient ID,File ID,Access Type,Success,Failure Reason\n';
        const csvData = auditLog.map(attempt =>
            `${attempt.timestamp},${attempt.providerId},${attempt.patientId},${attempt.fileId || ''},${attempt.accessType},${attempt.success},${attempt.failureReason || ''}`
        ).join('\n');

        return csvHeader + csvData;
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setAuditState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        auditState,
        loadAuditLog,
        loadAuditStats,
        exportAuditLog,
        clearError
    };
}