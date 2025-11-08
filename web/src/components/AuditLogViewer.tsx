/**
 * Audit Log Viewer Component
 * Displays comprehensive audit trails and security monitoring for patient data access
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Shield,
    Activity,
    AlertTriangle,
    Download,
    Filter,
    Calendar,
    Clock,
    User,
    FileText,
    Eye,
    Search,
    BarChart3,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    accessLogger,
    AuditLogEntry,
    AuditQuery,
    AuditReport,
    SecurityAlert
} from '@/services/accessLogger';

interface AuditLogViewerProps {
    userId?: string;
    userType?: 'patient' | 'provider';
    showSecurityAlerts?: boolean;
    className?: string;
}

interface ViewerState {
    loading: boolean;
    error: string | null;
    entries: AuditLogEntry[];
    report: AuditReport | null;
    securityAlerts: SecurityAlert[];
    query: AuditQuery;
    activeTab: 'log' | 'report' | 'alerts';
}

const EVENT_TYPE_LABELS: Record<string, string> = {
    'access_granted': 'Access Granted',
    'access_denied': 'Access Denied',
    'file_viewed': 'File Viewed',
    'file_downloaded': 'File Downloaded',
    'file_edited': 'File Edited',
    'consent_requested': 'Consent Requested',
    'consent_granted': 'Consent Granted',
    'consent_denied': 'Consent Denied',
    'consent_revoked': 'Consent Revoked',
    'session_started': 'Session Started',
    'session_ended': 'Session Ended',
    'payment_made': 'Payment Made',
    'emergency_access': 'Emergency Access'
};

const SEVERITY_COLORS = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
};

export default function AuditLogViewer({
    userId,
    userType,
    showSecurityAlerts = true,
    className
}: AuditLogViewerProps) {
    const [viewerState, setViewerState] = useState<ViewerState>({
        loading: false,
        error: null,
        entries: [],
        report: null,
        securityAlerts: [],
        query: {
            limit: 50,
            offset: 0
        },
        activeTab: 'log'
    });

    // Load audit data
    const loadAuditData = useCallback(() => {
        setViewerState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const query = { ...viewerState.query };

            // Apply user-specific filters
            if (userId && userType) {
                if (userType === 'patient') {
                    query.targetId = userId;
                } else {
                    query.actorId = userId;
                }
            }

            const entries = accessLogger.queryAuditLog(query);
            const report = accessLogger.generateAuditReport(query);
            const securityAlerts = showSecurityAlerts ? accessLogger.getSecurityAlerts() : [];

            setViewerState(prev => ({
                ...prev,
                loading: false,
                entries,
                report,
                securityAlerts
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load audit data';
            setViewerState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, [viewerState.query, userId, userType, showSecurityAlerts]);

    // Load data on mount and query changes
    useEffect(() => {
        loadAuditData();
    }, [loadAuditData]);

    // Update query
    const updateQuery = useCallback(<K extends keyof AuditQuery>(
        key: K,
        value: AuditQuery[K]
    ) => {
        setViewerState(prev => ({
            ...prev,
            query: { ...prev.query, [key]: value }
        }));
    }, []);

    // Export audit log
    const handleExport = useCallback((format: 'json' | 'csv' = 'json') => {
        try {
            const exportData = accessLogger.exportAuditLog(viewerState.query, format);
            const blob = new Blob([exportData], {
                type: format === 'json' ? 'application/json' : 'text/csv'
            });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `audit-log-${new Date().toISOString().split('T')[0]}.${format}`;
            link.click();

            URL.revokeObjectURL(url);
        } catch (error) {
            setViewerState(prev => ({
                ...prev,
                error: 'Failed to export audit log'
            }));
        }
    }, [viewerState.query]);

    // Format date
    const formatDate = useCallback((dateString: string): string => {
        try {
            return new Date(dateString).toLocaleString();
        } catch {
            return 'Unknown date';
        }
    }, []);

    // Get event type badge
    const getEventTypeBadge = useCallback((eventType: AuditLogEntry['eventType']) => {
        const label = EVENT_TYPE_LABELS[eventType] || eventType;
        let color = 'bg-gray-100 text-gray-800';

        if (eventType.includes('denied') || eventType.includes('revoked')) {
            color = 'bg-red-100 text-red-800';
        } else if (eventType.includes('granted') || eventType.includes('viewed')) {
            color = 'bg-green-100 text-green-800';
        } else if (eventType.includes('emergency')) {
            color = 'bg-red-100 text-red-800';
        }

        return <Badge className={color}>{label}</Badge>;
    }, []);

    // Get severity badge
    const getSeverityBadge = useCallback((severity: AuditLogEntry['severity']) => {
        return <Badge className={SEVERITY_COLORS[severity]}>{severity.toUpperCase()}</Badge>;
    }, []);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5" />
                        <span>Audit Log & Security Monitoring</span>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <p className="text-sm text-gray-600">
                        Comprehensive audit trail of all data access activities and security events.
                    </p>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                    className={cn(
                        "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
                        viewerState.activeTab === 'log' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    )}
                    onClick={() => setViewerState(prev => ({ ...prev, activeTab: 'log' }))}
                >
                    <Activity className="h-4 w-4 mr-1 inline" />
                    Audit Log ({viewerState.entries.length})
                </button>
                <button
                    className={cn(
                        "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
                        viewerState.activeTab === 'report' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                    )}
                    onClick={() => setViewerState(prev => ({ ...prev, activeTab: 'report' }))}
                >
                    <BarChart3 className="h-4 w-4 mr-1 inline" />
                    Analytics
                </button>
                {showSecurityAlerts && (
                    <button
                        className={cn(
                            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
                            viewerState.activeTab === 'alerts' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                        )}
                        onClick={() => setViewerState(prev => ({ ...prev, activeTab: 'alerts' }))}
                    >
                        <AlertTriangle className="h-4 w-4 mr-1 inline" />
                        Security Alerts ({viewerState.securityAlerts.length})
                    </button>
                )}
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Filter className="h-5 w-5" />
                        <span>Filters</span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Event Type</Label>
                            <Select
                                value={viewerState.query.eventType || ''}
                                onValueChange={(value) => updateQuery('eventType', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Events" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Events</SelectItem>
                                    {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                                        <SelectItem key={value} value={value}>{label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Severity</Label>
                            <Select
                                value={viewerState.query.severity || ''}
                                onValueChange={(value) => updateQuery('severity', value || undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All Severities" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All Severities</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Success Status</Label>
                            <Select
                                value={viewerState.query.success?.toString() || ''}
                                onValueChange={(value) => updateQuery('success', value ? value === 'true' : undefined)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="All" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="">All</SelectItem>
                                    <SelectItem value="true">Success Only</SelectItem>
                                    <SelectItem value="false">Failures Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Limit</Label>
                            <Select
                                value={viewerState.query.limit?.toString() || '50'}
                                onValueChange={(value) => updateQuery('limit', parseInt(value))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                    <SelectItem value="100">100</SelectItem>
                                    <SelectItem value="500">500</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Button variant="outline" onClick={loadAuditData}>
                            <Search className="h-4 w-4 mr-1" />
                            Refresh
                        </Button>

                        <div className="flex items-center space-x-2">
                            <Button variant="outline" onClick={() => handleExport('csv')}>
                                <Download className="h-4 w-4 mr-1" />
                                Export CSV
                            </Button>
                            <Button variant="outline" onClick={() => handleExport('json')}>
                                <Download className="h-4 w-4 mr-1" />
                                Export JSON
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Error Display */}
            {viewerState.error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {viewerState.error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Content based on active tab */}
            {viewerState.activeTab === 'log' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Audit Log Entries</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {viewerState.entries.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No audit entries found</p>
                                <p className="text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {viewerState.entries.map((entry) => (
                                    <div
                                        key={entry.id}
                                        className="p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start space-x-3">
                                                <div className={cn(
                                                    "p-2 rounded-full",
                                                    entry.success ? "bg-green-100" : "bg-red-100"
                                                )}>
                                                    {entry.success ? (
                                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-red-600" />
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        {getEventTypeBadge(entry.eventType)}
                                                        {getSeverityBadge(entry.severity)}
                                                    </div>

                                                    <p className="font-medium">{entry.action}</p>
                                                    <div className="text-sm text-gray-600 space-y-1">
                                                        <p>
                                                            <User className="h-3 w-3 inline mr-1" />
                                                            {entry.actorType}: {entry.actorId}
                                                        </p>
                                                        <p>
                                                            <FileText className="h-3 w-3 inline mr-1" />
                                                            {entry.targetType}: {entry.targetId}
                                                        </p>
                                                        <p>
                                                            <Clock className="h-3 w-3 inline mr-1" />
                                                            {formatDate(entry.timestamp)}
                                                        </p>
                                                        {entry.ipAddress && (
                                                            <p>IP: {entry.ipAddress}</p>
                                                        )}
                                                        {entry.errorMessage && (
                                                            <p className="text-red-600">Error: {entry.errorMessage}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Analytics Tab */}
            {viewerState.activeTab === 'report' && viewerState.report && (
                <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid md:grid-cols-4 gap-4">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <Activity className="h-5 w-5 text-blue-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{viewerState.report.totalEntries}</p>
                                        <p className="text-sm text-gray-600">Total Entries</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <TrendingUp className="h-5 w-5 text-green-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{viewerState.report.summary.successRate.toFixed(1)}%</p>
                                        <p className="text-sm text-gray-600">Success Rate</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{viewerState.report.summary.bySeverity.high || 0}</p>
                                        <p className="text-sm text-gray-600">High Severity</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center space-x-2">
                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                    <div>
                                        <p className="text-2xl font-bold">{viewerState.report.summary.bySeverity.critical || 0}</p>
                                        <p className="text-sm text-gray-600">Critical Events</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Event Type Breakdown */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Event Type Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {Object.entries(viewerState.report.summary.byEventType).map(([eventType, count]) => (
                                    <div key={eventType} className="flex items-center justify-between">
                                        <span className="text-sm">{EVENT_TYPE_LABELS[eventType] || eventType}</span>
                                        <Badge variant="outline">{count}</Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Security Alerts Tab */}
            {viewerState.activeTab === 'alerts' && showSecurityAlerts && (
                <Card>
                    <CardHeader>
                        <CardTitle>Security Alerts</CardTitle>
                    </CardHeader>

                    <CardContent>
                        {viewerState.securityAlerts.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p className="text-lg font-medium">No security alerts</p>
                                <p className="text-sm">All systems operating normally</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {viewerState.securityAlerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className="p-4 border rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <Badge className={SEVERITY_COLORS[alert.severity]}>
                                                        {alert.severity.toUpperCase()}
                                                    </Badge>
                                                    <Badge variant="outline">
                                                        {alert.status.toUpperCase()}
                                                    </Badge>
                                                </div>

                                                <h4 className="font-medium">{alert.description}</h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Actor: {alert.actorId} • {formatDate(alert.timestamp)}
                                                </p>

                                                {alert.resolution && (
                                                    <p className="text-sm text-green-600 mt-2">
                                                        Resolution: {alert.resolution}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}