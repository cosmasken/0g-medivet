/**
 * Provider Record Access Component
 * Allows providers to access patient records with payment integration and audit logging
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
    FileText,
    Eye,
    Download,
    Edit,
    Share2,
    Clock,
    Shield,
    CreditCard,
    Activity,
    AlertCircle,
    CheckCircle,
    Loader2,
    User,
    Calendar,
    DollarSign,
    Lock,
    Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MedicalFileMetadata } from '@/stores/medicalFilesStore';
import {
    providerAccessService,
    AccessPermission,
    AccessSession,
    PaymentTransaction,
    AccessAttempt
} from '@/services/providerAccessService';
import { PatientProfile } from '@/services/patientSearchService';

interface ProviderRecordAccessProps {
    providerId: string;
    patient: PatientProfile;
    onFileAccess?: (file: MedicalFileMetadata) => void;
    onPaymentRequired?: (transaction: PaymentTransaction) => void;
    className?: string;
}

interface AccessState {
    loading: boolean;
    error: string | null;
    permission: AccessPermission | null;
    session: AccessSession | null;
    paymentRequired: boolean;
    paymentTransaction: PaymentTransaction | null;
    files: MedicalFileMetadata[];
    recentActivity: AccessAttempt[];
}

const ACCESS_LEVEL_INFO = {
    view: {
        label: 'View Only',
        icon: '👁️',
        description: 'Can view selected data',
        color: 'bg-blue-100 text-blue-800'
    },
    edit: {
        label: 'View & Edit',
        icon: '✏️',
        description: 'Can view and modify selected data',
        color: 'bg-green-100 text-green-800'
    },
    full: {
        label: 'Full Access',
        icon: '🔓',
        description: 'Complete access including sharing',
        color: 'bg-purple-100 text-purple-800'
    }
};

const DATA_TYPE_LABELS: Record<string, string> = {
    'demographics': 'Demographics',
    'medical-history': 'Medical History',
    'medications': 'Medications',
    'allergies': 'Allergies',
    'lab-results': 'Lab Results',
    'imaging': 'Medical Imaging',
    'vital-signs': 'Vital Signs',
    'visit-notes': 'Visit Notes'
};

export default function ProviderRecordAccess({
    providerId,
    patient,
    onFileAccess,
    onPaymentRequired,
    className
}: ProviderRecordAccessProps) {
    const [accessState, setAccessState] = useState<AccessState>({
        loading: false,
        error: null,
        permission: null,
        session: null,
        paymentRequired: false,
        paymentTransaction: null,
        files: [],
        recentActivity: []
    });

    // Check access permissions on mount
    useEffect(() => {
        checkAccessPermissions();
    }, [providerId, patient.id]);

    // Check access permissions
    const checkAccessPermissions = useCallback(async () => {
        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const accessCheck = providerAccessService.checkAccess(providerId, patient.id);

            if (accessCheck.hasAccess && accessCheck.permission) {
                setAccessState(prev => ({
                    ...prev,
                    loading: false,
                    permission: accessCheck.permission!,
                    files: generateMockFiles(accessCheck.permission!.allowedDataTypes)
                }));
            } else {
                setAccessState(prev => ({
                    ...prev,
                    loading: false,
                    error: accessCheck.reason || 'Access denied'
                }));
            }

            // Load recent activity
            const recentActivity = providerAccessService.getAccessAttempts(providerId, patient.id, 10);
            setAccessState(prev => ({ ...prev, recentActivity }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to check access permissions';
            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, [providerId, patient.id]);

    // Start access session
    const startAccessSession = useCallback(async () => {
        if (!accessState.permission) return;

        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await providerAccessService.startAccessSession(
                providerId,
                patient.id
            );

            if (result.paymentRequired && result.paymentTransaction) {
                setAccessState(prev => ({
                    ...prev,
                    loading: false,
                    paymentRequired: true,
                    paymentTransaction: result.paymentTransaction!
                }));

                onPaymentRequired?.(result.paymentTransaction);
            } else {
                setAccessState(prev => ({
                    ...prev,
                    loading: false,
                    session: result.session
                }));
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to start access session';
            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, [providerId, patient.id, accessState.permission, onPaymentRequired]);

    // Access file
    const handleFileAccess = useCallback(async (
        file: MedicalFileMetadata,
        accessType: 'view' | 'download' | 'edit' = 'view'
    ) => {
        if (!accessState.session) {
            setAccessState(prev => ({ ...prev, error: 'No active session. Please start a session first.' }));
            return;
        }

        setAccessState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const result = await providerAccessService.accessFile(
                accessState.session.id,
                file.id,
                accessType
            );

            if (result.success && result.file) {
                onFileAccess?.(result.file);

                // Refresh recent activity
                const recentActivity = providerAccessService.getAccessAttempts(providerId, patient.id, 10);
                setAccessState(prev => ({
                    ...prev,
                    loading: false,
                    recentActivity
                }));
            } else {
                setAccessState(prev => ({
                    ...prev,
                    loading: false,
                    error: result.error || 'Failed to access file'
                }));
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'File access failed';
            setAccessState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, [accessState.session, providerId, patient.id, onFileAccess]);

    // End access session
    const endAccessSession = useCallback(async () => {
        if (!accessState.session) return;

        const success = await providerAccessService.endAccessSession(accessState.session.id);

        if (success) {
            setAccessState(prev => ({
                ...prev,
                session: null
            }));
        }
    }, [accessState.session]);

    // Format date
    const formatDate = useCallback((dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Unknown date';
        }
    }, []);

    // Format time remaining
    const getTimeRemaining = useCallback((expiresAt: string): string => {
        const now = new Date();
        const expiry = new Date(expiresAt);
        const diffMs = expiry.getTime() - now.getTime();

        if (diffMs <= 0) {
            return 'Expired';
        }

        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        if (days > 0) {
            return `${days}d ${hours}h remaining`;
        } else {
            return `${hours}h remaining`;
        }
    }, []);

    // Generate mock files based on allowed data types
    const generateMockFiles = useCallback((allowedDataTypes: string[]): MedicalFileMetadata[] => {
        return allowedDataTypes.map((dataType, index) => ({
            id: `file-${dataType}-${index}`,
            name: `${DATA_TYPE_LABELS[dataType] || dataType} - ${formatDate(new Date().toISOString())}`,
            type: 'application/pdf',
            size: Math.floor(Math.random() * 5000000) + 100000, // 100KB - 5MB
            category: dataType,
            description: `Patient ${DATA_TYPE_LABELS[dataType] || dataType} record`,
            uploadDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            walletAddress: patient.walletAddress,
            txHash: '0x' + Math.random().toString(16).substr(2, 64),
            rootHash: '0x' + Math.random().toString(16).substr(2, 64),
            isTextRecord: false,
            shared: true,
            sharedWith: [providerId]
        }));
    }, [patient.walletAddress, providerId, formatDate]);

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Get patient display name
    const patientName = patient.firstName && patient.lastName
        ? `${patient.firstName} ${patient.lastName}`
        : patient.username || 'Unknown Patient';

    return (
        <div className={cn("space-y-6", className)}>
            {/* Patient Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                                <AvatarImage src={patient.profilePicture} alt={patientName} />
                                <AvatarFallback className="text-lg">
                                    {patient.firstName?.[0]}{patient.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>

                            <div>
                                <h2 className="text-xl font-semibold">{patientName}</h2>
                                <p className="text-sm text-gray-600 font-mono">{patient.walletAddress}</p>
                                {patient.email && (
                                    <p className="text-sm text-gray-600">{patient.email}</p>
                                )}
                                {patient.dateOfBirth && (
                                    <p className="text-sm text-gray-600">
                                        DOB: {formatDate(patient.dateOfBirth)}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified Patient
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Access Permission Status */}
            {accessState.permission && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="h-5 w-5" />
                            <span>Access Permission</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-3 gap-4">
                            <div>
                                <h4 className="font-medium text-sm mb-2">Access Level</h4>
                                <Badge className={ACCESS_LEVEL_INFO[accessState.permission.accessLevel].color}>
                                    <span className="mr-1">{ACCESS_LEVEL_INFO[accessState.permission.accessLevel].icon}</span>
                                    {ACCESS_LEVEL_INFO[accessState.permission.accessLevel].label}
                                </Badge>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm mb-2">Expires</h4>
                                <p className="text-sm">{getTimeRemaining(accessState.permission.expiresAt)}</p>
                            </div>

                            <div>
                                <h4 className="font-medium text-sm mb-2">Access Count</h4>
                                <p className="text-sm">{accessState.permission.accessCount} times</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-sm mb-2">
                                Allowed Data Types ({accessState.permission.allowedDataTypes.length})
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {accessState.permission.allowedDataTypes.map(typeId => (
                                    <Badge key={typeId} variant="outline" className="text-xs">
                                        {DATA_TYPE_LABELS[typeId] || typeId}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Session Status */}
                        <Separator />

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-sm">Session Status</h4>
                                <p className="text-sm text-gray-600">
                                    {accessState.session ? (
                                        <>
                                            <span className="text-green-600">Active</span> - Started {formatDate(accessState.session.startedAt)}
                                        </>
                                    ) : (
                                        'No active session'
                                    )}
                                </p>
                            </div>

                            <div className="flex items-center space-x-2">
                                {!accessState.session ? (
                                    <Button
                                        onClick={startAccessSession}
                                        disabled={accessState.loading}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        {accessState.loading ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Unlock className="h-4 w-4 mr-2" />
                                        )}
                                        Start Session
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outline"
                                        onClick={endAccessSession}
                                    >
                                        <Lock className="h-4 w-4 mr-2" />
                                        End Session
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment Required */}
            {accessState.paymentRequired && accessState.paymentTransaction && (
                <Alert className="border-yellow-200 bg-yellow-50">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-yellow-800">
                        <div className="flex items-center justify-between">
                            <div>
                                <strong>Payment Required</strong> - Access fee: {accessState.paymentTransaction.amount / 1e18} ETH
                            </div>
                            <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Pay Now
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Error Display */}
            {accessState.error && (
                <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                        {accessState.error}
                    </AlertDescription>
                </Alert>
            )}

            {/* Patient Files */}
            {accessState.session && accessState.files.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span>Patient Records ({accessState.files.length})</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-3">
                            {accessState.files.map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <FileText className="h-5 w-5 text-blue-600" />
                                        </div>

                                        <div>
                                            <h4 className="font-medium">{file.name}</h4>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>{formatFileSize(file.size)}</span>
                                                <span>•</span>
                                                <span>{formatDate(file.uploadDate)}</span>
                                                <span>•</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {DATA_TYPE_LABELS[file.category || ''] || file.category}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleFileAccess(file, 'view')}
                                            disabled={accessState.loading}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View
                                        </Button>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleFileAccess(file, 'download')}
                                            disabled={accessState.loading}
                                        >
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </Button>

                                        {accessState.permission?.accessLevel !== 'view' && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleFileAccess(file, 'edit')}
                                                disabled={accessState.loading}
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Recent Activity */}
            {accessState.recentActivity.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Activity className="h-5 w-5" />
                            <span>Recent Activity</span>
                        </CardTitle>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-3">
                            {accessState.recentActivity.map((attempt) => (
                                <div
                                    key={attempt.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className={cn(
                                            "p-1 rounded-full",
                                            attempt.success ? "bg-green-100" : "bg-red-100"
                                        )}>
                                            {attempt.success ? (
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>

                                        <div>
                                            <p className="font-medium text-sm">
                                                {attempt.accessType.charAt(0).toUpperCase() + attempt.accessType.slice(1)} access
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {formatDate(attempt.timestamp)}
                                                {attempt.failureReason && (
                                                    <span className="text-red-600 ml-2">• {attempt.failureReason}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <Badge
                                        className={attempt.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                                    >
                                        {attempt.success ? 'Success' : 'Failed'}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* No Access */}
            {!accessState.permission && !accessState.loading && (
                <div className="text-center py-8 text-gray-500">
                    <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">No Access Permission</p>
                    <p className="text-sm">
                        You don't have permission to access this patient's records.
                        Please request consent from the patient first.
                    </p>
                </div>
            )}
        </div>
    );
}