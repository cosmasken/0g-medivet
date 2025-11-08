/**
 * Emergency Access Override Component
 * Handles emergency access scenarios for healthcare providers
 */

import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    AlertTriangle,
    Shield,
    Clock,
    Phone,
    User,
    FileText,
    Heart,
    Activity,
    Stethoscope,
    Loader2,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmergencyAccessOverrideProps {
    patientWalletAddress: string;
    providerId: string;
    providerData: {
        name: string;
        specialty?: string;
        walletAddress: string;
        licenseNumber?: string;
    };
    onAccessGranted?: (accessData: EmergencyAccessData) => void;
    onCancel?: () => void;
    className?: string;
}

interface EmergencyAccessData {
    patientWalletAddress: string;
    providerId: string;
    emergencyType: 'life-threatening' | 'urgent-care' | 'critical-diagnosis';
    medicalJustification: string;
    emergencyContact: string;
    witnessInformation?: string;
    requestedDataTypes: string[];
    estimatedDuration: number; // in hours
    followUpRequired: boolean;
    auditTrail: {
        timestamp: string;
        providerInfo: any;
        justification: string;
        witnessInfo?: string;
    };
}

const EMERGENCY_TYPES = [
    {
        value: 'life-threatening' as const,
        label: 'Life-Threatening Emergency',
        description: 'Immediate threat to life requiring instant access',
        color: 'bg-red-100 text-red-800',
        maxDuration: 24
    },
    {
        value: 'urgent-care' as const,
        label: 'Urgent Medical Care',
        description: 'Urgent medical situation requiring prompt access',
        color: 'bg-orange-100 text-orange-800',
        maxDuration: 12
    },
    {
        value: 'critical-diagnosis' as const,
        label: 'Critical Diagnosis',
        description: 'Critical diagnostic situation requiring immediate data',
        color: 'bg-yellow-100 text-yellow-800',
        maxDuration: 6
    }
];

const EMERGENCY_DATA_TYPES = [
    { id: 'demographics', label: 'Demographics', icon: User, critical: true },
    { id: 'allergies', label: 'Allergies', icon: AlertTriangle, critical: true },
    { id: 'medications', label: 'Current Medications', icon: Heart, critical: true },
    { id: 'medical-history', label: 'Medical History', icon: FileText, critical: true },
    { id: 'vital-signs', label: 'Recent Vital Signs', icon: Activity, critical: false },
    { id: 'lab-results', label: 'Recent Lab Results', icon: Stethoscope, critical: false },
    { id: 'visit-notes', label: 'Recent Visit Notes', icon: FileText, critical: false }
];

