/**
 * Consent Management Hook
 * Manages consent requests, approvals, and notifications
 */

import { useState, useCallback, useEffect } from 'react';
import {
    consentService,
    ConsentRequest,
    ConsentNotification,
    CreateConsentRequestData,
    ConsentApprovalData,
    ConsentDenialData,
    ConsentStats
} from '@/services/consentService';

interface ConsentState {
    loading: boolean;
    error: string | null;
    requests: ConsentRequest[];
    notifications: ConsentNotification[];
    stats: ConsentStats | null;
}

interface UseConsentManagementReturn {
    consentState: ConsentState;
    createConsentRequest: (
        providerId: string,
        providerData: { name: string; specialty?: string; walletAddress: string },
        requestData: CreateConsentRequestData
    ) => Promise<ConsentRequest | null>;
    approveConsentRequest: (
        consentRequestId: string,
        patientId: string,
        approvalData: ConsentApprovalData
    ) => Promise<ConsentRequest | null>;
    denyConsentRequest: (
        consentRequestId: string,
        patientId: string,
        denialData: ConsentDenialData
    ) => Promise<ConsentRequest | null>;
    revokeConsent: (
        consentRequestId: string,
        patientId: string,
        reason: string
    ) => Promise<ConsentRequest | null>;
    loadProviderRequests: (providerId: string, status?: ConsentRequest['status']) => void;
    loadPatientRequests: (patientId: string, status?: ConsentRequest['status']) => void;
    loadNotifications: (userId: string, userType: 'patient' | 'provider', unreadOnly?: boolean) => void;
    markNotificationAsRead: (notificationId: string) => boolean;
    markAllNotificationsAsRead: (userId: string, userType: 'patient' | 'provider') => number;
    getConsentRequest: (requestId: string) => ConsentRequest | null;
    loadProviderStats: (providerId: string) => void;
    refreshData: () => void;
    clearError: () => void;
}

