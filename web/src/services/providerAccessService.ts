/**
 * Provider Access Service
 * Manages provider access to patient records with payment integration and audit logging
 */

import { MedicalFileMetadata } from '@/stores/medicalFilesStore';
import { ConsentRequest } from './consentService';
import { consentContractService } from './ConsentContractService';
import { paymentManagerService } from './PaymentManagerService';

export interface AccessPermission {
    id: string;
    providerId: string;
    patientId: string;
    patientWalletAddress: string;
    consentRequestId: string;
    accessLevel: 'view' | 'edit' | 'full';
    allowedDataTypes: string[];
    grantedAt: string;
    expiresAt: string;
    isActive: boolean;
    accessCount: number;
    lastAccessedAt?: string;
    conditions?: string[];
}

export interface AccessAttempt {
    id: string;
    providerId: string;
    patientId: string;
    fileId?: string;
    accessType: 'view' | 'download' | 'edit' | 'share';
    timestamp: string;
    success: boolean;
    failureReason?: string;
    ipAddress?: string;
    userAgent?: string;
    dataAccessed?: string[];
}

export interface PaymentTransaction {
    id: string;
    providerId: string;
    patientId: string;
    accessPermissionId: string;
    amount: number; // in wei
    currency: 'ETH';
    transactionHash?: string;
    status: 'pending' | 'confirmed' | 'failed' | 'refunded';
    createdAt: string;
    confirmedAt?: string;
    failureReason?: string;
    gasUsed?: number;
    gasPrice?: number;
}

export interface AccessSession {
    id: string;
    providerId: string;
    patientId: string;
    accessPermissionId: string;
    startedAt: string;
    lastActivityAt: string;
    endedAt?: string;
    isActive: boolean;
    filesAccessed: string[];
    actionsPerformed: AccessAttempt[];
    paymentTransactionId?: string;
}

export interface ProviderAccessStats {
    totalAccesses: number;
    successfulAccesses: number;
    failedAccesses: number;
    totalPayments: number;
    totalAmountPaid: number;
    averageSessionDuration: number;
    mostAccessedDataTypes: Array<{ type: string; count: number }>;
    recentActivity: AccessAttempt[];
}

export class ProviderAccessService {
    private accessPermissions: AccessPermission[] = [];
    private accessAttempts: AccessAttempt[] = [];
    private paymentTransactions: PaymentTransaction[] = [];
    private accessSessions: AccessSession[] = [];

    // Access fee in wei (0.001 ETH)
    private readonly ACCESS_FEE = BigInt('1000000000000000');

