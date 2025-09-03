export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: 'view' | 'download' | 'share' | 'modify' | 'delete' | 'export' | 'print' | 'access_granted' | 'access_denied';
  actor: {
    id: string;
    name: string;
    type: 'patient' | 'provider' | 'system' | 'researcher' | 'admin';
    organization?: string;
    ipAddress: string;
    userAgent: string;
  };
  target: {
    type: 'medical_record' | 'patient_profile' | 'permission_setting' | 'data_export' | 'marketplace_listing';
    id: string;
    name: string;
    category?: string;
    sensitivity: 'low' | 'medium' | 'high' | 'critical';
  };
  details: {
    description: string;
    method: 'web' | 'api' | 'mobile' | 'integration';
    location?: string;
    duration?: number; // in seconds
    dataSize?: number; // in bytes
    reason?: string;
  };
  outcome: 'success' | 'failure' | 'partial' | 'blocked';
  complianceFlags: string[];
  riskScore: number; // 0-100
}

export interface ProviderInteraction {
  id: string;
  providerId: string;
  providerName: string;
  providerOrganization: string;
  interactionType: 'access_request' | 'data_view' | 'record_update' | 'consultation' | 'referral' | 'prescription' | 'test_order';
  timestamp: string;
  duration: number; // in minutes
  recordsAccessed: string[];
  permissionsUsed: string[];
  purpose: string;
  outcome: 'completed' | 'in_progress' | 'cancelled' | 'failed';
  patientConsent: boolean;
  complianceStatus: 'compliant' | 'non_compliant' | 'under_review';
  notes?: string;
}

export interface DataSharingEvent {
  id: string;
  timestamp: string;
  sharingType: 'provider_access' | 'research_participation' | 'marketplace_sale' | 'emergency_access' | 'family_sharing';
  dataShared: {
    recordIds: string[];
    categories: string[];
    sensitivity: 'low' | 'medium' | 'high' | 'critical';
    anonymized: boolean;
  };
  recipient: {
    id: string;
    name: string;
    type: 'provider' | 'researcher' | 'family_member' | 'emergency_contact';
    organization?: string;
    purpose: string;
  };
  permissions: {
    granted: string[];
    denied: string[];
    expiry?: string;
    conditions: string[];
  };
  consentDetails: {
    consentGiven: boolean;
    consentMethod: 'explicit' | 'implied' | 'emergency' | 'opt_in';
    consentTimestamp: string;
    withdrawable: boolean;
  };
  monetization?: {
    amount: number;
    currency: string;
    transactionId: string;
  };
  complianceChecks: {
    hipaaCompliant: boolean;
    gdprCompliant: boolean;
    localRegulationsCompliant: boolean;
    additionalChecks: string[];
  };
}

export interface ComplianceMetric {
  id: string;
  category: 'hipaa' | 'gdpr' | 'hitech' | 'state_regulations' | 'organizational_policy';
  metric: string;
  value: number;
  unit: string;
  status: 'compliant' | 'non_compliant' | 'at_risk' | 'under_review';
  lastAssessed: string;
  nextReview: string;
  description: string;
  requirements: string[];
  violations?: {
    count: number;
    lastViolation?: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  };
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: 'login_attempt' | 'failed_access' | 'suspicious_activity' | 'data_breach' | 'unauthorized_access' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: {
    ipAddress: string;
    location?: string;
    userAgent: string;
    userId?: string;
  };
  description: string;
  actionTaken: string;
  resolved: boolean;
  investigationStatus: 'open' | 'in_progress' | 'closed' | 'escalated';
}