export function useConsentManagement(): UseConsentManagementReturn {
    const [consentState, setConsentState] = useState<ConsentState>({
        loading: false,
        error: null,
        requests: [],
        notifications: [],
        stats: null
    });

    // Create consent request
    const createConsentRequest = useCallback(async (
        providerId: string,
        providerData: { name: string; specialty?: string; walletAddress: string },
        requestData: CreateConsentRequestData
    ): Promise<ConsentRequest | null> => {
        setConsentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const request = await consentService.createConsentRequest(
                providerId,
                providerData,
                requestData
            );

            setConsentState(prev => ({
                ...prev,
                loading: false,
                requests: [request, ...prev.requests]
            }));

            return request;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create consent request';

            setConsentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Approve consent request
    const approveConsentRequest = useCallback(async (
        consentRequestId: string,
        patientId: string,
        approvalData: ConsentApprovalData
    ): Promise<ConsentRequest | null> => {
        setConsentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const request = await consentService.approveConsentRequest(
                consentRequestId,
                patientId,
                approvalData
            );

            setConsentState(prev => ({
                ...prev,
                loading: false,
                requests: prev.requests.map(req =>
                    req.id === consentRequestId ? request : req
                )
            }));

            return request;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to approve consent request';

            setConsentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Deny consent request
    const denyConsentRequest = useCallback(async (
        consentRequestId: string,
        patientId: string,
        denialData: ConsentDenialData
    ): Promise<ConsentRequest | null> => {
        setConsentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const request = await consentService.denyConsentRequest(
                consentRequestId,
                patientId,
                denialData
            );

            setConsentState(prev => ({
                ...prev,
                loading: false,
                requests: prev.requests.map(req =>
                    req.id === consentRequestId ? request : req
                )
            }));

            return request;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to deny consent request';

            setConsentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Revoke consent
    const revokeConsent = useCallback(async (
        consentRequestId: string,
        patientId: string,
        reason: string
    ): Promise<ConsentRequest | null> => {
        setConsentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const request = await consentService.revokeConsent(
                consentRequestId,
                patientId,
                reason
            );

            setConsentState(prev => ({
                ...prev,
                loading: false,
                requests: prev.requests.map(req =>
                    req.id === consentRequestId ? request : req
                )
            }));

            return request;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to revoke consent';

            setConsentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Load provider requests
    const loadProviderRequests = useCallback((
        providerId: string,
        status?: ConsentRequest['status']
    ) => {
        setConsentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const requests = consentService.getProviderConsentRequests(providerId, status);

            setConsentState(prev => ({
                ...prev,
                loading: false,
                requests
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load provider requests';

            setConsentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Load patient requests
    const loadPatientRequests = useCallback((
        patientId: string,
        status?: ConsentRequest['status']
    ) => {
        setConsentState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const requests = consentService.getPatientConsentRequests(patientId, status);

            setConsentState(prev => ({
                ...prev,
                loading: false,
                requests
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load patient requests';

            setConsentState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Load notifications
    const loadNotifications = useCallback((
        userId: string,
        userType: 'patient' | 'provider',
        unreadOnly: boolean = false
    ) => {
        try {
            const notifications = consentService.getNotifications(userId, userType, unreadOnly);

            setConsentState(prev => ({
                ...prev,
                notifications
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';

            setConsentState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Mark notification as read
    const markNotificationAsRead = useCallback((notificationId: string): boolean => {
        const success = consentService.markNotificationAsRead(notificationId);

        if (success) {
            setConsentState(prev => ({
                ...prev,
                notifications: prev.notifications.map(notif =>
                    notif.id === notificationId
                        ? { ...notif, isRead: true }
                        : notif
                )
            }));
        }

        return success;
    }, []);

    // Mark all notifications as read
    const markAllNotificationsAsRead = useCallback((
        userId: string,
        userType: 'patient' | 'provider'
    ): number => {
        const markedCount = consentService.markAllNotificationsAsRead(userId, userType);

        if (markedCount > 0) {
            setConsentState(prev => ({
                ...prev,
                notifications: prev.notifications.map(notif => ({ ...notif, isRead: true }))
            }));
        }

        return markedCount;
    }, []);

    // Get consent request
    const getConsentRequest = useCallback((requestId: string): ConsentRequest | null => {
        return consentService.getConsentRequest(requestId);
    }, []);

    // Load provider stats
    const loadProviderStats = useCallback((providerId: string) => {
        try {
            const stats = consentService.getProviderConsentStats(providerId);

            setConsentState(prev => ({
                ...prev,
                stats
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load provider stats';

            setConsentState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Refresh all data
    const refreshData = useCallback(() => {
        // This would typically reload the current data based on the current context
        // For now, we'll just clear the error
        setConsentState(prev => ({ ...prev, error: null }));
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setConsentState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        consentState,
        createConsentRequest,
        approveConsentRequest,
        denyConsentRequest,
        revokeConsent,
        loadProviderRequests,
        loadPatientRequests,
        loadNotifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        getConsentRequest,
        loadProviderStats,
        refreshData,
        clearError
    };
}

/**
 * Hook for consent request validation and workflow
 */
interface UseConsentWorkflowReturn {
    validateRequestData: (data: CreateConsentRequestData) => { isValid: boolean; errors: string[] };
    validateApprovalData: (data: ConsentApprovalData) => { isValid: boolean; errors: string[] };
    isConsentValid: (request: ConsentRequest) => boolean;
    isConsentExpiring: (request: ConsentRequest, days?: number) => boolean;
    getConsentTimeRemaining: (request: ConsentRequest) => { days: number; hours: number; expired: boolean };
    canRequestAccess: (request: ConsentRequest) => boolean;
    getNextAction: (request: ConsentRequest, userType: 'patient' | 'provider') => string | null;
}

export function useConsentWorkflow(): UseConsentWorkflowReturn {
    const validateRequestData = useCallback((data: CreateConsentRequestData) => {
        const errors: string[] = [];

        if (!data.patientWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(data.patientWalletAddress)) {
            errors.push('Invalid patient wallet address');
        }

        if (!data.purpose || data.purpose.trim().length < 10) {
            errors.push('Purpose must be at least 10 characters long');
        }

        if (!data.requestedDataTypes || data.requestedDataTypes.length === 0) {
            errors.push('At least one data type must be requested');
        }

        if (data.duration < 1 || data.duration > 365) {
            errors.push('Duration must be between 1 and 365 days');
        }

        if (data.urgency === 'emergency' && !data.metadata?.medicalJustification) {
            errors.push('Emergency requests require medical justification');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, []);

    const validateApprovalData = useCallback((data: ConsentApprovalData) => {
        const errors: string[] = [];

        if (!data.consentRequestId) {
            errors.push('Consent request ID is required');
        }

        if (!data.approvedDataTypes || data.approvedDataTypes.length === 0) {
            errors.push('At least one data type must be approved');
        }

        if (data.duration < 1 || data.duration > 365) {
            errors.push('Duration must be between 1 and 365 days');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }, []);

    const isConsentValid = useCallback((request: ConsentRequest): boolean => {
        return consentService.isConsentValid(request);
    }, []);

    const isConsentExpiring = useCallback((request: ConsentRequest, days: number = 7): boolean => {
        if (request.status !== 'approved' || !request.expiresAt) {
            return false;
        }

        const expiryDate = new Date(request.expiresAt);
        const warningDate = new Date();
        warningDate.setDate(warningDate.getDate() + days);

        return expiryDate <= warningDate && expiryDate > new Date();
    }, []);

    const getConsentTimeRemaining = useCallback((request: ConsentRequest) => {
        if (!request.expiresAt) {
            return { days: 0, hours: 0, expired: true };
        }

        const now = new Date();
        const expiry = new Date(request.expiresAt);
        const diffMs = expiry.getTime() - now.getTime();

        if (diffMs <= 0) {
            return { days: 0, hours: 0, expired: true };
        }

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        return { days, hours, expired: false };
    }, []);

    const canRequestAccess = useCallback((request: ConsentRequest): boolean => {
        return request.status === 'approved' && isConsentValid(request);
    }, [isConsentValid]);

    const getNextAction = useCallback((
        request: ConsentRequest,
        userType: 'patient' | 'provider'
    ): string | null => {
        if (userType === 'patient') {
            switch (request.status) {
                case 'pending':
                    return 'Review and respond to consent request';
                case 'approved':
                    if (isConsentExpiring(request)) {
                        return 'Consider renewing consent (expiring soon)';
                    }
                    return 'Manage consent or revoke if needed';
                case 'expired':
                    return 'Consent has expired - provider may request renewal';
                default:
                    return null;
            }
        } else {
            switch (request.status) {
                case 'pending':
                    return 'Waiting for patient response';
                case 'approved':
                    if (isConsentExpiring(request)) {
                        return 'Request consent renewal (expiring soon)';
                    }
                    return 'Access patient records';
                case 'denied':
                    return 'Consider modifying request and resubmitting';
                case 'expired':
                    return 'Submit new consent request';
                case 'revoked':
                    return 'Contact patient to discuss access needs';
                default:
                    return null;
            }
        }
    }, [isConsentExpiring]);

    return {
        validateRequestData,
        validateApprovalData,
        isConsentValid,
        isConsentExpiring,
        getConsentTimeRemaining,
        canRequestAccess,
        getNextAction
    };
}