    /**
     * Create access permission from approved consent
     */
    async createAccessPermission(consentRequest: ConsentRequest): Promise<AccessPermission> {
        if (consentRequest.status !== 'approved') {
            throw new Error('Consent request must be approved to create access permission');
        }

        // If the consent exists on blockchain, verify it
        if (consentRequest.blockchainId !== undefined) {
            const isValidOnBlockchain = await consentContractService.isConsentValidOnBlockchain(consentRequest.blockchainId);
            if (!isValidOnBlockchain) {
                throw new Error('Consent is not valid on blockchain');
            }
        }

        const permission: AccessPermission = {
            id: `access-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            providerId: consentRequest.providerId,
            patientId: consentRequest.patientId,
            patientWalletAddress: consentRequest.patientWalletAddress,
            consentRequestId: consentRequest.id,
            accessLevel: consentRequest.requestedAccessLevel,
            allowedDataTypes: [...consentRequest.requestedDataTypes],
            grantedAt: new Date().toISOString(),
            expiresAt: consentRequest.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            isActive: true,
            accessCount: 0
        };

        this.accessPermissions.push(permission);
        this.persistData();

        return permission;
    }

    /**
     * Check if provider has access to patient data
     */
    checkAccess(
        providerId: string,
        patientId: string,
        dataType?: string,
        accessType: 'view' | 'edit' | 'full' = 'view'
    ): { hasAccess: boolean; permission?: AccessPermission; reason?: string } {
        const permission = this.accessPermissions.find(p =>
            p.providerId === providerId &&
            p.patientId === patientId &&
            p.isActive &&
            new Date(p.expiresAt) > new Date()
        );

        if (!permission) {
            return {
                hasAccess: false,
                reason: 'No active access permission found'
            };
        }

        // Check access level
        const accessLevels = ['view', 'edit', 'full'];
        const requiredLevel = accessLevels.indexOf(accessType);
        const grantedLevel = accessLevels.indexOf(permission.accessLevel);

        if (grantedLevel < requiredLevel) {
            return {
                hasAccess: false,
                permission,
                reason: `Insufficient access level. Required: ${accessType}, Granted: ${permission.accessLevel}`
            };
        }

        // Check data type access
        if (dataType && !permission.allowedDataTypes.includes(dataType)) {
            return {
                hasAccess: false,
                permission,
                reason: `Access to ${dataType} not permitted`
            };
        }

        return {
            hasAccess: true,
            permission
        };
    }

    /**
     * Start access session with payment
     */
    async startAccessSession(
        providerId: string,
        patientId: string,
        paymentTransactionHash?: string
    ): Promise<{ session: AccessSession; paymentRequired: boolean; paymentTransaction?: PaymentTransaction }> {
        const accessCheck = this.checkAccess(providerId, patientId);

        if (!accessCheck.hasAccess || !accessCheck.permission) {
            throw new Error(accessCheck.reason || 'Access denied');
        }

        // Check if payment is required
        const paymentRequired = this.isPaymentRequired(accessCheck.permission);
        let paymentTransaction: PaymentTransaction | undefined;

        if (paymentRequired) {
            if (!paymentTransactionHash) {
                // Create pending payment transaction through blockchain
                const amount = paymentManagerService.getAccessFee();
                paymentTransaction = await paymentManagerService.processAccessPayment(
                    providerId,
                    patientId,
                    'medical-record-access', // Use a placeholder record ID, in real implementation this would be specific record
                    Number(amount)
                );

                return {
                    session: {} as AccessSession, // Will be created after payment
                    paymentRequired: true,
                    paymentTransaction
                };
            } else {
                // Verify payment transaction on blockchain
                // In a real implementation, we would verify this on the blockchain directly
                // For now, we'll verify it in our local system
                paymentTransaction = await this.verifyPaymentTransaction(paymentTransactionHash);
                if (paymentTransaction.status !== 'confirmed') {
                    throw new Error('Payment transaction not confirmed');
                }
            }
        }

        // Create access session
        const session: AccessSession = {
            id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            providerId,
            patientId,
            accessPermissionId: accessCheck.permission.id,
            startedAt: new Date().toISOString(),
            lastActivityAt: new Date().toISOString(),
            isActive: true,
            filesAccessed: [],
            actionsPerformed: [],
            paymentTransactionId: paymentTransaction?.id
        };

        this.accessSessions.push(session);

        // Update permission
        accessCheck.permission.accessCount++;
        accessCheck.permission.lastAccessedAt = new Date().toISOString();

        this.persistData();

        return {
            session,
            paymentRequired: false,
            paymentTransaction
        };
    }

    /**
     * Access patient file
     */
    async accessFile(
        sessionId: string,
        fileId: string,
        accessType: 'view' | 'download' | 'edit' = 'view'
    ): Promise<{ success: boolean; file?: MedicalFileMetadata; error?: string }> {
        const session = this.accessSessions.find(s => s.id === sessionId && s.isActive);

        if (!session) {
            return { success: false, error: 'Invalid or expired session' };
        }

        const permission = this.accessPermissions.find(p => p.id === session.accessPermissionId);

        if (!permission) {
            return { success: false, error: 'Access permission not found' };
        }

        // Create access attempt record
        const attempt: AccessAttempt = {
            id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            providerId: session.providerId,
            patientId: session.patientId,
            fileId,
            accessType,
            timestamp: new Date().toISOString(),
            success: false
        };

        try {
            // In a real implementation, this would fetch the actual file
            // For now, we'll simulate file access
            const mockFile: MedicalFileMetadata = {
                id: fileId,
                name: `Medical Record ${fileId}`,
                type: 'application/pdf',
                size: 1024 * 1024, // 1MB
                category: 'medical-history',
                description: 'Patient medical record',
                uploadDate: new Date().toISOString(),
                walletAddress: session.patientId,
                txHash: '0x' + Math.random().toString(16).substr(2, 64),
                rootHash: '0x' + Math.random().toString(16).substr(2, 64),
                isTextRecord: false,
                shared: true,
                sharedWith: [session.providerId]
            };

            // Update session
            session.lastActivityAt = new Date().toISOString();
            if (!session.filesAccessed.includes(fileId)) {
                session.filesAccessed.push(fileId);
            }

            // Mark attempt as successful
            attempt.success = true;
            attempt.dataAccessed = [fileId];

            session.actionsPerformed.push(attempt);
            this.accessAttempts.push(attempt);

            this.persistData();

            return { success: true, file: mockFile };

        } catch (error) {
            attempt.success = false;
            attempt.failureReason = error instanceof Error ? error.message : 'Unknown error';

            session.actionsPerformed.push(attempt);
            this.accessAttempts.push(attempt);

            this.persistData();

            return {
                success: false,
                error: attempt.failureReason
            };
        }
    }

    /**
     * End access session
     */
    async endAccessSession(sessionId: string): Promise<boolean> {
        const session = this.accessSessions.find(s => s.id === sessionId);

        if (!session) {
            return false;
        }

        session.isActive = false;
        session.endedAt = new Date().toISOString();

        this.persistData();
        return true;
    }

    /**
     * Get provider access permissions
     */
    getProviderPermissions(providerId: string): AccessPermission[] {
        return this.accessPermissions.filter(p => p.providerId === providerId)
            .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime());
    }

    /**
     * Get patient access permissions
     */
    getPatientPermissions(patientId: string): AccessPermission[] {
        return this.accessPermissions.filter(p => p.patientId === patientId)
            .sort((a, b) => new Date(b.grantedAt).getTime() - new Date(a.grantedAt).getTime());
    }

    /**
     * Get access attempts for audit
     */
    getAccessAttempts(
        providerId?: string,
        patientId?: string,
        limit: number = 100
    ): AccessAttempt[] {
        let attempts = this.accessAttempts;

        if (providerId) {
            attempts = attempts.filter(a => a.providerId === providerId);
        }

        if (patientId) {
            attempts = attempts.filter(a => a.patientId === patientId);
        }

        return attempts
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    /**
     * Get provider access statistics
     */
    getProviderStats(providerId: string): ProviderAccessStats {
        const attempts = this.accessAttempts.filter(a => a.providerId === providerId);
        const sessions = this.accessSessions.filter(s => s.providerId === providerId);
        const payments = this.paymentTransactions.filter(t => t.providerId === providerId);

        const successfulAccesses = attempts.filter(a => a.success).length;
        const failedAccesses = attempts.filter(a => !a.success).length;

        // Calculate average session duration
        const completedSessions = sessions.filter(s => s.endedAt);
        const totalDuration = completedSessions.reduce((total, session) => {
            const start = new Date(session.startedAt).getTime();
            const end = new Date(session.endedAt!).getTime();
            return total + (end - start);
        }, 0);
        const averageSessionDuration = completedSessions.length > 0
            ? totalDuration / completedSessions.length / 1000 / 60 // in minutes
            : 0;

        // Calculate most accessed data types
        const dataTypeCount = new Map<string, number>();
        attempts.forEach(attempt => {
            if (attempt.success && attempt.dataAccessed) {
                attempt.dataAccessed.forEach(data => {
                    dataTypeCount.set(data, (dataTypeCount.get(data) || 0) + 1);
                });
            }
        });

        const mostAccessedDataTypes = Array.from(dataTypeCount.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const totalAmountPaid = payments
            .filter(p => p.status === 'confirmed')
            .reduce((total, payment) => total + payment.amount, 0);

        return {
            totalAccesses: attempts.length,
            successfulAccesses,
            failedAccesses,
            totalPayments: payments.length,
            totalAmountPaid,
            averageSessionDuration,
            mostAccessedDataTypes,
            recentActivity: attempts.slice(0, 10)
        };
    }

    /**
     * Revoke access permission
     */
    async revokeAccess(permissionId: string, reason: string): Promise<boolean> {
        const permission = this.accessPermissions.find(p => p.id === permissionId);

        if (!permission) {
            return false;
        }

        // If there's an associated consent request, try to revoke it on blockchain as well
        if (permission.consentRequestId) {
            const consentRequests = this.getConsentRequestsByPermissionId(permission.consentRequestId);
            for (const consent of consentRequests) {
                if (consent.blockchainId !== undefined) {
                    try {
                        await consentContractService.revokeConsentOnBlockchain(consent.blockchainId, reason);
                    } catch (error) {
                        console.error('Failed to revoke consent on blockchain:', error);
                        // Continue with local revocation even if blockchain revocation fails
                    }
                }
            }
        }

        permission.isActive = false;

        // End any active sessions
        const activeSessions = this.accessSessions.filter(s =>
            s.accessPermissionId === permissionId && s.isActive
        );

        activeSessions.forEach(session => {
            session.isActive = false;
            session.endedAt = new Date().toISOString();
        });

        this.persistData();
        return true;
    }
    
    private getConsentRequestsByPermissionId(permissionId: string) {
        // This is a helper method to find associated consent requests
        // In a real implementation, there would be a proper mapping between permissions and consents
        return [];
    }

    // Private helper methods

    private isPaymentRequired(permission: AccessPermission): boolean {
        // Payment required for edit and full access levels
        return ['edit', 'full'].includes(permission.accessLevel);
    }

    private async createPaymentTransaction(
        providerId: string,
        patientId: string,
        accessPermissionId: string
    ): Promise<PaymentTransaction> {
        // Process the actual payment through the blockchain
        const paymentTx = await paymentManagerService.processAccessPayment(
            providerId,
            patientId,
            'medical-record-access' // In a real system, this would be the specific record ID
        );

        const transaction: PaymentTransaction = {
            id: `payment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            providerId,
            patientId,
            accessPermissionId,
            amount: Number(paymentTx.amount),
            currency: 'ETH',
            transactionHash: paymentTx.transactionHash,
            status: paymentTx.status,
            createdAt: new Date().toISOString(),
            confirmedAt: paymentTx.confirmedAt,
            gasUsed: paymentTx.gasUsed,
            gasPrice: paymentTx.gasPrice
        };

        this.paymentTransactions.push(transaction);
        this.persistData();

        return transaction;
    }

