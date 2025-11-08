/**
 * Consent Request Component
 * Allows providers to create consent requests for patient data access
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    UserCheck,
    Clock,
    Shield,
    AlertTriangle,
    FileText,
    Heart,
    Activity,
    Pill,
    TestTube,
    Stethoscope,
    Calendar,
    Phone,
    AlertCircle,
    CheckCircle,
    Send,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatientProfile } from '@/services/patientSearchService';
import {
    consentService,
    CreateConsentRequestData,
    ConsentRequest
} from '@/services/consentService';

interface ConsentRequestProps {
    patient: PatientProfile;
    providerId: string;
    providerData: {
        name: string;
        specialty?: string;
        walletAddress: string;
    };
    onRequestCreated?: (request: ConsentRequest) => void;
    onCancel?: () => void;
    className?: string;
}

interface RequestFormData {
    accessLevel: 'view' | 'edit' | 'full';
    dataTypes: string[];
    purpose: string;
    urgency: 'standard' | 'urgent' | 'emergency';
    duration: number;
    emergencyContact?: string;
    medicalJustification?: string;
    expectedTreatmentDuration?: number;
    followUpRequired: boolean;
}

const DATA_TYPES = [
    { id: 'demographics', label: 'Demographics', icon: UserCheck, description: 'Basic patient information' },
    { id: 'medical-history', label: 'Medical History', icon: FileText, description: 'Past medical conditions and treatments' },
    { id: 'medications', label: 'Medications', icon: Pill, description: 'Current and past medications' },
    { id: 'allergies', label: 'Allergies', icon: AlertTriangle, description: 'Known allergies and reactions' },
    { id: 'lab-results', label: 'Lab Results', icon: TestTube, description: 'Laboratory test results' },
    { id: 'imaging', label: 'Medical Imaging', icon: Activity, description: 'X-rays, MRIs, CT scans' },
    { id: 'vital-signs', label: 'Vital Signs', icon: Heart, description: 'Blood pressure, heart rate, etc.' },
    { id: 'visit-notes', label: 'Visit Notes', icon: Stethoscope, description: 'Doctor visit notes and observations' }
];

const ACCESS_LEVELS = [
    {
        value: 'view' as const,
        label: 'View Only',
        description: 'Read access to selected data types',
        icon: '👁️'
    },
    {
        value: 'edit' as const,
        label: 'View & Edit',
        description: 'Read and modify selected data types',
        icon: '✏️'
    },
    {
        value: 'full' as const,
        label: 'Full Access',
        description: 'Complete access including sharing capabilities',
        icon: '🔓'
    }
];

const URGENCY_LEVELS = [
    {
        value: 'standard' as const,
        label: 'Standard',
        description: 'Normal processing time (up to 7 days)',
        color: 'bg-blue-100 text-blue-800',
        responseTime: '7 days'
    },
    {
        value: 'urgent' as const,
        label: 'Urgent',
        description: 'Expedited processing (within 24 hours)',
        color: 'bg-yellow-100 text-yellow-800',
        responseTime: '24 hours'
    },
    {
        value: 'emergency' as const,
        label: 'Emergency',
        description: 'Immediate processing required',
        color: 'bg-red-100 text-red-800',
        responseTime: '2 hours'
    }
];

export default function ConsentRequest({
    patient,
    providerId,
    providerData,
    onRequestCreated,
    onCancel,
    className
}: ConsentRequestProps) {
    const [formData, setFormData] = useState<RequestFormData>({
        accessLevel: 'view',
        dataTypes: [],
        purpose: '',
        urgency: 'standard',
        duration: 30,
        followUpRequired: false
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);

    // Update form data
    const updateFormData = useCallback(<K extends keyof RequestFormData>(
        key: K,
        value: RequestFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setError(null);
    }, []);

    // Handle data type selection
    const handleDataTypeToggle = useCallback((dataTypeId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            dataTypes: checked
                ? [...prev.dataTypes, dataTypeId]
                : prev.dataTypes.filter(id => id !== dataTypeId)
        }));
    }, []);

    // Validate form
    const validateForm = useCallback((): string | null => {
        if (formData.dataTypes.length === 0) {
            return 'Please select at least one data type';
        }

        if (!formData.purpose.trim() || formData.purpose.trim().length < 10) {
            return 'Purpose must be at least 10 characters long';
        }

        if (formData.duration < 1 || formData.duration > 365) {
            return 'Duration must be between 1 and 365 days';
        }

        if (formData.urgency === 'emergency' && !formData.medicalJustification?.trim()) {
            return 'Emergency requests require medical justification';
        }

        if (formData.urgency === 'emergency' && !formData.emergencyContact?.trim()) {
            return 'Emergency requests require emergency contact information';
        }

        return null;
    }, [formData]);

    // Submit consent request
    const handleSubmit = useCallback(async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const requestData: CreateConsentRequestData = {
                patientWalletAddress: patient.walletAddress,
                requestedAccessLevel: formData.accessLevel,
                requestedDataTypes: formData.dataTypes,
                purpose: formData.purpose.trim(),
                urgency: formData.urgency,
                duration: formData.duration,
                metadata: {
                    emergencyContact: formData.emergencyContact?.trim(),
                    medicalJustification: formData.medicalJustification?.trim(),
                    expectedTreatmentDuration: formData.expectedTreatmentDuration,
                    followUpRequired: formData.followUpRequired
                }
            };

            const request = await consentService.createConsentRequest(
                providerId,
                providerData,
                requestData
            );

            onRequestCreated?.(request);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create consent request';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, patient, providerId, providerData, validateForm, onRequestCreated]);

    // Get selected urgency level
    const selectedUrgency = URGENCY_LEVELS.find(level => level.value === formData.urgency);

    // Format patient name
    const patientName = patient.firstName && patient.lastName
        ? `${patient.firstName} ${patient.lastName}`
        : patient.username || 'Unknown Patient';

    return (
        <div className={cn("space-y-6", className)}>
            {/* Header */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5" />
                        <span>Request Patient Consent</span>
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    <div className="flex items-center space-x-4">
                        <div className="flex-1">
                            <h3 className="font-semibold">{patientName}</h3>
                            <p className="text-sm text-gray-600 font-mono">
                                {patient.walletAddress}
                            </p>
                            {patient.email && (
                                <p className="text-sm text-gray-600">{patient.email}</p>
                            )}
                        </div>

                        <div className="text-right">
                            <Badge className="bg-green-100 text-green-800">
                                <Shield className="h-3 w-3 mr-1" />
                                Verified Patient
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            step >= stepNumber
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>
                            {stepNumber}
                        </div>
                        {stepNumber < 3 && (
                            <div className={cn(
                                "w-16 h-0.5 mx-2",
                                step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle>
                        {step === 1 && 'Select Access Level & Data Types'}
                        {step === 2 && 'Request Details'}
                        {step === 3 && 'Review & Submit'}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: Access Level & Data Types */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Access Level Selection */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Access Level</Label>
                                <div className="grid gap-3">
                                    {ACCESS_LEVELS.map((level) => (
                                        <div
                                            key={level.value}
                                            className={cn(
                                                "p-4 border rounded-lg cursor-pointer transition-colors",
                                                formData.accessLevel === level.value
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            )}
                                            onClick={() => updateFormData('accessLevel', level.value)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="text-2xl">{level.icon}</div>
                                                <div className="flex-1">
                                                    <h4 className="font-medium">{level.label}</h4>
                                                    <p className="text-sm text-gray-600">{level.description}</p>
                                                </div>
                                                <div className={cn(
                                                    "w-4 h-4 rounded-full border-2",
                                                    formData.accessLevel === level.value
                                                        ? "border-blue-500 bg-blue-500"
                                                        : "border-gray-300"
                                                )}>
                                                    {formData.accessLevel === level.value && (
                                                        <div className="w-full h-full rounded-full bg-white scale-50" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            {/* Data Types Selection */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">
                                    Data Types ({formData.dataTypes.length} selected)
                                </Label>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {DATA_TYPES.map((dataType) => {
                                        const Icon = dataType.icon;
                                        const isSelected = formData.dataTypes.includes(dataType.id);

                                        return (
                                            <div
                                                key={dataType.id}
                                                className={cn(
                                                    "p-3 border rounded-lg cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-blue-500 bg-blue-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                )}
                                                onClick={() => handleDataTypeToggle(dataType.id, !isSelected)}
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => { }}
                                                        className="mt-0.5"
                                                    />
                                                    <Icon className="h-5 w-5 text-blue-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <h4 className="font-medium text-sm">{dataType.label}</h4>
                                                        <p className="text-xs text-gray-600">{dataType.description}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Request Details */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Purpose */}
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Purpose of Access *</Label>
                                <Textarea
                                    id="purpose"
                                    placeholder="Explain why you need access to this patient's data..."
                                    value={formData.purpose}
                                    onChange={(e) => updateFormData('purpose', e.target.value)}
                                    className="min-h-24"
                                />
                                <p className="text-xs text-gray-500">
                                    Minimum 10 characters. Be specific about your medical need.
                                </p>
                            </div>

                            {/* Urgency Level */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Urgency Level</Label>
                                <div className="grid gap-3">
                                    {URGENCY_LEVELS.map((urgency) => (
                                        <div
                                            key={urgency.value}
                                            className={cn(
                                                "p-4 border rounded-lg cursor-pointer transition-colors",
                                                formData.urgency === urgency.value
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            )}
                                            onClick={() => updateFormData('urgency', urgency.value)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border-2",
                                                        formData.urgency === urgency.value
                                                            ? "border-blue-500 bg-blue-500"
                                                            : "border-gray-300"
                                                    )}>
                                                        {formData.urgency === urgency.value && (
                                                            <div className="w-full h-full rounded-full bg-white scale-50" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{urgency.label}</h4>
                                                        <p className="text-sm text-gray-600">{urgency.description}</p>
                                                    </div>
                                                </div>
                                                <Badge className={urgency.color}>
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {urgency.responseTime}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Access Duration (days) *</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={formData.duration}
                                    onChange={(e) => updateFormData('duration', parseInt(e.target.value) || 30)}
                                />
                                <p className="text-xs text-gray-500">
                                    How long do you need access? (1-365 days)
                                </p>
                            </div>

                            {/* Emergency-specific fields */}
                            {formData.urgency === 'emergency' && (
                                <div className="space-y-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="flex items-center space-x-2 text-red-800">
                                        <AlertTriangle className="h-5 w-5" />
                                        <h4 className="font-medium">Emergency Request Requirements</h4>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="emergency-contact">Emergency Contact *</Label>
                                            <Input
                                                id="emergency-contact"
                                                placeholder="Emergency contact person and phone number"
                                                value={formData.emergencyContact || ''}
                                                onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="medical-justification">Medical Justification *</Label>
                                            <Textarea
                                                id="medical-justification"
                                                placeholder="Detailed medical justification for emergency access..."
                                                value={formData.medicalJustification || ''}
                                                onChange={(e) => updateFormData('medicalJustification', e.target.value)}
                                                className="min-h-20"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Additional Options */}
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="treatment-duration">Expected Treatment Duration (days)</Label>
                                    <Input
                                        id="treatment-duration"
                                        type="number"
                                        min="1"
                                        placeholder="Optional"
                                        value={formData.expectedTreatmentDuration || ''}
                                        onChange={(e) => updateFormData('expectedTreatmentDuration', parseInt(e.target.value) || undefined)}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="follow-up"
                                        checked={formData.followUpRequired}
                                        onCheckedChange={(checked) => updateFormData('followUpRequired', !!checked)}
                                    />
                                    <Label htmlFor="follow-up">Follow-up appointments required</Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Review & Submit */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Please review your consent request carefully. Once submitted, it will be sent to the patient for approval.
                                </AlertDescription>
                            </Alert>

                            {/* Request Summary */}
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <h4 className="font-medium mb-2">Patient Information</h4>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Name:</strong> {patientName}</p>
                                            <p><strong>Wallet:</strong> <span className="font-mono">{patient.walletAddress}</span></p>
                                            {patient.email && <p><strong>Email:</strong> {patient.email}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium mb-2">Access Details</h4>
                                        <div className="space-y-1 text-sm">
                                            <p><strong>Level:</strong> {ACCESS_LEVELS.find(l => l.value === formData.accessLevel)?.label}</p>
                                            <p><strong>Duration:</strong> {formData.duration} days</p>
                                            <p><strong>Urgency:</strong> {selectedUrgency?.label}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Requested Data Types ({formData.dataTypes.length})</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {formData.dataTypes.map(typeId => {
                                            const dataType = DATA_TYPES.find(dt => dt.id === typeId);
                                            return dataType ? (
                                                <Badge key={typeId} variant="outline">
                                                    {dataType.label}
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Purpose</h4>
                                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{formData.purpose}</p>
                                </div>

                                {formData.urgency === 'emergency' && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <h4 className="font-medium mb-2 text-red-800">Emergency Request Details</h4>
                                        <div className="space-y-2 text-sm">
                                            {formData.emergencyContact && (
                                                <p><strong>Emergency Contact:</strong> {formData.emergencyContact}</p>
                                            )}
                                            {formData.medicalJustification && (
                                                <p><strong>Medical Justification:</strong> {formData.medicalJustification}</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center justify-between pt-6 border-t">
                        <div className="flex items-center space-x-2">
                            {step > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setStep(step - 1)}
                                    disabled={loading}
                                >
                                    Previous
                                </Button>
                            )}

                            {onCancel && (
                                <Button
                                    variant="ghost"
                                    onClick={onCancel}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {step < 3 ? (
                                <Button
                                    onClick={() => setStep(step + 1)}
                                    disabled={loading}
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Submit Request
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}