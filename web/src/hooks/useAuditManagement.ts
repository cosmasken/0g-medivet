/**
 * Audit Management Hook
 * Manages audit logging, security monitoring, and compliance reporting
 */

import { useState, useCallback, useEffect } from 'react';
import {
    accessLogger,
    AuditLogEntry,
    AuditQuery,
    AuditReport,
    SecurityAlert
} from '@/services/accessLogger';

interface AuditState {
    loading: boolean;
    error: string | null;
    entries: AuditLogEntry[];
    report: AuditReport | null;
    securityAlerts: SecurityAlert[];
    stats: {
        totalEntries: number;
        todayEntries: number;
        weekEntries: number;
        monthEntries: number;
        successRate: number;
        criticalAlerts: number;
        openAlerts: number;
    } | null;
}

interface UseAuditManagementReturn {
    auditState: AuditState;
    logEvent: (
        eventType: AuditLogEntry['eventType'],
        actorId: string,
        actorType: AuditLogEntry['actorType'],
        targetId: string,
        targetType: AuditLogEntry['targetType'],
        action: string,
        details?: Record<string, any>,
        success?: boolean,
        errorMessage?: string
    ) => Promise<AuditLogEntry>;
    queryAuditLog: (query: AuditQuery) => void;
    generateReport: (query?: AuditQuery) => void;
    loadSecurityAlerts: (severity?: SecurityAlert['severity'], status?: SecurityAlert['status']) => void;
    updateSecurityAlert: (
        alertId: string,
        status: SecurityAlert['status'],
        assignedTo?: string,
        resolution?: string
    ) => boolean;
    exportAuditLog: (query?: AuditQuery, format?: 'json' | 'csv') => string;
    clearOldLogs: (olderThanDays: number) => number;
    loadStats: () => void;
    clearError: () => void;
}