    private async verifyPaymentTransaction(transactionHash: string): Promise<PaymentTransaction> {
        // Find the transaction in our local records
        const transaction = this.paymentTransactions.find(t => t.transactionHash === transactionHash);

        if (!transaction) {
            throw new Error('Payment transaction not found in local records');
        }

        try {
            // Verify the transaction on the blockchain
            const verifiedTransaction = await paymentManagerService.verifyPaymentOnBlockchain(
                transactionHash,
                parseInt(transaction.id.replace('payment-', '')) || 1 // Extract payment ID from transaction ID or use default
            );

            if (verifiedTransaction) {
                // Update the local transaction with blockchain-verified data
                transaction.status = verifiedTransaction.status;
                transaction.confirmedAt = verifiedTransaction.confirmedAt;
                transaction.gasUsed = verifiedTransaction.gasUsed;
                transaction.gasPrice = verifiedTransaction.gasPrice;
            } else {
                // If not found on blockchain, mark as failed
                transaction.status = 'failed';
                transaction.failureReason = 'Transaction not confirmed on blockchain';
            }

            this.persistData();
            return transaction;
        } catch (error) {
            console.error('Error verifying payment transaction on blockchain:', error);
            transaction.status = 'failed';
            transaction.failureReason = error instanceof Error ? error.message : 'Verification failed';
            this.persistData();
            throw error;
        }
    }

