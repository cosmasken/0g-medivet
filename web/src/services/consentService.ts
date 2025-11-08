/**
 * Consent Management Service
 * Handles consent requests, approvals, and management for patient-provider relationships
 */

import { consentContractService } from './ConsentContractService';

export interface ConsentRequest {
    id: string;
    providerId: string;
    providerName: string;
    providerSpecialty?: string;
    providerWalletAddress: string;
    patientId: string;
    patientWalletAddress: string;
    requestedAccessLevel: 'view' | 'edit' | 'full';
    requestedDataTypes: string[];
    purpose: string;
    urgency: 'standard' | 'urgent' | 'emergency';
    duration: number; // in days
    status: 'pending' | 'approved' | 'denied' | 'expired' | 'revoked';
    createdAt: string;
    updatedAt: string;
    expiresAt?: string;
    approvedAt?: string;
    deniedAt?: string;
    revokedAt?: string;
    denialReason?: string;
    revocationReason?: string;
    blockchainId?: number; // ID on the blockchain
    blockchainTxHash?: string; // Transaction hash for the consent
    metadata?: {
        emergencyContact?: string;
        medicalJustification?: string;
        expectedTreatmentDuration?: number;
        followUpRequired?: boolean;
    };
}

export interface ConsentNotification {
    id: string;
    type: 'request' | 'approval' | 'denial' | 'expiration' | 'revocation';
    consentRequestId: string;
    recipientId: string;
    recipientType: 'patient' | 'provider';
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    actionRequired?: boolean;
    actionUrl?: string;
}

export interface ConsentStats {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    deniedRequests: number;
    expiredRequests: number;
    revokedRequests: number;
    averageResponseTime: number; // in hours
    approvalRate: number; // percentage
}

export interface CreateConsentRequestData {
    patientWalletAddress: string;
    requestedAccessLevel: ConsentRequest['requestedAccessLevel'];
    requestedDataTypes: string[];
    purpose: string;
    urgency: ConsentRequest['urgency'];
    duration: number;
    metadata?: ConsentRequest['metadata'];
}

export interface ConsentApprovalData {
    consentRequestId: string;
    approvedAccessLevel: ConsentRequest['requestedAccessLevel'];
    approvedDataTypes: string[];
    duration: number;
    conditions?: string[];
}

export interface ConsentDenialData {
    consentRequestId: string;
    reason: string;
    allowResubmission?: boolean;
    suggestedChanges?: string[];
}

export class ConsentService {
    private consentRequests: ConsentRequest[] = [];
    private notifications: ConsentNotification[] = [];