export default function EmergencyAccessOverride({
    patientWalletAddress,
    providerId,
    providerData,
    onAccessGranted,
    onCancel,
    className
}: EmergencyAccessOverrideProps) {
    const [formData, setFormData] = useState({
        emergencyType: '' as EmergencyAccessData['emergencyType'] | '',
        medicalJustification: '',
        emergencyContact: '',
        witnessInformation: '',
        requestedDataTypes: EMERGENCY_DATA_TYPES.filter(dt => dt.critical).map(dt => dt.id),
        estimatedDuration: 2,
        followUpRequired: true
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState(1);
    const [acknowledgments, setAcknowledgments] = useState({
        legalResponsibility: false,
        auditTrail: false,
        patientNotification: false,
        dataMinimization: false,
        followUpDocumentation: false
    });

    // Update form data
    const updateFormData = useCallback(<K extends keyof typeof formData>(
        key: K,
        value: typeof formData[K]
    ) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        setError(null);
    }, []);

    // Handle data type selection
    const handleDataTypeToggle = useCallback((dataTypeId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            requestedDataTypes: checked
                ? [...prev.requestedDataTypes, dataTypeId]
                : prev.requestedDataTypes.filter(id => id !== dataTypeId)
        }));
    }, []);

    // Handle acknowledgment toggle
    const handleAcknowledgmentToggle = useCallback(<K extends keyof typeof acknowledgments>(
        key: K,
        checked: boolean
    ) => {
        setAcknowledgments(prev => ({ ...prev, [key]: checked }));
    }, []);

    // Validate form
    const validateForm = useCallback((): string | null => {
        if (!formData.emergencyType) {
            return 'Please select an emergency type';
        }

        if (!formData.medicalJustification.trim() || formData.medicalJustification.trim().length < 50) {
            return 'Medical justification must be at least 50 characters long';
        }

        if (!formData.emergencyContact.trim()) {
            return 'Emergency contact information is required';
        }

        if (formData.requestedDataTypes.length === 0) {
            return 'At least one data type must be selected';
        }

        if (formData.estimatedDuration < 1 || formData.estimatedDuration > 24) {
            return 'Estimated duration must be between 1 and 24 hours';
        }

        // Validate acknowledgments
        const requiredAcknowledgments = Object.values(acknowledgments);
        if (!requiredAcknowledgments.every(ack => ack)) {
            return 'All acknowledgments must be accepted for emergency access';
        }

        return null;
    }, [formData, acknowledgments]);

    // Submit emergency access request
    const handleSubmit = useCallback(async () => {
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Simulate emergency access processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            const accessData: EmergencyAccessData = {
                patientWalletAddress,
                providerId,
                emergencyType: formData.emergencyType as EmergencyAccessData['emergencyType'],
                medicalJustification: formData.medicalJustification,
                emergencyContact: formData.emergencyContact,
                witnessInformation: formData.witnessInformation || undefined,
                requestedDataTypes: formData.requestedDataTypes,
                estimatedDuration: formData.estimatedDuration,
                followUpRequired: formData.followUpRequired,
                auditTrail: {
                    timestamp: new Date().toISOString(),
                    providerInfo: providerData,
                    justification: formData.medicalJustification,
                    witnessInfo: formData.witnessInformation || undefined
                }
            };

            onAccessGranted?.(accessData);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Emergency access request failed';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [formData, acknowledgments, validateForm, patientWalletAddress, providerId, providerData, onAccessGranted]);

    // Get selected emergency type
    const selectedEmergencyType = EMERGENCY_TYPES.find(type => type.value === formData.emergencyType);

    return (
        <div className={cn("space-y-6", className)}>
            {/* Warning Header */}
            <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                    <strong>Emergency Access Override</strong> - This action will be heavily audited and may require justification to medical boards and regulatory authorities.
                </AlertDescription>
            </Alert>

            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-4">
                {[1, 2, 3].map((stepNumber) => (
                    <div key={stepNumber} className="flex items-center">
                        <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                            step >= stepNumber
                                ? "bg-red-600 text-white"
                                : "bg-gray-200 text-gray-600"
                        )}>
                            {stepNumber}
                        </div>
                        {stepNumber < 3 && (
                            <div className={cn(
                                "w-16 h-0.5 mx-2",
                                step > stepNumber ? "bg-red-600" : "bg-gray-200"
                            )} />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-red-800">
                        <Shield className="h-5 w-5" />
                        <span>
                            {step === 1 && 'Emergency Classification'}
                            {step === 2 && 'Medical Justification'}
                            {step === 3 && 'Legal Acknowledgments'}
                        </span>
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Step 1: Emergency Classification */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Patient Information */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-2">Patient Information</h4>
                                <p className="text-sm font-mono">{patientWalletAddress}</p>
                                <p className="text-xs text-gray-600 mt-1">
                                    Emergency access will be granted for this patient's medical data
                                </p>
                            </div>

                            {/* Emergency Type Selection */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Emergency Type *</Label>
                                <div className="space-y-3">
                                    {EMERGENCY_TYPES.map((type) => (
                                        <div
                                            key={type.value}
                                            className={cn(
                                                "p-4 border rounded-lg cursor-pointer transition-colors",
                                                formData.emergencyType === type.value
                                                    ? "border-red-500 bg-red-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                            )}
                                            onClick={() => updateFormData('emergencyType', type.value)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-3">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full border-2",
                                                        formData.emergencyType === type.value
                                                            ? "border-red-500 bg-red-500"
                                                            : "border-gray-300"
                                                    )}>
                                                        {formData.emergencyType === type.value && (
                                                            <div className="w-full h-full rounded-full bg-white scale-50" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium">{type.label}</h4>
                                                        <p className="text-sm text-gray-600">{type.description}</p>
                                                    </div>
                                                </div>
                                                <Badge className={type.color}>
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    Max {type.maxDuration}h
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Data Types Selection */}
                            <div className="space-y-3">
                                <Label className="text-base font-medium">
                                    Required Data Types ({formData.requestedDataTypes.length} selected)
                                </Label>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {EMERGENCY_DATA_TYPES.map((dataType) => {
                                        const Icon = dataType.icon;
                                        const isSelected = formData.requestedDataTypes.includes(dataType.id);

                                        return (
                                            <div
                                                key={dataType.id}
                                                className={cn(
                                                    "p-3 border rounded-lg cursor-pointer transition-colors",
                                                    isSelected
                                                        ? "border-red-500 bg-red-50"
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
                                                    <Icon className="h-5 w-5 text-red-600 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-2">
                                                            <h4 className="font-medium text-sm">{dataType.label}</h4>
                                                            {dataType.critical && (
                                                                <Badge className="bg-red-100 text-red-800 text-xs">Critical</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label htmlFor="duration">Estimated Access Duration (hours) *</Label>
                                <Select
                                    value={formData.estimatedDuration.toString()}
                                    onValueChange={(value) => updateFormData('estimatedDuration', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 hour</SelectItem>
                                        <SelectItem value="2">2 hours</SelectItem>
                                        <SelectItem value="4">4 hours</SelectItem>
                                        <SelectItem value="6">6 hours</SelectItem>
                                        <SelectItem value="8">8 hours</SelectItem>
                                        <SelectItem value="12">12 hours</SelectItem>
                                        <SelectItem value="24">24 hours</SelectItem>
                                    </SelectContent>
                                </Select>
                                {selectedEmergencyType && formData.estimatedDuration > selectedEmergencyType.maxDuration && (
                                    <p className="text-xs text-red-600">
                                        Duration exceeds maximum for {selectedEmergencyType.label} ({selectedEmergencyType.maxDuration}h)
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Medical Justification */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {/* Medical Justification */}
                            <div className="space-y-2">
                                <Label htmlFor="justification">Medical Justification *</Label>
                                <Textarea
                                    id="justification"
                                    placeholder="Provide detailed medical justification for emergency access. Include patient condition, immediate medical needs, and why standard consent process cannot be followed..."
                                    value={formData.medicalJustification}
                                    onChange={(e) => updateFormData('medicalJustification', e.target.value)}
                                    className="min-h-32"
                                />
                                <p className="text-xs text-gray-500">
                                    Minimum 50 characters. This will be part of the permanent audit record.
                                </p>
                            </div>

                            {/* Emergency Contact */}
                            <div className="space-y-2">
                                <Label htmlFor="emergency-contact">Emergency Contact Information *</Label>
                                <Input
                                    id="emergency-contact"
                                    placeholder="Emergency contact person, relationship, and phone number"
                                    value={formData.emergencyContact}
                                    onChange={(e) => updateFormData('emergencyContact', e.target.value)}
                                />
                            </div>

                            {/* Witness Information */}
                            <div className="space-y-2">
                                <Label htmlFor="witness">Witness Information (Optional)</Label>
                                <Textarea
                                    id="witness"
                                    placeholder="If applicable, provide information about witnesses to the emergency situation..."
                                    value={formData.witnessInformation}
                                    onChange={(e) => updateFormData('witnessInformation', e.target.value)}
                                    className="min-h-20"
                                />
                            </div>

                            {/* Follow-up Required */}
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="follow-up"
                                    checked={formData.followUpRequired}
                                    onCheckedChange={(checked) => updateFormData('followUpRequired', !!checked)}
                                />
                                <Label htmlFor="follow-up">Follow-up documentation will be provided within 24 hours</Label>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Legal Acknowledgments */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <Alert className="border-red-200 bg-red-50">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    By proceeding, you acknowledge full legal responsibility for this emergency access override.
                                </AlertDescription>
                            </Alert>

                            {/* Summary */}
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-medium mb-3">Emergency Access Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Emergency Type:</strong> {selectedEmergencyType?.label}</p>
                                    <p><strong>Duration:</strong> {formData.estimatedDuration} hours</p>
                                    <p><strong>Data Types:</strong> {formData.requestedDataTypes.length} selected</p>
                                    <p><strong>Provider:</strong> {providerData.name}</p>
                                </div>
                            </div>

                            {/* Legal Acknowledgments */}
                            <div className="space-y-4">
                                <h4 className="font-medium">Required Acknowledgments</h4>

                                <div className="space-y-3">
                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="legal-responsibility"
                                            checked={acknowledgments.legalResponsibility}
                                            onCheckedChange={(checked) => handleAcknowledgmentToggle('legalResponsibility', !!checked)}
                                        />
                                        <Label htmlFor="legal-responsibility" className="text-sm">
                                            I accept full legal responsibility for this emergency access override and understand that I may be required to justify this action to medical boards, regulatory authorities, and legal entities.
                                        </Label>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="audit-trail"
                                            checked={acknowledgments.auditTrail}
                                            onCheckedChange={(checked) => handleAcknowledgmentToggle('auditTrail', !!checked)}
                                        />
                                        <Label htmlFor="audit-trail" className="text-sm">
                                            I understand that this emergency access will be permanently logged in an immutable audit trail and may be subject to review by regulatory authorities.
                                        </Label>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="patient-notification"
                                            checked={acknowledgments.patientNotification}
                                            onCheckedChange={(checked) => handleAcknowledgmentToggle('patientNotification', !!checked)}
                                        />
                                        <Label htmlFor="patient-notification" className="text-sm">
                                            I acknowledge that the patient will be immediately notified of this emergency access override and will have the right to review all accessed data.
                                        </Label>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="data-minimization"
                                            checked={acknowledgments.dataMinimization}
                                            onCheckedChange={(checked) => handleAcknowledgmentToggle('dataMinimization', !!checked)}
                                        />
                                        <Label htmlFor="data-minimization" className="text-sm">
                                            I commit to accessing only the minimum necessary data required for the emergency medical situation and will not access data beyond what is medically justified.
                                        </Label>
                                    </div>

                                    <div className="flex items-start space-x-2">
                                        <Checkbox
                                            id="follow-up-documentation"
                                            checked={acknowledgments.followUpDocumentation}
                                            onCheckedChange={(checked) => handleAcknowledgmentToggle('followUpDocumentation', !!checked)}
                                        />
                                        <Label htmlFor="follow-up-documentation" className="text-sm">
                                            I commit to providing complete follow-up documentation within 24 hours, including detailed medical records of the emergency situation and all data accessed.
                                        </Label>
                                    </div>
                                </div>
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
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Next
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Grant Emergency Access
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