    private persistData(): void {
        try {
            localStorage.setItem('provider-access-permissions', JSON.stringify(this.accessPermissions));
            localStorage.setItem('provider-access-attempts', JSON.stringify(this.accessAttempts));
            localStorage.setItem('provider-payment-transactions', JSON.stringify(this.paymentTransactions));
            localStorage.setItem('provider-access-sessions', JSON.stringify(this.accessSessions));
        } catch (error) {
            console.warn('Failed to persist provider access data:', error);
        }
    }

    private loadPersistedData(): void {
        try {
            const permissionsData = localStorage.getItem('provider-access-permissions');
            if (permissionsData) {
                this.accessPermissions = JSON.parse(permissionsData);
            }

            const attemptsData = localStorage.getItem('provider-access-attempts');
            if (attemptsData) {
                this.accessAttempts = JSON.parse(attemptsData);
            }

            const transactionsData = localStorage.getItem('provider-payment-transactions');
            if (transactionsData) {
                this.paymentTransactions = JSON.parse(transactionsData);
            }

            const sessionsData = localStorage.getItem('provider-access-sessions');
            if (sessionsData) {
                this.accessSessions = JSON.parse(sessionsData);
            }
        } catch (error) {
            console.warn('Failed to load persisted provider access data:', error);
        }
    }

    constructor() {
        this.loadPersistedData();
    }
}

// Export singleton instance
export const providerAccessService = new ProviderAccessService();