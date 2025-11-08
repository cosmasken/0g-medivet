/**
 * Consent Manager Component for Patients
 * Allows patients to view, approve, deny, and revoke consent requests
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Shield,
  ShieldCheck,
  ShieldX,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Edit,
  Unlock,
  Calendar,
  User,
  FileText,
  Heart,
  Activity,
  Pill,
  TestTube,
  Stethoscope,
  UserCheck,
  AlertCircle,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  ConsentRequest,
  ConsentApprovalData,
  ConsentDenialData,
  consentService
} from '@/services/consentService';
import { useConsentManagement, useConsentWorkflow } from '@/hooks/useConsentManagement';

interface ConsentManagerProps {
  patientId: string;
  onConsentUpdate?: (request: ConsentRequest) => void;
  className?: string;
}

interface ConsentReviewData {
  approvedAccessLevel: ConsentRequest['requestedAccessLevel'];
  approvedDataTypes: string[];
  duration: number;
  conditions?: string[];
}

interface ConsentRevocationData {
  reason: string;
  allowResubmission: boolean;
}

const DATA_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'demographics': UserCheck,
  'medical-history': FileText,
  'medications': Pill,
  'allergies': AlertTriangle,
  'lab-results': TestTube,
  'imaging': Activity,
  'vital-signs': Heart,
  'visit-notes': Stethoscope
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

const ACCESS_LEVEL_INFO = {
  view: { label: 'View Only', icon: '👁️', description: 'Can view selected data' },
  edit: { label: 'View & Edit', icon: '✏️', description: 'Can view and modify selected data' },
  full: { label: 'Full Access', icon: '🔓', description: 'Complete access including sharing' }
};

export default function ConsentManager({
  patientId,
  onConsentUpdate,
  className
}: ConsentManagerProps) {
  const {
    consentState,
    loadPatientRequests,
    approveConsentRequest,
    denyConsentRequest,
    revokeConsent,
    clearError
  } = useConsentManagement();

  const {
    isConsentValid,
    isConsentExpiring,
    getConsentTimeRemaining,
    getNextAction
  } = useConsentWorkflow();

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'history'>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ConsentRequest | null>(null);
  const [reviewData, setReviewData] = useState<ConsentReviewData | null>(null);
  const [revocationData, setRevocationData] = useState<ConsentRevocationData | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showRevocationModal, setShowRevocationModal] = useState(false);

  // Load consent requests on mount and tab change
  useEffect(() => {
    let status: ConsentRequest['status'] | undefined;

    switch (activeTab) {
      case 'pending':
        status = 'pending';
        break;
      case 'active':
        status = 'approved';
        break;
      case 'history':
        status = undefined; // Load all for history
        break;
    }

    loadPatientRequests(patientId, status);
  }, [patientId, activeTab, loadPatientRequests]);

  // Filter requests based on active tab
  const filteredRequests = consentState.requests.filter(request => {
    switch (activeTab) {
      case 'pending':
        return request.status === 'pending';
      case 'active':
        return request.status === 'approved' && isConsentValid(request);
      case 'history':
        return ['denied', 'expired', 'revoked'].includes(request.status) ||
          (request.status === 'approved' && !isConsentValid(request));
      default:
        return true;
    }
  });

  // Handle consent review
  const handleReviewConsent = useCallback((request: ConsentRequest) => {
    setSelectedRequest(request);
    setReviewData({
      approvedAccessLevel: request.requestedAccessLevel,
      approvedDataTypes: [...request.requestedDataTypes],
      duration: request.duration,
      conditions: []
    });
    setShowReviewModal(true);
  }, []);

  // Handle consent approval
  const handleApproveConsent = useCallback(async () => {
    if (!selectedRequest || !reviewData) return;

    const approvalData: ConsentApprovalData = {
      consentRequestId: selectedRequest.id,
      approvedAccessLevel: reviewData.approvedAccessLevel,
      approvedDataTypes: reviewData.approvedDataTypes,
      duration: reviewData.duration
    };

    const updatedRequest = await approveConsentRequest(
      selectedRequest.id,
      patientId,
      approvalData
    );

    if (updatedRequest) {
      onConsentUpdate?.(updatedRequest);
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewData(null);
    }
  }, [selectedRequest, reviewData, approveConsentRequest, patientId, onConsentUpdate]);

  // Handle consent denial
  const handleDenyConsent = useCallback(async (reason: string) => {
    if (!selectedRequest) return;

    const denialData: ConsentDenialData = {
      consentRequestId: selectedRequest.id,
      reason,
      allowResubmission: true
    };

    const updatedRequest = await denyConsentRequest(
      selectedRequest.id,
      patientId,
      denialData
    );

    if (updatedRequest) {
      onConsentUpdate?.(updatedRequest);
      setShowReviewModal(false);
      setSelectedRequest(null);
      setReviewData(null);
    }
  }, [selectedRequest, denyConsentRequest, patientId, onConsentUpdate]);

  // Handle consent revocation
  const handleRevokeConsent = useCallback((request: ConsentRequest) => {
    setSelectedRequest(request);
    setRevocationData({
      reason: '',
      allowResubmission: true
    });
    setShowRevocationModal(true);
  }, []);

  // Confirm consent revocation
  const handleConfirmRevocation = useCallback(async () => {
    if (!selectedRequest || !revocationData?.reason.trim()) return;

    const updatedRequest = await revokeConsent(
      selectedRequest.id,
      patientId,
      revocationData.reason
    );

    if (updatedRequest) {
      onConsentUpdate?.(updatedRequest);
      setShowRevocationModal(false);
      setSelectedRequest(null);
      setRevocationData(null);
    }
  }, [selectedRequest, revocationData, revokeConsent, patientId, onConsentUpdate]);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  }, []);

  // Get status badge
  const getStatusBadge = useCallback((request: ConsentRequest) => {
    switch (request.status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'approved':
        if (isConsentValid(request)) {
          if (isConsentExpiring(request)) {
            return <Badge className="bg-orange-100 text-orange-800"><AlertTriangle className="h-3 w-3 mr-1" />Expiring Soon</Badge>;
          }
          return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
        } else {
          return <Badge className="bg-gray-100 text-gray-800"><XCircle className="h-3 w-3 mr-1" />Expired</Badge>;
        }
      case 'denied':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="h-3 w-3 mr-1" />Expired</Badge>;
      case 'revoked':
        return <Badge className="bg-purple-100 text-purple-800"><RotateCcw className="h-3 w-3 mr-1" />Revoked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  }, [isConsentValid, isConsentExpiring]);

  // Get urgency badge
  const getUrgencyBadge = useCallback((urgency: ConsentRequest['urgency']) => {
    switch (urgency) {
      case 'emergency':
        return <Badge className="bg-red-100 text-red-800">Emergency</Badge>;
      case 'urgent':
        return <Badge className="bg-yellow-100 text-yellow-800">Urgent</Badge>;
      default:
        return <Badge variant="outline">Standard</Badge>;
    }
  }, []);

  // Render consent request card
  const renderConsentCard = useCallback((request: ConsentRequest) => {
    const timeRemaining = getConsentTimeRemaining(request);
    const nextAction = getNextAction(request, 'patient');

    return (
      <Card key={request.id} className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback>
                  {request.providerName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h3 className="font-semibold">{request.providerName}</h3>
                {request.providerSpecialty && (
                  <p className="text-sm text-gray-600">{request.providerSpecialty}</p>
                )}
                <p className="text-xs text-gray-500 font-mono mt-1">
                  {request.providerWalletAddress}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(request)}
              {getUrgencyBadge(request.urgency)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Request Details */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Access Level</h4>
              <div className="flex items-center space-x-2">
                <span className="text-lg">{ACCESS_LEVEL_INFO[request.requestedAccessLevel].icon}</span>
                <span className="text-sm">{ACCESS_LEVEL_INFO[request.requestedAccessLevel].label}</span>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-sm mb-2">Duration</h4>
              <p className="text-sm">{request.duration} days</p>
            </div>
          </div>

          {/* Data Types */}
          <div>
            <h4 className="font-medium text-sm mb-2">
              Requested Data Types ({request.requestedDataTypes.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {request.requestedDataTypes.map(typeId => {
                const Icon = DATA_TYPE_ICONS[typeId] || FileText;
                const label = DATA_TYPE_LABELS[typeId] || typeId;

                return (
                  <div key={typeId} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs">
                    <Icon className="h-3 w-3" />
                    <span>{label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purpose */}
          <div>
            <h4 className="font-medium text-sm mb-2">Purpose</h4>
            <p className="text-sm bg-gray-50 p-3 rounded-lg">{request.purpose}</p>
          </div>

          {/* Emergency Details */}
          {request.urgency === 'emergency' && request.metadata && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-red-800">Emergency Request Details</h4>
              <div className="space-y-1 text-sm">
                {request.metadata.emergencyContact && (
                  <p><strong>Emergency Contact:</strong> {request.metadata.emergencyContact}</p>
                )}
                {request.metadata.medicalJustification && (
                  <p><strong>Medical Justification:</strong> {request.metadata.medicalJustification}</p>
                )}
              </div>
            </div>
          )}

          {/* Time Information */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              <p>Requested: {formatDate(request.createdAt)}</p>
              {request.status === 'approved' && request.expiresAt && (
                <p>
                  {timeRemaining.expired ? 'Expired' : `Expires in ${timeRemaining.days}d ${timeRemaining.hours}h`}
                </p>
              )}
            </div>

            {nextAction && (
              <div className="text-right">
                <p className="text-blue-600 font-medium">{nextAction}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t">
            <div className="flex items-center space-x-2">
              {request.status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => handleReviewConsent(request)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Review
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDenyConsent('Not needed at this time')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Quick Deny
                  </Button>
                </>
              )}

              {request.status === 'approved' && isConsentValid(request) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRevokeConsent(request)}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Revoke
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [
    getConsentTimeRemaining,
    getNextAction,
    getStatusBadge,
    getUrgencyBadge,
    formatDate,
    handleReviewConsent,
    handleDenyConsent,
    handleRevokeConsent,
    isConsentValid
  ]);

  // Get tab counts
  const pendingCount = consentState.requests.filter(r => r.status === 'pending').length;
  const activeCount = consentState.requests.filter(r => r.status === 'approved' && isConsentValid(r)).length;
  const historyCount = consentState.requests.filter(r =>
    ['denied', 'expired', 'revoked'].includes(r.status) ||
    (r.status === 'approved' && !isConsentValid(r))
  ).length;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Consent Management</span>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600">
            Manage healthcare provider access to your medical data. You have complete control over who can access your information and for how long.
          </p>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
            activeTab === 'pending' ? "bg-white shadow-sm" : "hover:bg-gray-200"
          )}
          onClick={() => setActiveTab('pending')}
        >
          <Clock className="h-4 w-4 mr-1 inline" />
          Pending ({pendingCount})
        </button>
        <button
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
            activeTab === 'active' ? "bg-white shadow-sm" : "hover:bg-gray-200"
          )}
          onClick={() => setActiveTab('active')}
        >
          <ShieldCheck className="h-4 w-4 mr-1 inline" />
          Active ({activeCount})
        </button>
        <button
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
            activeTab === 'history' ? "bg-white shadow-sm" : "hover:bg-gray-200"
          )}
          onClick={() => setActiveTab('history')}
        >
          <FileText className="h-4 w-4 mr-1 inline" />
          History ({historyCount})
        </button>
      </div>

      {/* Error Display */}
      {consentState.error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {consentState.error}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2 h-auto p-0 text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Content */}
      <div className="space-y-4">
        {consentState.loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading consent requests...</span>
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="space-y-4">
            {filteredRequests.map(renderConsentCard)}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">
              {activeTab === 'pending' && 'No pending consent requests'}
              {activeTab === 'active' && 'No active consents'}
              {activeTab === 'history' && 'No consent history'}
            </p>
            <p className="text-sm">
              {activeTab === 'pending' && 'New consent requests from providers will appear here'}
              {activeTab === 'active' && 'Approved consents will be shown here'}
              {activeTab === 'history' && 'Past consent decisions will be listed here'}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedRequest && reviewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Consent Request</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Provider Info */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {selectedRequest.providerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedRequest.providerName}</h4>
                  {selectedRequest.providerSpecialty && (
                    <p className="text-sm text-gray-600">{selectedRequest.providerSpecialty}</p>
                  )}
                </div>
              </div>

              {/* Access Level Selection */}
              <div className="space-y-3">
                <h4 className="font-medium">Access Level</h4>
                <Select
                  value={reviewData.approvedAccessLevel}
                  onValueChange={(value) => setReviewData(prev => prev ? {
                    ...prev,
                    approvedAccessLevel: value as ConsentRequest['requestedAccessLevel']
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ACCESS_LEVEL_INFO).map(([value, info]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center space-x-2">
                          <span>{info.icon}</span>
                          <span>{info.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Data Types Selection */}
              <div className="space-y-3">
                <h4 className="font-medium">Approved Data Types</h4>
                <div className="grid md:grid-cols-2 gap-3">
                  {selectedRequest.requestedDataTypes.map(typeId => {
                    const Icon = DATA_TYPE_ICONS[typeId] || FileText;
                    const label = DATA_TYPE_LABELS[typeId] || typeId;
                    const isApproved = reviewData.approvedDataTypes.includes(typeId);

                    return (
                      <div
                        key={typeId}
                        className="flex items-center space-x-2 p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => setReviewData(prev => prev ? {
                          ...prev,
                          approvedDataTypes: isApproved
                            ? prev.approvedDataTypes.filter(id => id !== typeId)
                            : [...prev.approvedDataTypes, typeId]
                        } : null)}
                      >
                        <Checkbox checked={isApproved} onChange={() => { }} />
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <h4 className="font-medium">Access Duration (days)</h4>
                <Select
                  value={reviewData.duration.toString()}
                  onValueChange={(value) => setReviewData(prev => prev ? {
                    ...prev,
                    duration: parseInt(value)
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                    <SelectItem value="365">365 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewModal(false);
                      setSelectedRequest(null);
                      setReviewData(null);
                    }}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => handleDenyConsent('After review, I do not wish to grant access at this time')}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Deny
                  </Button>
                </div>

                <Button
                  onClick={handleApproveConsent}
                  disabled={reviewData.approvedDataTypes.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revocation Modal */}
      {showRevocationModal && selectedRequest && revocationData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <RotateCcw className="h-5 w-5 text-red-600" />
                <span>Revoke Consent</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This will immediately revoke {selectedRequest.providerName}'s access to your medical data.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <label className="text-sm font-medium">Reason for revocation *</label>
                <Textarea
                  placeholder="Please explain why you're revoking this consent..."
                  value={revocationData.reason}
                  onChange={(e) => setRevocationData(prev => prev ? {
                    ...prev,
                    reason: e.target.value
                  } : null)}
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRevocationModal(false);
                    setSelectedRequest(null);
                    setRevocationData(null);
                  }}
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleConfirmRevocation}
                  disabled={!revocationData.reason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Revoke Access
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}