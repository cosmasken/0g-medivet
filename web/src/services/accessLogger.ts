/**
 * Access Logger Service
 * Comprehensive audit trail and logging system for all data access activities
 */

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    eventType: 'access_granted' | 'access_denied' | 'file_viewed' | 'file_downloaded' | 'file_edited' | 'consent_requested' | 'consent_granted' | 'consent_denied' | 'consent_revoked' | 'session_started' | 'session_ended' | 'payment_made' | 'emergency_access';
    actorId: string;
    actorType: 'patient' | 'provider' | 'system';
    targetId: string;
    targetType: 'patient' | 'file' | 'consent' | 'session';
    action: string;
    details: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    location?: {
        country?: string;
        region?: string;
        city?: string;
    };
    severity: 'low' | 'medium' | 'high' | 'critical';
    success: boolean;
    errorMessage?: string;
    metadata?: {
        fileSize?: number;
        accessLevel?: string;
        dataTypes?: string[];
        duration?: number;
        paymentAmount?: number;
        emergencyJustification?: string;
    };
}

export interface AuditQuery {
    actorId?: string;
    actorType?: 'patient' | 'provider' | 'system';
    targetId?: string;
    targetType?: 'patient' | 'file' | 'consent' | 'session';
    eventType?: AuditLogEntry['eventType'];
    severity?: AuditLogEntry['severity'];
    success?: boolean;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
}

export interface AuditReport {
    totalEntries: number;
    entries: AuditLogEntry[];
    summary: {
        byEventType: Record<string, number>;
        bySeverity: Record<string, number>;
        byActor: Record<string, number>;
        successRate: number;
        timeRange: {
            start: string;
            end: string;
        };
    };
    trends: {
        dailyActivity: Array<{ date: string; count: number }>;
        hourlyActivity: Array<{ hour: number; count: number }>;
        topActors: Array<{ actorId: string; count: number }>;
        topTargets: Array<{ targetId: string; count: number }>;
    };
}

export interface SecurityAlert {
    id: string;
    timestamp: string;
    alertType: 'suspicious_activity' | 'multiple_failures' | 'unusual_access_pattern' | 'emergency_access' | 'data_breach_attempt' | 'unauthorized_access';
    severity: 'low' | 'medium' | 'high' | 'critical';
    actorId: string;
    description: string;
    details: Record<string, any>;
    relatedLogEntries: string[];
    status: 'open' | 'investigating' | 'resolved' | 'false_positive';
    assignedTo?: string;
    resolvedAt?: string;
    resolution?: string;
}

export class AccessLogger {
    private auditLog: AuditLogEntry[] = [];
    private securityAlerts: SecurityAlert[] = [];
    private readonly MAX_LOG_SIZE = 10000;
    private readonly ALERT_THRESHOLDS = {
        FAILED_ATTEMPTS: 5,
        RAPID_ACCESS: 10,
        UNUSUAL_HOURS: { start: 22, end: 6 }, // 10 PM to 6 AM
        LARGE_FILE_SIZE: 100 * 1024 * 1024 // 100MB
    };

    /**
     * Log an access event
     */
    async logEvent(
        eventType: AuditLogEntry['eventType'],
        actorId: string,
        actorType: AuditLogEntry['actorType'],
        targetId: string,
        targetType: AuditLogEntry['targetType'],
        action: string,
        details: Record<string, any> = {},
        success: boolean = true,
        errorMessage?: string
    ): Promise<AuditLogEntry> {
        const entry: AuditLogEntry = {
            id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            eventType,
            actorId,
            actorType,
            targetId,
            targetType,
            action,
            details,
            success,
            errorMessage,
            severity: this.calculateSeverity(eventType, success, details),
            ipAddress: this.getCurrentIPAddress(),
            userAgent: this.getCurrentUserAgent(),
            location: await this.getCurrentLocation(),
            metadata: this.extractMetadata(eventType, details)
        };

        this.auditLog.push(entry);

        // Maintain log size limit
        if (this.auditLog.length > this.MAX_LOG_SIZE) {
            this.auditLog = this.auditLog.slice(-this.MAX_LOG_SIZE);
        }

        // Check for security alerts
        await this.checkSecurityAlerts(entry);

        // Persist the log
        this.persistAuditLog();

        return entry;
    }