export function useAuditManagement(): UseAuditManagementReturn {
    const [auditState, setAuditState] = useState<AuditState>({
        loading: false,
        error: null,
        entries: [],
        report: null,
        securityAlerts: [],
        stats: null
    });

    // Log an audit event
    const logEvent = useCallback(async (
        eventType: AuditLogEntry['eventType'],
        actorId: string,
        actorType: AuditLogEntry['actorType'],
        targetId: string,
        targetType: AuditLogEntry['targetType'],
        action: string,
        details: Record<string, any> = {},
        success: boolean = true,
        errorMessage?: string
    ): Promise<AuditLogEntry> => {
        try {
            const entry = await accessLogger.logEvent(
                eventType,
                actorId,
                actorType,
                targetId,
                targetType,
                action,
                details,
                success,
                errorMessage
            );

            // Refresh current entries if they match the new entry
            setAuditState(prev => ({
                ...prev,
                entries: [entry, ...prev.entries.slice(0, 49)] // Keep recent entries
            }));

            return entry;

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Failed to log audit event';

            setAuditState(prev => ({
                ...prev,
                error: errorMsg
            }));

            throw error;
        }
    }, []);

    // Query audit log
    const queryAuditLog = useCallback((query: AuditQuery) => {
        setAuditState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const entries = accessLogger.queryAuditLog(query);

            setAuditState(prev => ({
                ...prev,
                loading: false,
                entries
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to query audit log';

            setAuditState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Generate audit report
    const generateReport = useCallback((query: AuditQuery = {}) => {
        setAuditState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const report = accessLogger.generateAuditReport(query);

            setAuditState(prev => ({
                ...prev,
                loading: false,
                report
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate audit report';

            setAuditState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Load security alerts
    const loadSecurityAlerts = useCallback((
        severity?: SecurityAlert['severity'],
        status?: SecurityAlert['status']
    ) => {
        try {
            const securityAlerts = accessLogger.getSecurityAlerts(severity, status);

            setAuditState(prev => ({
                ...prev,
                securityAlerts
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load security alerts';

            setAuditState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Update security alert
    const updateSecurityAlert = useCallback((
        alertId: string,
        status: SecurityAlert['status'],
        assignedTo?: string,
        resolution?: string
    ): boolean => {
        try {
            const success = accessLogger.updateSecurityAlert(alertId, status, assignedTo, resolution);

            if (success) {
                // Refresh security alerts
                loadSecurityAlerts();
            }

            return success;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update security alert';

            setAuditState(prev => ({
                ...prev,
                error: errorMessage
            }));

            return false;
        }
    }, [loadSecurityAlerts]);

    // Export audit log
    const exportAuditLog = useCallback((
        query: AuditQuery = {},
        format: 'json' | 'csv' = 'json'
    ): string => {
        try {
            return accessLogger.exportAuditLog(query, format);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to export audit log';

            setAuditState(prev => ({
                ...prev,
                error: errorMessage
            }));

            return '';
        }
    }, []);

    // Clear old logs
    const clearOldLogs = useCallback((olderThanDays: number): number => {
        try {
            const removedCount = accessLogger.clearOldLogs(olderThanDays);

            // Refresh current entries
            queryAuditLog({ limit: 50 });

            return removedCount;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to clear old logs';

            setAuditState(prev => ({
                ...prev,
                error: errorMessage
            }));

            return 0;
        }
    }, [queryAuditLog]);

    // Load statistics
    const loadStats = useCallback(() => {
        try {
            const stats = accessLogger.getAuditStats();

            setAuditState(prev => ({
                ...prev,
                stats
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load audit statistics';

            setAuditState(prev => ({
                ...prev,
                error: errorMessage
            }));
        }
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setAuditState(prev => ({ ...prev, error: null }));
    }, []);

    // Load initial data
    useEffect(() => {
        queryAuditLog({ limit: 50 });
        loadSecurityAlerts();
        loadStats();
    }, [queryAuditLog, loadSecurityAlerts, loadStats]);

    return {
        auditState,
        logEvent,
        queryAuditLog,
        generateReport,
        loadSecurityAlerts,
        updateSecurityAlert,
        exportAuditLog,
        clearOldLogs,
        loadStats,
        clearError
    };
}

/**
 * Hook for automated audit logging
 */
interface UseAutoAuditReturn {
    logFileAccess: (
        providerId: string,
        patientId: string,
        fileId: string,
        accessType: 'view' | 'download' | 'edit',
        success: boolean,
        errorMessage?: string
    ) => Promise<void>;
    logConsentAction: (
        actorId: string,
        actorType: 'patient' | 'provider',
        consentId: string,
        action: 'requested' | 'granted' | 'denied' | 'revoked',
        details?: Record<string, any>
    ) => Promise<void>;
    logSessionActivity: (
        providerId: string,
        patientId: string,
        sessionId: string,
        action: 'started' | 'ended',
        details?: Record<string, any>
    ) => Promise<void>;
    logPaymentActivity: (
        providerId: string,
        patientId: string,
        amount: number,
        transactionHash?: string,
        success?: boolean
    ) => Promise<void>;
    logEmergencyAccess: (
        providerId: string,
        patientId: string,
        justification: string,
        dataTypes: string[],
        duration: number
    ) => Promise<void>;
}

export function useAutoAudit(): UseAutoAuditReturn {
    const { logEvent } = useAuditManagement();

    const logFileAccess = useCallback(async (
        providerId: string,
        patientId: string,
        fileId: string,
        accessType: 'view' | 'download' | 'edit',
        success: boolean,
        errorMessage?: string
    ) => {
        const eventType = accessType === 'view' ? 'file_viewed' :
            accessType === 'download' ? 'file_downloaded' : 'file_edited';

        await logEvent(
            eventType,
            providerId,
            'provider',
            fileId,
            'file',
            `${accessType.charAt(0).toUpperCase() + accessType.slice(1)} file`,
            { patientId, accessType },
            success,
            errorMessage
        );
    }, [logEvent]);

    const logConsentAction = useCallback(async (
        actorId: string,
        actorType: 'patient' | 'provider',
        consentId: string,
        action: 'requested' | 'granted' | 'denied' | 'revoked',
        details: Record<string, any> = {}
    ) => {
        const eventType = `consent_${action}` as AuditLogEntry['eventType'];

        await logEvent(
            eventType,
            actorId,
            actorType,
            consentId,
            'consent',
            `Consent ${action}`,
            details,
            true
        );
    }, [logEvent]);

    const logSessionActivity = useCallback(async (
        providerId: string,
        patientId: string,
        sessionId: string,
        action: 'started' | 'ended',
        details: Record<string, any> = {}
    ) => {
        const eventType = `session_${action}` as AuditLogEntry['eventType'];

        await logEvent(
            eventType,
            providerId,
            'provider',
            sessionId,
            'session',
            `Session ${action}`,
            { patientId, ...details },
            true
        );
    }, [logEvent]);

    const logPaymentActivity = useCallback(async (
        providerId: string,
        patientId: string,
        amount: number,
        transactionHash?: string,
        success: boolean = true
    ) => {
        await logEvent(
            'payment_made',
            providerId,
            'provider',
            patientId,
            'patient',
            'Payment made for record access',
            { amount, transactionHash },
            success
        );
    }, [logEvent]);

    const logEmergencyAccess = useCallback(async (
        providerId: string,
        patientId: string,
        justification: string,
        dataTypes: string[],
        duration: number
    ) => {
        await logEvent(
            'emergency_access',
            providerId,
            'provider',
            patientId,
            'patient',
            'Emergency access override used',
            {
                emergencyJustification: justification,
                dataTypes,
                duration
            },
            true
        );
    }, [logEvent]);

    return {
        logFileAccess,
        logConsentAction,
        logSessionActivity,
        logPaymentActivity,
        logEmergencyAccess
    };
}

/**
 * Hook for compliance and reporting
 */
interface UseComplianceReportingReturn {
    generateComplianceReport: (
        startDate: Date,
        endDate: Date,
        reportType: 'hipaa' | 'gdpr' | 'general'
    ) => {
        report: AuditReport;
        complianceScore: number;
        violations: Array<{
            type: string;
            description: string;
            severity: 'low' | 'medium' | 'high' | 'critical';
            count: number;
        }>;
    };
    checkComplianceViolations: () => Array<{
        type: string;
        description: string;
        severity: 'low' | 'medium' | 'high' | 'critical';
        entries: AuditLogEntry[];
    }>;
    generateDataAccessReport: (patientId: string, startDate?: Date, endDate?: Date) => {
        totalAccesses: number;
        uniqueProviders: number;
        dataTypesAccessed: string[];
        timeline: Array<{ date: string; accesses: number }>;
        providers: Array<{ providerId: string; accessCount: number; lastAccess: string }>;
    };
}

export function useComplianceReporting(): UseComplianceReportingReturn {
    const generateComplianceReport = useCallback((
        startDate: Date,
        endDate: Date,
        reportType: 'hipaa' | 'gdpr' | 'general'
    ) => {
        const query: AuditQuery = {
            startDate,
            endDate
        };

        const report = accessLogger.generateAuditReport(query);

        // Calculate compliance score based on success rate and security incidents
        const baseScore = report.summary.successRate;
        const securityAlerts = accessLogger.getSecurityAlerts('critical');
        const criticalIncidents = securityAlerts.filter(alert =>
            new Date(alert.timestamp) >= startDate && new Date(alert.timestamp) <= endDate
        ).length;

        const complianceScore = Math.max(0, baseScore - (criticalIncidents * 10));

        // Identify potential violations
        const violations = [];

        if (report.summary.successRate < 95) {
            violations.push({
                type: 'access_failures',
                description: 'High rate of access failures detected',
                severity: 'medium' as const,
                count: report.totalEntries - Math.floor(report.totalEntries * report.summary.successRate / 100)
            });
        }

        if (criticalIncidents > 0) {
            violations.push({
                type: 'security_incidents',
                description: 'Critical security incidents detected',
                severity: 'critical' as const,
                count: criticalIncidents
            });
        }

        return {
            report,
            complianceScore,
            violations
        };
    }, []);

    const checkComplianceViolations = useCallback(() => {
        const violations = [];
        const recentEntries = accessLogger.queryAuditLog({
            limit: 1000,
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
        });

        // Check for excessive failed access attempts
        const failedEntries = recentEntries.filter(entry => !entry.success);
        if (failedEntries.length > 50) {
            violations.push({
                type: 'excessive_failures',
                description: 'Excessive failed access attempts detected',
                severity: 'high' as const,
                entries: failedEntries
            });
        }

        // Check for unusual access patterns
        const emergencyAccess = recentEntries.filter(entry => entry.eventType === 'emergency_access');
        if (emergencyAccess.length > 5) {
            violations.push({
                type: 'frequent_emergency_access',
                description: 'Frequent emergency access overrides detected',
                severity: 'critical' as const,
                entries: emergencyAccess
            });
        }

        return violations;
    }, []);

    const generateDataAccessReport = useCallback((
        patientId: string,
        startDate?: Date,
        endDate?: Date
    ) => {
        const query: AuditQuery = {
            targetId: patientId,
            startDate,
            endDate
        };

        const entries = accessLogger.queryAuditLog(query);
        const accessEntries = entries.filter(entry =>
            ['file_viewed', 'file_downloaded', 'file_edited'].includes(entry.eventType)
        );

        const uniqueProviders = new Set(accessEntries.map(entry => entry.actorId)).size;
        const dataTypesAccessed = [...new Set(
            accessEntries.flatMap(entry => entry.metadata?.dataTypes || [])
        )];

        // Generate timeline
        const timelineCounts: Record<string, number> = {};
        accessEntries.forEach(entry => {
            const date = entry.timestamp.split('T')[0];
            timelineCounts[date] = (timelineCounts[date] || 0) + 1;
        });

        const timeline = Object.entries(timelineCounts)
            .map(([date, accesses]) => ({ date, accesses }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // Provider access summary
        const providerCounts: Record<string, { count: number; lastAccess: string }> = {};
        accessEntries.forEach(entry => {
            if (!providerCounts[entry.actorId]) {
                providerCounts[entry.actorId] = { count: 0, lastAccess: entry.timestamp };
            }
            providerCounts[entry.actorId].count++;
            if (entry.timestamp > providerCounts[entry.actorId].lastAccess) {
                providerCounts[entry.actorId].lastAccess = entry.timestamp;
            }
        });

        const providers = Object.entries(providerCounts)
            .map(([providerId, data]) => ({
                providerId,
                accessCount: data.count,
                lastAccess: data.lastAccess
            }))
            .sort((a, b) => b.accessCount - a.accessCount);

        return {
            totalAccesses: accessEntries.length,
            uniqueProviders,
            dataTypesAccessed,
            timeline,
            providers
        };
    }, []);

    return {
        generateComplianceReport,
        checkComplianceViolations,
        generateDataAccessReport
    };
}