// Generate realistic audit log entries
const generateAuditLogs = (): AuditLogEntry[] => {
  const logs: AuditLogEntry[] = [];
  const now = new Date();
  
  // Generate logs for the past 30 days
  for (let i = 0; i < 150; i++) {
    const timestamp = new Date(now.getTime() - (Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    const actions = ['view', 'download', 'share', 'modify', 'export', 'access_granted'] as const;
    const actorTypes = ['patient', 'provider', 'system', 'researcher'] as const;
    const targetTypes = ['medical_record', 'patient_profile', 'permission_setting', 'data_export'] as const;
    const outcomes = ['success', 'failure', 'blocked'] as const;
    
    const action = actions[Math.floor(Math.random() * actions.length)];
    const actorType = actorTypes[Math.floor(Math.random() * actorTypes.length)];
    const targetType = targetTypes[Math.floor(Math.random() * targetTypes.length)];
    const outcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    logs.push({
      id: `audit-${i + 1}`,
      timestamp: timestamp.toISOString(),
      action,
      actor: {
        id: `actor-${Math.floor(Math.random() * 20) + 1}`,
        name: actorType === 'provider' ? `Dr. ${['Smith', 'Johnson', 'Williams', 'Brown', 'Jones'][Math.floor(Math.random() * 5)]}` :
              actorType === 'patient' ? 'Sarah Johnson' :
              actorType === 'researcher' ? `Researcher ${Math.floor(Math.random() * 10) + 1}` :
              'System',
        type: actorType,
        organization: actorType === 'provider' ? ['City General Hospital', 'Metro Medical Center', 'Health Plus Clinic'][Math.floor(Math.random() * 3)] :
                     actorType === 'researcher' ? ['Medical University', 'Research Institute', 'Pharma Corp'][Math.floor(Math.random() * 3)] :
                     undefined,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      target: {
        type: targetType,
        id: `target-${Math.floor(Math.random() * 50) + 1}`,
        name: targetType === 'medical_record' ? ['Blood Test Results', 'X-Ray Report', 'Prescription History', 'Vital Signs', 'Allergy Information'][Math.floor(Math.random() * 5)] :
              targetType === 'patient_profile' ? 'Patient Profile' :
              targetType === 'permission_setting' ? 'Privacy Settings' :
              'Data Export',
        category: targetType === 'medical_record' ? ['lab', 'imaging', 'prescription', 'vital', 'allergy'][Math.floor(Math.random() * 5)] : undefined,
        sensitivity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any
      },
      details: {
        description: `${action.charAt(0).toUpperCase() + action.slice(1)} operation performed on ${targetType.replace('_', ' ')}`,
        method: ['web', 'api', 'mobile', 'integration'][Math.floor(Math.random() * 4)] as any,
        location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX'][Math.floor(Math.random() * 4)],
        duration: Math.floor(Math.random() * 300) + 10,
        dataSize: Math.floor(Math.random() * 1000000) + 1000,
        reason: action === 'access_granted' ? 'Patient consent provided' : 
                action === 'share' ? 'Provider collaboration' :
                action === 'export' ? 'Research participation' :
                'Standard access'
      },
      outcome,
      complianceFlags: outcome === 'success' ? [] : ['HIPAA_VIOLATION', 'UNAUTHORIZED_ACCESS'],
      riskScore: outcome === 'success' ? Math.floor(Math.random() * 30) : Math.floor(Math.random() * 70) + 30
    });
  }
  
  return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const mockAuditLogs = generateAuditLogs();

export const mockProviderInteractions: ProviderInteraction[] = [
  {
    id: 'interaction-1',
    providerId: 'p1',
    providerName: 'Dr. Emily Smith',
    providerOrganization: 'City General Hospital',
    interactionType: 'consultation',
    timestamp: '2024-08-22T14:30:00Z',
    duration: 45,
    recordsAccessed: ['blood-test-2024-08-15', 'vital-signs-2024-08-20', 'prescription-history'],
    permissionsUsed: ['basicInfo', 'medicalHistory', 'labResults', 'prescriptions'],
    purpose: 'Annual physical examination and health assessment',
    outcome: 'completed',
    patientConsent: true,
    complianceStatus: 'compliant',
    notes: 'Comprehensive health review completed. Patient counseled on blood pressure management.'
  },
  {
    id: 'interaction-2',
    providerId: 'p2',
    providerName: 'Dr. Michael Brown',
    providerOrganization: 'Metro Imaging Center',
    interactionType: 'data_view',
    timestamp: '2024-08-20T10:15:00Z',
    duration: 15,
    recordsAccessed: ['chest-xray-2024-08-18', 'previous-imaging-2024-06-10'],
    permissionsUsed: ['imaging', 'medicalHistory'],
    purpose: 'Radiology report review and comparison with previous studies',
    outcome: 'completed',
    patientConsent: true,
    complianceStatus: 'compliant',
    notes: 'Imaging comparison completed. No significant changes noted.'
  },
  {
    id: 'interaction-3',
    providerId: 'p4',
    providerName: 'Dr. Jennifer Martinez',
    providerOrganization: 'City Emergency Hospital',
    interactionType: 'access_request',
    timestamp: '2024-08-23T10:30:00Z',
    duration: 5,
    recordsAccessed: [],
    permissionsUsed: [],
    purpose: 'Emergency treatment access request',
    outcome: 'in_progress',
    patientConsent: false,
    complianceStatus: 'under_review',
    notes: 'Emergency access request pending patient approval.'
  },
  {
    id: 'interaction-4',
    providerId: 'p3',
    providerName: 'Dr. Sarah Wilson',
    providerOrganization: 'Wellness Mental Health',
    interactionType: 'record_update',
    timestamp: '2024-08-19T16:45:00Z',
    duration: 30,
    recordsAccessed: ['mental-health-assessment-2024-08-19'],
    permissionsUsed: ['medicalHistory', 'prescriptions'],
    purpose: 'Mental health assessment and treatment plan update',
    outcome: 'completed',
    patientConsent: true,
    complianceStatus: 'compliant',
    notes: 'Treatment plan updated. Follow-up scheduled in 4 weeks.'
  }
];

export const mockDataSharingEvents: DataSharingEvent[] = [
  {
    id: 'sharing-1',
    timestamp: '2024-08-21T09:00:00Z',
    sharingType: 'research_participation',
    dataShared: {
      recordIds: ['blood-test-2024-08-15', 'vital-signs-2024-08-20'],
      categories: ['lab_results', 'vital_signs'],
      sensitivity: 'medium',
      anonymized: true
    },
    recipient: {
      id: 'researcher-1',
      name: 'Dr. Robert Kim',
      type: 'researcher',
      organization: 'Medical Research Institute',
      purpose: 'Cardiovascular disease prevention study'
    },
    permissions: {
      granted: ['lab_results', 'vital_signs', 'demographics'],
      denied: ['genetic_info', 'mental_health'],
      expiry: '2025-08-21T09:00:00Z',
      conditions: ['Data must remain anonymized', 'No re-identification attempts', 'Results shared with participant']
    },
    consentDetails: {
      consentGiven: true,
      consentMethod: 'explicit',
      consentTimestamp: '2024-08-21T08:45:00Z',
      withdrawable: true
    },
    monetization: {
      amount: 25.00,
      currency: 'USD',
      transactionId: 'txn-research-001'
    },
    complianceChecks: {
      hipaaCompliant: true,
      gdprCompliant: true,
      localRegulationsCompliant: true,
      additionalChecks: ['IRB_APPROVED', 'ANONYMIZATION_VERIFIED']
    }
  },
  {
    id: 'sharing-2',
    timestamp: '2024-08-22T14:30:00Z',
    sharingType: 'provider_access',
    dataShared: {
      recordIds: ['blood-test-2024-08-15', 'prescription-history', 'allergy-info'],
      categories: ['lab_results', 'prescriptions', 'allergies'],
      sensitivity: 'high',
      anonymized: false
    },
    recipient: {
      id: 'p1',
      name: 'Dr. Emily Smith',
      type: 'provider',
      organization: 'City General Hospital',
      purpose: 'Annual physical examination'
    },
    permissions: {
      granted: ['basicInfo', 'medicalHistory', 'labResults', 'prescriptions', 'allergies'],
      denied: ['genetic_info', 'mental_health'],
      expiry: '2024-09-22T14:30:00Z',
      conditions: ['Access limited to consultation period', 'No data retention beyond 30 days']
    },
    consentDetails: {
      consentGiven: true,
      consentMethod: 'explicit',
      consentTimestamp: '2024-08-22T14:25:00Z',
      withdrawable: true
    },
    complianceChecks: {
      hipaaCompliant: true,
      gdprCompliant: true,
      localRegulationsCompliant: true,
      additionalChecks: ['PROVIDER_VERIFIED', 'PURPOSE_VALIDATED']
    }
  },
  {
    id: 'sharing-3',
    timestamp: '2024-08-18T11:20:00Z',
    sharingType: 'marketplace_sale',
    dataShared: {
      recordIds: ['demographic-info', 'lifestyle-data'],
      categories: ['demographics', 'lifestyle'],
      sensitivity: 'low',
      anonymized: true
    },
    recipient: {
      id: 'pharma-corp-1',
      name: 'HealthTech Analytics',
      type: 'researcher',
      organization: 'HealthTech Analytics Corp',
      purpose: 'Population health analytics and drug development'
    },
    permissions: {
      granted: ['demographics', 'lifestyle'],
      denied: ['medical_history', 'genetic_info', 'mental_health'],
      conditions: ['Aggregate analysis only', 'No individual profiling', 'Data deletion after 2 years']
    },
    consentDetails: {
      consentGiven: true,
      consentMethod: 'opt_in',
      consentTimestamp: '2024-08-18T11:15:00Z',
      withdrawable: true
    },
    monetization: {
      amount: 15.50,
      currency: 'USD',
      transactionId: 'txn-marketplace-003'
    },
    complianceChecks: {
      hipaaCompliant: true,
      gdprCompliant: true,
      localRegulationsCompliant: true,
      additionalChecks: ['MARKETPLACE_VERIFIED', 'BUYER_CERTIFIED']
    }
  }
];

export const mockComplianceMetrics: ComplianceMetric[] = [
  {
    id: 'hipaa-1',
    category: 'hipaa',
    metric: 'Data Access Compliance Rate',
    value: 98.5,
    unit: '%',
    status: 'compliant',
    lastAssessed: '2024-08-23T00:00:00Z',
    nextReview: '2024-09-23T00:00:00Z',
    description: 'Percentage of data access requests that comply with HIPAA authorization requirements',
    requirements: [
      'Valid patient authorization',
      'Minimum necessary standard',
      'Purpose limitation',
      'Access logging'
    ]
  },
  {
    id: 'hipaa-2',
    category: 'hipaa',
    metric: 'Breach Notification Compliance',
    value: 100,
    unit: '%',
    status: 'compliant',
    lastAssessed: '2024-08-23T00:00:00Z',
    nextReview: '2024-09-23T00:00:00Z',
    description: 'Compliance with HIPAA breach notification requirements within 60 days',
    requirements: [
      'Breach assessment within 24 hours',
      'Patient notification within 60 days',
      'HHS notification within 60 days',
      'Media notification if applicable'
    ]
  },
  {
    id: 'gdpr-1',
    category: 'gdpr',
    metric: 'Consent Management Compliance',
    value: 96.2,
    unit: '%',
    status: 'compliant',
    lastAssessed: '2024-08-23T00:00:00Z',
    nextReview: '2024-09-23T00:00:00Z',
    description: 'Compliance with GDPR consent requirements for data processing',
    requirements: [
      'Explicit consent obtained',
      'Consent withdrawal mechanism',
      'Purpose specification',
      'Consent record maintenance'
    ]
  },
  {
    id: 'gdpr-2',
    category: 'gdpr',
    metric: 'Data Subject Rights Response Time',
    value: 25,
    unit: 'days',
    status: 'compliant',
    lastAssessed: '2024-08-23T00:00:00Z',
    nextReview: '2024-09-23T00:00:00Z',
    description: 'Average response time to data subject rights requests (GDPR requires ≤30 days)',
    requirements: [
      'Response within 30 days',
      'Identity verification',
      'Request fulfillment',
      'Response documentation'
    ]
  },
  {
    id: 'security-1',
    category: 'organizational_policy',
    metric: 'Security Incident Response Time',
    value: 4.2,
    unit: 'hours',
    status: 'compliant',
    lastAssessed: '2024-08-23T00:00:00Z',
    nextReview: '2024-09-23T00:00:00Z',
    description: 'Average time to respond to security incidents (target: ≤6 hours)',
    requirements: [
      'Incident detection',
      'Initial response within 6 hours',
      'Stakeholder notification',
      'Incident documentation'
    ]
  },
  {
    id: 'audit-1',
    category: 'organizational_policy',
    metric: 'Audit Log Completeness',
    value: 99.8,
    unit: '%',
    status: 'compliant',
    lastAssessed: '2024-08-23T00:00:00Z',
    nextReview: '2024-09-23T00:00:00Z',
    description: 'Percentage of system activities with complete audit trail records',
    requirements: [
      'All access events logged',
      'Tamper-evident logging',
      'Log retention for 6 years',
      'Regular log review'
    ],
    violations: {
      count: 2,
      lastViolation: '2024-08-10T15:30:00Z',
      severity: 'low'
    }
  }
];

export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'security-1',
    timestamp: '2024-08-23T02:15:00Z',
    eventType: 'suspicious_activity',
    severity: 'medium',
    source: {
      ipAddress: '203.0.113.45',
      location: 'Unknown Location',
      userAgent: 'Automated Bot/1.0',
      userId: undefined
    },
    description: 'Multiple failed login attempts from unknown IP address',
    actionTaken: 'IP address temporarily blocked, security team notified',
    resolved: true,
    investigationStatus: 'closed'
  },
  {
    id: 'security-2',
    timestamp: '2024-08-22T18:45:00Z',
    eventType: 'failed_access',
    severity: 'low',
    source: {
      ipAddress: '192.168.1.100',
      location: 'New York, NY',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      userId: 'user-123'
    },
    description: 'User attempted to access restricted medical records without proper permissions',
    actionTaken: 'Access denied, user notified of permission requirements',
    resolved: true,
    investigationStatus: 'closed'
  },
  {
    id: 'security-3',
    timestamp: '2024-08-21T14:20:00Z',
    eventType: 'system_anomaly',
    severity: 'high',
    source: {
      ipAddress: '10.0.0.50',
      location: 'Internal Network',
      userAgent: 'System Process',
      userId: undefined
    },
    description: 'Unusual data export volume detected - 500% above normal baseline',
    actionTaken: 'Export temporarily suspended, investigation initiated',
    resolved: false,
    investigationStatus: 'in_progress'
  }
];

export const getComplianceScore = (): number => {
  const compliantMetrics = mockComplianceMetrics.filter(m => m.status === 'compliant').length;
  return Math.round((compliantMetrics / mockComplianceMetrics.length) * 100);
};

export const getAuditSummary = () => {
  const totalLogs = mockAuditLogs.length;
  const successfulActions = mockAuditLogs.filter(log => log.outcome === 'success').length;
  const failedActions = mockAuditLogs.filter(log => log.outcome === 'failure').length;
  const blockedActions = mockAuditLogs.filter(log => log.outcome === 'blocked').length;
  const highRiskEvents = mockAuditLogs.filter(log => log.riskScore > 70).length;
  
  return {
    totalLogs,
    successfulActions,
    failedActions,
    blockedActions,
    highRiskEvents,
    successRate: Math.round((successfulActions / totalLogs) * 100)
  };
};