    /**
     * Query audit log
     */
    queryAuditLog(query: AuditQuery = {}): AuditLogEntry[] {
        let filteredEntries = this.auditLog;

        // Apply filters
        if (query.actorId) {
            filteredEntries = filteredEntries.filter(entry => entry.actorId === query.actorId);
        }

        if (query.actorType) {
            filteredEntries = filteredEntries.filter(entry => entry.actorType === query.actorType);
        }

        if (query.targetId) {
            filteredEntries = filteredEntries.filter(entry => entry.targetId === query.targetId);
        }

        if (query.targetType) {
            filteredEntries = filteredEntries.filter(entry => entry.targetType === query.targetType);
        }

        if (query.eventType) {
            filteredEntries = filteredEntries.filter(entry => entry.eventType === query.eventType);
        }

        if (query.severity) {
            filteredEntries = filteredEntries.filter(entry => entry.severity === query.severity);
        }

        if (query.success !== undefined) {
            filteredEntries = filteredEntries.filter(entry => entry.success === query.success);
        }

        if (query.startDate) {
            filteredEntries = filteredEntries.filter(entry =>
                new Date(entry.timestamp) >= query.startDate!
            );
        }

        if (query.endDate) {
            filteredEntries = filteredEntries.filter(entry =>
                new Date(entry.timestamp) <= query.endDate!
            );
        }

        // Sort by timestamp (newest first)
        filteredEntries.sort((a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        // Apply pagination
        const offset = query.offset || 0;
        const limit = query.limit || 100;

        return filteredEntries.slice(offset, offset + limit);
    }

    /**
     * Generate audit report
     */
    generateAuditReport(query: AuditQuery = {}): AuditReport {
        const entries = this.queryAuditLog({ ...query, limit: undefined, offset: undefined });

        // Calculate summary statistics
        const byEventType: Record<string, number> = {};
        const bySeverity: Record<string, number> = {};
        const byActor: Record<string, number> = {};
        let successCount = 0;

        entries.forEach(entry => {
            // Event type counts
            byEventType[entry.eventType] = (byEventType[entry.eventType] || 0) + 1;

            // Severity counts
            bySeverity[entry.severity] = (bySeverity[entry.severity] || 0) + 1;

            // Actor counts
            byActor[entry.actorId] = (byActor[entry.actorId] || 0) + 1;

            // Success rate
            if (entry.success) successCount++;
        });

        const successRate = entries.length > 0 ? (successCount / entries.length) * 100 : 0;

        // Calculate trends
        const dailyActivity = this.calculateDailyActivity(entries);
        const hourlyActivity = this.calculateHourlyActivity(entries);
        const topActors = Object.entries(byActor)
            .map(([actorId, count]) => ({ actorId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        const targetCounts: Record<string, number> = {};
        entries.forEach(entry => {
            targetCounts[entry.targetId] = (targetCounts[entry.targetId] || 0) + 1;
        });

        const topTargets = Object.entries(targetCounts)
            .map(([targetId, count]) => ({ targetId, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        // Time range
        const timestamps = entries.map(e => e.timestamp).sort();
        const timeRange = {
            start: timestamps[0] || new Date().toISOString(),
            end: timestamps[timestamps.length - 1] || new Date().toISOString()
        };

        return {
            totalEntries: entries.length,
            entries: entries.slice(0, query.limit || 100),
            summary: {
                byEventType,
                bySeverity,
                byActor,
                successRate,
                timeRange
            },
            trends: {
                dailyActivity,
                hourlyActivity,
                topActors,
                topTargets
            }
        };
    }

    /**
     * Get security alerts
     */
    getSecurityAlerts(
        severity?: SecurityAlert['severity'],
        status?: SecurityAlert['status'],
        limit: number = 50
    ): SecurityAlert[] {
        let alerts = this.securityAlerts;

        if (severity) {
            alerts = alerts.filter(alert => alert.severity === severity);
        }

        if (status) {
            alerts = alerts.filter(alert => alert.status === status);
        }

        return alerts
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, limit);
    }

    /**
     * Update security alert status
     */
    updateSecurityAlert(
        alertId: string,
        status: SecurityAlert['status'],
        assignedTo?: string,
        resolution?: string
    ): boolean {
        const alert = this.securityAlerts.find(a => a.id === alertId);

        if (!alert) {
            return false;
        }

        alert.status = status;
        if (assignedTo) alert.assignedTo = assignedTo;
        if (resolution) alert.resolution = resolution;
        if (status === 'resolved') alert.resolvedAt = new Date().toISOString();

        this.persistSecurityAlerts();
        return true;
    }

    /**
     * Export audit log
     */
    exportAuditLog(
        query: AuditQuery = {},
        format: 'json' | 'csv' = 'json'
    ): string {
        const entries = this.queryAuditLog(query);

        if (format === 'csv') {
            const headers = [
                'Timestamp',
                'Event Type',
                'Actor ID',
                'Actor Type',
                'Target ID',
                'Target Type',
                'Action',
                'Success',
                'Severity',
                'IP Address',
                'Error Message'
            ];

            const csvData = entries.map(entry => [
                entry.timestamp,
                entry.eventType,
                entry.actorId,
                entry.actorType,
                entry.targetId,
                entry.targetType,
                entry.action,
                entry.success.toString(),
                entry.severity,
                entry.ipAddress || '',
                entry.errorMessage || ''
            ]);

            return [headers, ...csvData].map(row => row.join(',')).join('\n');
        }

        return JSON.stringify(entries, null, 2);
    }

    /**
     * Clear old audit logs
     */
    clearOldLogs(olderThanDays: number): number {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const initialCount = this.auditLog.length;
        this.auditLog = this.auditLog.filter(entry =>
            new Date(entry.timestamp) > cutoffDate
        );

        const removedCount = initialCount - this.auditLog.length;

        if (removedCount > 0) {
            this.persistAuditLog();
        }

        return removedCount;
    }

    /**
     * Get audit statistics
     */
    getAuditStats(): {
        totalEntries: number;
        todayEntries: number;
        weekEntries: number;
        monthEntries: number;
        successRate: number;
        criticalAlerts: number;
        openAlerts: number;
    } {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const todayEntries = this.auditLog.filter(entry =>
            new Date(entry.timestamp) >= today
        ).length;

        const weekEntries = this.auditLog.filter(entry =>
            new Date(entry.timestamp) >= weekAgo
        ).length;

        const monthEntries = this.auditLog.filter(entry =>
            new Date(entry.timestamp) >= monthAgo
        ).length;

        const successCount = this.auditLog.filter(entry => entry.success).length;
        const successRate = this.auditLog.length > 0 ? (successCount / this.auditLog.length) * 100 : 0;

        const criticalAlerts = this.securityAlerts.filter(alert =>
            alert.severity === 'critical'
        ).length;

        const openAlerts = this.securityAlerts.filter(alert =>
            alert.status === 'open'
        ).length;

        return {
            totalEntries: this.auditLog.length,
            todayEntries,
            weekEntries,
            monthEntries,
            successRate,
            criticalAlerts,
            openAlerts
        };
    }

    // Private helper methods

    private calculateSeverity(
        eventType: AuditLogEntry['eventType'],
        success: boolean,
        details: Record<string, any>
    ): AuditLogEntry['severity'] {
        // Critical events
        if (eventType === 'emergency_access' || !success) {
            return 'critical';
        }

        // High severity events
        if (['consent_revoked', 'access_denied', 'file_edited'].includes(eventType)) {
            return 'high';
        }

        // Medium severity events
        if (['consent_granted', 'file_downloaded', 'payment_made'].includes(eventType)) {
            return 'medium';
        }

        // Low severity events
        return 'low';
    }

    private extractMetadata(
        eventType: AuditLogEntry['eventType'],
        details: Record<string, any>
    ): AuditLogEntry['metadata'] {
        const metadata: AuditLogEntry['metadata'] = {};

        if (details.fileSize) metadata.fileSize = details.fileSize;
        if (details.accessLevel) metadata.accessLevel = details.accessLevel;
        if (details.dataTypes) metadata.dataTypes = details.dataTypes;
        if (details.duration) metadata.duration = details.duration;
        if (details.paymentAmount) metadata.paymentAmount = details.paymentAmount;
        if (details.emergencyJustification) metadata.emergencyJustification = details.emergencyJustification;

        return Object.keys(metadata).length > 0 ? metadata : undefined;
    }

    private async checkSecurityAlerts(entry: AuditLogEntry): Promise<void> {
        // Check for multiple failed attempts
        if (!entry.success) {
            const recentFailures = this.auditLog.filter(e =>
                e.actorId === entry.actorId &&
                !e.success &&
                new Date(e.timestamp).getTime() > Date.now() - 60 * 60 * 1000 // Last hour
            );

            if (recentFailures.length >= this.ALERT_THRESHOLDS.FAILED_ATTEMPTS) {
                await this.createSecurityAlert(
                    'multiple_failures',
                    'high',
                    entry.actorId,
                    `Multiple failed access attempts (${recentFailures.length}) in the last hour`,
                    { failureCount: recentFailures.length, timeWindow: '1 hour' },
                    recentFailures.map(e => e.id)
                );
            }
        }

        // Check for rapid access pattern
        const recentAccess = this.auditLog.filter(e =>
            e.actorId === entry.actorId &&
            e.eventType === 'file_viewed' &&
            new Date(e.timestamp).getTime() > Date.now() - 10 * 60 * 1000 // Last 10 minutes
        );

        if (recentAccess.length >= this.ALERT_THRESHOLDS.RAPID_ACCESS) {
            await this.createSecurityAlert(
                'unusual_access_pattern',
                'medium',
                entry.actorId,
                `Rapid file access pattern detected (${recentAccess.length} files in 10 minutes)`,
                { accessCount: recentAccess.length, timeWindow: '10 minutes' },
                recentAccess.map(e => e.id)
            );
        }

        // Check for unusual hours access
        const hour = new Date(entry.timestamp).getHours();
        if (hour >= this.ALERT_THRESHOLDS.UNUSUAL_HOURS.start ||
            hour <= this.ALERT_THRESHOLDS.UNUSUAL_HOURS.end) {
            await this.createSecurityAlert(
                'unusual_access_pattern',
                'low',
                entry.actorId,
                `Access during unusual hours (${hour}:00)`,
                { accessHour: hour },
                [entry.id]
            );
        }

        // Check for large file access
        if (entry.metadata?.fileSize && entry.metadata.fileSize > this.ALERT_THRESHOLDS.LARGE_FILE_SIZE) {
            await this.createSecurityAlert(
                'suspicious_activity',
                'medium',
                entry.actorId,
                `Large file access detected (${Math.round(entry.metadata.fileSize / 1024 / 1024)}MB)`,
                { fileSize: entry.metadata.fileSize },
                [entry.id]
            );
        }

        // Check for emergency access
        if (entry.eventType === 'emergency_access') {
            await this.createSecurityAlert(
                'emergency_access',
                'critical',
                entry.actorId,
                'Emergency access override used',
                { justification: entry.metadata?.emergencyJustification },
                [entry.id]
            );
        }
    }

    private async createSecurityAlert(
        alertType: SecurityAlert['alertType'],
        severity: SecurityAlert['severity'],
        actorId: string,
        description: string,
        details: Record<string, any>,
        relatedLogEntries: string[]
    ): Promise<SecurityAlert> {
        const alert: SecurityAlert = {
            id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            alertType,
            severity,
            actorId,
            description,
            details,
            relatedLogEntries,
            status: 'open'
        };

        this.securityAlerts.push(alert);
        this.persistSecurityAlerts();

        return alert;
    }

    private calculateDailyActivity(entries: AuditLogEntry[]): Array<{ date: string; count: number }> {
        const dailyCounts: Record<string, number> = {};

        entries.forEach(entry => {
            const date = entry.timestamp.split('T')[0];
            dailyCounts[date] = (dailyCounts[date] || 0) + 1;
        });

        return Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    private calculateHourlyActivity(entries: AuditLogEntry[]): Array<{ hour: number; count: number }> {
        const hourlyCounts: Record<number, number> = {};

        entries.forEach(entry => {
            const hour = new Date(entry.timestamp).getHours();
            hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        });

        return Array.from({ length: 24 }, (_, hour) => ({
            hour,
            count: hourlyCounts[hour] || 0
        }));
    }

    private getCurrentIPAddress(): string {
        // In a real implementation, this would get the actual IP address
        return '192.168.1.1';
    }

    private getCurrentUserAgent(): string {
        return typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
    }

    private async getCurrentLocation(): Promise<AuditLogEntry['location']> {
        // In a real implementation, this would use IP geolocation
        return {
            country: 'US',
            region: 'CA',
            city: 'San Francisco'
        };
    }

    private persistAuditLog(): void {
        try {
            localStorage.setItem('audit-log', JSON.stringify(this.auditLog));
        } catch (error) {
            console.warn('Failed to persist audit log:', error);
        }
    }

    private persistSecurityAlerts(): void {
        try {
            localStorage.setItem('security-alerts', JSON.stringify(this.securityAlerts));
        } catch (error) {
            console.warn('Failed to persist security alerts:', error);
        }
    }

    private loadPersistedData(): void {
        try {
            const auditLogData = localStorage.getItem('audit-log');
            if (auditLogData) {
                this.auditLog = JSON.parse(auditLogData);
            }

            const alertsData = localStorage.getItem('security-alerts');
            if (alertsData) {
                this.securityAlerts = JSON.parse(alertsData);
            }
        } catch (error) {
            console.warn('Failed to load persisted audit data:', error);
        }
    }

    constructor() {
        this.loadPersistedData();
    }
}

// Export singleton instance
export const accessLogger = new AccessLogger();