    /**
     * Create a new consent request from provider to patient
     */
    async createConsentRequest(
        providerId: string,
        providerData: {
            name: string;
            specialty?: string;
            walletAddress: string;
        },
        requestData: CreateConsentRequestData
    ): Promise<ConsentRequest> {
        try {
            // Validate request data
            this.validateConsentRequestData(requestData);

            // Check for existing pending requests
            const existingRequest = this.consentRequests.find(req =>
                req.providerId === providerId &&
                req.patientWalletAddress.toLowerCase() === requestData.patientWalletAddress.toLowerCase() &&
                req.status === 'pending'
            );

            if (existingRequest) {
                throw new Error('A pending consent request already exists for this patient');
            }

            // Create consent request on blockchain first
            const blockchainTx = await consentContractService.createConsentOnBlockchain(
                providerId,
                requestData.patientWalletAddress,
                requestData.requestedAccessLevel,
                requestData.duration,
                requestData.purpose
            );

            // Create consent request
            const consentRequest: ConsentRequest = {
                id: `consent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                providerId,
                providerName: providerData.name,
                providerSpecialty: providerData.specialty,
                providerWalletAddress: providerData.walletAddress,
                patientId: `patient-${requestData.patientWalletAddress}`, // In real app, resolve from wallet
                patientWalletAddress: requestData.patientWalletAddress,
                requestedAccessLevel: requestData.requestedAccessLevel,
                requestedDataTypes: [...requestData.requestedDataTypes],
                purpose: requestData.purpose,
                urgency: requestData.urgency,
                duration: requestData.duration,
                status: 'pending',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                expiresAt: this.calculateExpirationDate(requestData.urgency),
                blockchainId: blockchainTx.consentId,
                blockchainTxHash: blockchainTx.transactionHash,
                metadata: requestData.metadata ? { ...requestData.metadata } : undefined
            };

            // Store the request
            this.consentRequests.push(consentRequest);

            // Create notification for patient
            await this.createNotification({
                type: 'request',
                consentRequestId: consentRequest.id,
                recipientId: consentRequest.patientId,
                recipientType: 'patient',
                title: 'New Consent Request',
                message: `Dr. ${providerData.name} has requested access to your medical records`,
                actionRequired: true,
                actionUrl: `/consent/review/${consentRequest.id}`
            });

            // Persist data
            this.persistData();

            return consentRequest;

        } catch (error) {
            console.error('Failed to create consent request:', error);
            throw error;
        }
    }

    /**
     * Approve a consent request (patient action)
     */
    async approveConsentRequest(
        consentRequestId: string,
        patientId: string,
        approvalData: ConsentApprovalData
    ): Promise<ConsentRequest> {
        try {
            const request = this.consentRequests.find(req =>
                req.id === consentRequestId && req.patientId === patientId
            );

            if (!request) {
                throw new Error('Consent request not found');
            }

            if (request.status !== 'pending') {
                throw new Error('Consent request is not pending');
            }

            // Check if request has expired
            if (request.expiresAt && new Date(request.expiresAt) < new Date()) {
                request.status = 'expired';
                request.updatedAt = new Date().toISOString();
                throw new Error('Consent request has expired');
            }

            // Approve on blockchain if it exists there
            if (request.blockchainId !== undefined) {
                await consentContractService.approveConsentOnBlockchain(request.blockchainId);
            }

            // Update request with approval
            request.status = 'approved';
            request.requestedAccessLevel = approvalData.approvedAccessLevel;
            request.requestedDataTypes = [...approvalData.approvedDataTypes];
            request.duration = approvalData.duration;
            request.approvedAt = new Date().toISOString();
            request.updatedAt = new Date().toISOString();

            // Calculate new expiration based on approved duration
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + approvalData.duration);
            request.expiresAt = expirationDate.toISOString();

            // Create notification for provider
            await this.createNotification({
                type: 'approval',
                consentRequestId: request.id,
                recipientId: request.providerId,
                recipientType: 'provider',
                title: 'Consent Request Approved',
                message: `Your consent request has been approved by the patient`,
                actionRequired: false
            });

            this.persistData();
            return request;

        } catch (error) {
            console.error('Failed to approve consent request:', error);
            throw error;
        }
    }

    /**
     * Deny a consent request (patient action)
     */
    async denyConsentRequest(
        consentRequestId: string,
        patientId: string,
        denialData: ConsentDenialData
    ): Promise<ConsentRequest> {
        try {
            const request = this.consentRequests.find(req =>
                req.id === consentRequestId && req.patientId === patientId
            );

            if (!request) {
                throw new Error('Consent request not found');
            }

            if (request.status !== 'pending') {
                throw new Error('Consent request is not pending');
            }

            // Update request with denial
            request.status = 'denied';
            request.deniedAt = new Date().toISOString();
            request.updatedAt = new Date().toISOString();
            request.denialReason = denialData.reason;

            // Create notification for provider
            await this.createNotification({
                type: 'denial',
                consentRequestId: request.id,
                recipientId: request.providerId,
                recipientType: 'provider',
                title: 'Consent Request Denied',
                message: `Your consent request has been denied: ${denialData.reason}`,
                actionRequired: false
            });

            this.persistData();
            return request;

        } catch (error) {
            console.error('Failed to deny consent request:', error);
            throw error;
        }
    }

    /**
     * Revoke an approved consent (patient action)
     */
    async revokeConsent(
        consentRequestId: string,
        patientId: string,
        reason: string
    ): Promise<ConsentRequest> {
        try {
            const request = this.consentRequests.find(req =>
                req.id === consentRequestId && req.patientId === patientId
            );

            if (!request) {
                throw new Error('Consent request not found');
            }

            if (request.status !== 'approved') {
                throw new Error('Only approved consents can be revoked');
            }

            // Revoke on blockchain if it exists there
            if (request.blockchainId !== undefined) {
                await consentContractService.revokeConsentOnBlockchain(request.blockchainId, reason);
            }

            // Update request with revocation
            request.status = 'revoked';
            request.revokedAt = new Date().toISOString();
            request.updatedAt = new Date().toISOString();
            request.revocationReason = reason;

            // Create notification for provider
            await this.createNotification({
                type: 'revocation',
                consentRequestId: request.id,
                recipientId: request.providerId,
                recipientType: 'provider',
                title: 'Consent Revoked',
                message: `Patient has revoked consent: ${reason}`,
                actionRequired: false
            });

            this.persistData();
            return request;

        } catch (error) {
            console.error('Failed to revoke consent:', error);
            throw error;
        }
    }

    /**
     * Get consent requests for a provider
     */
    getProviderConsentRequests(
        providerId: string,
        status?: ConsentRequest['status']
    ): ConsentRequest[] {
        let requests = this.consentRequests.filter(req => req.providerId === providerId);

        if (status) {
            requests = requests.filter(req => req.status === status);
        }

        return requests.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    /**
     * Get consent requests for a patient
     */
    getPatientConsentRequests(
        patientId: string,
        status?: ConsentRequest['status']
    ): ConsentRequest[] {
        let requests = this.consentRequests.filter(req => req.patientId === patientId);

        if (status) {
            requests = requests.filter(req => req.status === status);
        }

        return requests.sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
    }

    /**
     * Get a specific consent request
     */
    getConsentRequest(consentRequestId: string): ConsentRequest | null {
        return this.consentRequests.find(req => req.id === consentRequestId) || null;
    }

    /**
     * Get notifications for a user
     */
    getNotifications(
        recipientId: string,
        recipientType: 'patient' | 'provider',
        unreadOnly: boolean = false
    ): ConsentNotification[] {
        let notifications = this.notifications.filter(notif =>
            notif.recipientId === recipientId && notif.recipientType === recipientType
        );

        if (unreadOnly) {
            notifications = notifications.filter(notif => !notif.isRead);
        }

        return notifications.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    /**
     * Mark notification as read
     */
    markNotificationAsRead(notificationId: string): boolean {
        const notification = this.notifications.find(notif => notif.id === notificationId);

        if (notification) {
            notification.isRead = true;
            this.persistData();
            return true;
        }

        return false;
    }

    /**
     * Mark all notifications as read for a user
     */
    markAllNotificationsAsRead(
        recipientId: string,
        recipientType: 'patient' | 'provider'
    ): number {
        let markedCount = 0;

        this.notifications.forEach(notif => {
            if (notif.recipientId === recipientId &&
                notif.recipientType === recipientType &&
                !notif.isRead) {
                notif.isRead = true;
                markedCount++;
            }
        });

        if (markedCount > 0) {
            this.persistData();
        }

        return markedCount;
    }

    /**
     * Get consent statistics for a provider
     */
    getProviderConsentStats(providerId: string): ConsentStats {
        const requests = this.getProviderConsentRequests(providerId);

        const stats: ConsentStats = {
            totalRequests: requests.length,
            pendingRequests: requests.filter(req => req.status === 'pending').length,
            approvedRequests: requests.filter(req => req.status === 'approved').length,
            deniedRequests: requests.filter(req => req.status === 'denied').length,
            expiredRequests: requests.filter(req => req.status === 'expired').length,
            revokedRequests: requests.filter(req => req.status === 'revoked').length,
            averageResponseTime: 0,
            approvalRate: 0
        };

        // Calculate approval rate
        const decidedRequests = stats.approvedRequests + stats.deniedRequests;
        if (decidedRequests > 0) {
            stats.approvalRate = (stats.approvedRequests / decidedRequests) * 100;
        }

        // Calculate average response time
        const respondedRequests = requests.filter(req =>
            req.status === 'approved' || req.status === 'denied'
        );

        if (respondedRequests.length > 0) {
            const totalResponseTime = respondedRequests.reduce((total, req) => {
                const createdAt = new Date(req.createdAt).getTime();
                const respondedAt = new Date(req.approvedAt || req.deniedAt || req.createdAt).getTime();
                return total + (respondedAt - createdAt);
            }, 0);

            stats.averageResponseTime = totalResponseTime / respondedRequests.length / (1000 * 60 * 60); // Convert to hours
        }

        return stats;
    }

    /**
     * Check if consent is still valid
     */
    isConsentValid(consentRequest: ConsentRequest): boolean {
        if (consentRequest.status !== 'approved') {
            return false;
        }

        if (consentRequest.expiresAt && new Date(consentRequest.expiresAt) < new Date()) {
            return false;
        }

        return true;
    }

    /**
     * Get expiring consents (within specified days)
     */
    getExpiringConsents(days: number = 7): ConsentRequest[] {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);

        return this.consentRequests.filter(req =>
            req.status === 'approved' &&
            req.expiresAt &&
            new Date(req.expiresAt) <= cutoffDate &&
            new Date(req.expiresAt) > new Date()
        );
    }

    /**
     * Process expired consents
     */
    processExpiredConsents(): number {
        let expiredCount = 0;
        const now = new Date();

        this.consentRequests.forEach(req => {
            if ((req.status === 'pending' || req.status === 'approved') &&
                req.expiresAt &&
                new Date(req.expiresAt) < now) {
                req.status = 'expired';
                req.updatedAt = now.toISOString();
                expiredCount++;

                // Create expiration notification
                this.createNotification({
                    type: 'expiration',
                    consentRequestId: req.id,
                    recipientId: req.status === 'pending' ? req.patientId : req.providerId,
                    recipientType: req.status === 'pending' ? 'patient' : 'provider',
                    title: 'Consent Expired',
                    message: req.status === 'pending'
                        ? 'A consent request has expired'
                        : 'Your consent access has expired',
                    actionRequired: false
                });
            }
        });

        if (expiredCount > 0) {
            this.persistData();
        }

        return expiredCount;
    }

    // Private helper methods

    private validateConsentRequestData(data: CreateConsentRequestData): void {
        if (!data.patientWalletAddress || !/^0x[a-fA-F0-9]{40}$/.test(data.patientWalletAddress)) {
            throw new Error('Invalid patient wallet address');
        }

        if (!data.purpose || data.purpose.trim().length < 10) {
            throw new Error('Purpose must be at least 10 characters long');
        }

        if (!data.requestedDataTypes || data.requestedDataTypes.length === 0) {
            throw new Error('At least one data type must be requested');
        }

        if (data.duration < 1 || data.duration > 365) {
            throw new Error('Duration must be between 1 and 365 days');
        }

        if (data.urgency === 'emergency' && !data.metadata?.medicalJustification) {
            throw new Error('Emergency requests require medical justification');
        }
    }

    private calculateExpirationDate(urgency: ConsentRequest['urgency']): string {
        const expirationDate = new Date();

        switch (urgency) {
            case 'emergency':
                expirationDate.setHours(expirationDate.getHours() + 2); // 2 hours for emergency
                break;
            case 'urgent':
                expirationDate.setHours(expirationDate.getHours() + 24); // 24 hours for urgent
                break;
            default:
                expirationDate.setDate(expirationDate.getDate() + 7); // 7 days for standard
                break;
        }

        return expirationDate.toISOString();
    }

    private async createNotification(data: {
        type: ConsentNotification['type'];
        consentRequestId: string;
        recipientId: string;
        recipientType: 'patient' | 'provider';
        title: string;
        message: string;
        actionRequired?: boolean;
        actionUrl?: string;
    }): Promise<ConsentNotification> {
        const notification: ConsentNotification = {
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: data.type,
            consentRequestId: data.consentRequestId,
            recipientId: data.recipientId,
            recipientType: data.recipientType,
            title: data.title,
            message: data.message,
            isRead: false,
            createdAt: new Date().toISOString(),
            actionRequired: data.actionRequired,
            actionUrl: data.actionUrl
        };

        this.notifications.push(notification);
        return notification;
    }

    private persistData(): void {
        try {
            localStorage.setItem('consent-requests', JSON.stringify(this.consentRequests));
            localStorage.setItem('consent-notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.warn('Failed to persist consent data:', error);
        }
    }

    private loadPersistedData(): void {
        try {
            const requestsData = localStorage.getItem('consent-requests');
            if (requestsData) {
                this.consentRequests = JSON.parse(requestsData);
            }

            const notificationsData = localStorage.getItem('consent-notifications');
            if (notificationsData) {
                this.notifications = JSON.parse(notificationsData);
            }
        } catch (error) {
            console.warn('Failed to load persisted consent data:', error);
        }
    }

    constructor() {
        this.loadPersistedData();

        // Process expired consents on initialization
        this.processExpiredConsents();

        // Set up periodic processing of expired consents
        setInterval(() => {
            this.processExpiredConsents();
        }, 60 * 60 * 1000); // Check every hour
    }
}

// Export singleton instance
export const consentService = new ConsentService();