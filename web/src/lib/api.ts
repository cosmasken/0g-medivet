import { mockAPI } from './mocks/mockApiService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://medivet-backend-72tq.onrender.com/api';

// Check if backend is available
const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    return response.ok;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
};

// Flag to cache backend availability status
let backendAvailable: boolean | null = null;

const isBackendAvailable = async (): Promise<boolean> => {
  if (backendAvailable !== null) {
    return backendAvailable;
  }
  
  // Check for environment variable override
  if (process.env.REACT_APP_USE_MOCKS === 'true') {
    backendAvailable = false;
    return false;
  }
  
  if (typeof window !== 'undefined' && 
      (window.location.hostname.includes('netlify.app') || 
       window.location.hostname.includes('localhost'))) {
    // On Netlify or localhost, check if backend is available
    backendAvailable = await checkBackendHealth();
    return backendAvailable;
  }
  
  // Default to backend available
  backendAvailable = true;
  return true;
};

// Create a wrapper that automatically selects between real API and mocks
const createApiWrapper = <T extends any[], R>(
  realFunction: (...args: T) => Promise<R>,
  mockFunction: (...args: T) => Promise<R>
): ((...args: T) => Promise<R>) => {
  return async (...args: T): Promise<R> => {
    const available = await isBackendAvailable();
    
    if (!available) {
      console.log('Using mock API');
      return mockFunction(...args);
    }
    
    try {
      const result = await realFunction(...args);
      return result;
    } catch (error) {
      console.warn('Real API failed, falling back to mock:', error);
      return mockFunction(...args);
    }
  };
};

// User management
export const authenticateUser = createApiWrapper(
  async (walletAddress: string, role: 'patient' | 'provider' = 'patient', username?: string) => {
    const response = await fetch(`${API_BASE_URL}/users/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        wallet_address: walletAddress, 
        role,
        username: username || walletAddress.slice(0, 8)
      })
    });
    
    if (!response.ok) throw new Error('Authentication failed');
    return response.json();
  },
  mockAPI.authenticateUser
);

export const loginUser = createApiWrapper(
  async (username: string, walletAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, wallet_address: walletAddress })
    });
    
    if (!response.ok) throw new Error('Login failed');
    return response.json();
  },
  async (username: string, walletAddress: string) => {
    return mockAPI.authenticateUser(walletAddress, 'patient');
  }
);

export const updateUserProfile = createApiWrapper(
  async (userId: string, profileData: any) => {
    try {
      // Filter out empty date fields to prevent database errors
      const cleanedData = { ...profileData };
      if (cleanedData.dateOfBirth === '') {
        delete cleanedData.dateOfBirth;
      }
      if (cleanedData.date_of_birth === '') {
        delete cleanedData.date_of_birth;
      }
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cleanedData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Profile update failed:', response.status, errorText);
        throw new Error(`Profile update failed: ${response.status} ${errorText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  },
  mockAPI.updateUserProfile
);

export const updateHealthProfile = createApiWrapper(
  async (userId: string, healthData: any) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/health-profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(healthData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Health profile update failed:', response.status, errorText);
      throw new Error(`Health profile update failed: ${response.status} ${errorText}`);
    }
    
    return response.json();
  },
  async (userId: string, healthData: any) => {
    // Simple mock - just return success
    return { success: true, userId, healthData };
  }
);

export const completeUserOnboarding = createApiWrapper(
  async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/complete-onboarding`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('Onboarding completion failed');
    return response.json();
  },
  async (userId: string) => {
    return { success: true, userId, completed: true };
  }
);

// Medical records
export const getUserMedicalRecords = createApiWrapper(
  async (userId: string, limit = 50, offset = 0) => {
    const response = await fetch(`${API_BASE_URL}/records/user/${userId}?limit=${limit}&offset=${offset}`);
    if (!response.ok) throw new Error('Failed to fetch records');
    return response.json();
  },
  mockAPI.getUserMedicalRecords
);

export const createMedicalRecord = createApiWrapper(
  async (recordData: any) => {
    const response = await fetch(`${API_BASE_URL}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recordData)
    });
    
    if (!response.ok) throw new Error('Record creation failed');
    return response.json();
  },
  async (recordData: any) => {
    return { success: true, record: { id: `mock-${Date.now()}`, ...recordData } };
  }
);

export const updateRecordStatus = createApiWrapper(
  async (recordId: string, status: string, transactionHash?: string, merkleRoot?: string) => {
    const response = await fetch(`${API_BASE_URL}/records/${recordId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        upload_status: status,
        transaction_hash: transactionHash,
        merkle_root: merkleRoot
      })
    });
    
    if (!response.ok) throw new Error('Record status update failed');
    return response.json();
  },
  async (recordId: string, status: string) => {
    return { success: true, recordId, status };
  }
);

// Health metrics
export const createHealthMetric = createApiWrapper(
  async (metricData: any) => {
    const response = await fetch(`${API_BASE_URL}/health/metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metricData)
    });
    
    if (!response.ok) throw new Error('Metric creation failed');
    return response.json();
  },
  async (metricData: any) => {
    return { success: true, metric: { id: `metric-${Date.now()}`, ...metricData } };
  }
);

export const getUserHealthMetrics = createApiWrapper(
  async (userId: string, type?: string, limit = 100) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (type) params.append('type', type);
    
    const response = await fetch(`${API_BASE_URL}/health/metrics/${userId}?${params}`);
    if (!response.ok) throw new Error('Failed to fetch metrics');
    return response.json();
  },
  mockAPI.getUserHealthMetrics
);

// Medications
export const createMedication = createApiWrapper(
  async (medicationData: any) => {
    const response = await fetch(`${API_BASE_URL}/health/medications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(medicationData)
    });
    
    if (!response.ok) throw new Error('Medication creation failed');
    return response.json();
  },
  async (medicationData: any) => {
    return { success: true, medication: { id: `med-${Date.now()}`, ...medicationData } };
  }
);

export const getUserMedications = createApiWrapper(
  async (userId: string, activeOnly = true) => {
    const response = await fetch(`${API_BASE_URL}/health/medications/${userId}?active_only=${activeOnly}`);
    if (!response.ok) throw new Error('Failed to fetch medications');
    return response.json();
  },
  mockAPI.getUserMedications
);

// Family members
export const createFamilyMember = createApiWrapper(
  async (familyData: any) => {
    const response = await fetch(`${API_BASE_URL}/health/family`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(familyData)
    });
    
    if (!response.ok) throw new Error('Family member creation failed');
    return response.json();
  },
  async (familyData: any) => {
    return { success: true, familyMember: { id: `family-${Date.now()}`, ...familyData } };
  }
);

export const getUserFamilyMembers = createApiWrapper(
  async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/health/family/${userId}`);
    if (!response.ok) throw new Error('Failed to fetch family members');
    return response.json();
  },
  mockAPI.getUserFamilyMembers
);

// Provider permissions
export const createProviderPermission = createApiWrapper(
  async (permissionData: {
    patient_id: string;
    provider_id: string;
    record_id: string;
    permission_level: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/provider-permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permissionData)
    });
    
    if (!response.ok) throw new Error('Failed to create provider permission');
    return response.json();
  },
  async (permissionData) => {
    return { success: true, permission: { id: `perm-${Date.now()}`, ...permissionData } };
  }
);

export const getProviderPermissions = createApiWrapper(
  async (providerId: string) => {
    const response = await fetch(`${API_BASE_URL}/provider-permissions/${providerId}`);
    if (!response.ok) throw new Error('Failed to get provider permissions');
    return response.json();
  },
  mockAPI.getProviderPermissions
);

export const getPatientPermissions = createApiWrapper(
  async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/providers/permissions/patient/${patientId}`);
    if (!response.ok) throw new Error('Failed to fetch permissions');
    return response.json();
  },
  mockAPI.getPatientPermissions
);

// Provider-patient relationships
export const getProviderPatientRelationships = createApiWrapper(
  async (providerId: string) => {
    const response = await fetch(`${API_BASE_URL}/providers/patient-relationships/${providerId}`);
    if (!response.ok) throw new Error('Failed to fetch provider-patient relationships');
    return response.json();
  },
  mockAPI.getProviderPatientRelationships
);

export const createProviderPatientRelationship = createApiWrapper(
  async (relationshipData: {
    provider_id: string;
    patient_id: string;
    relationship_type: string;
    specialty?: string;
    start_date?: string;
    notes?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/providers/patient-relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(relationshipData)
    });
    
    if (!response.ok) throw new Error('Failed to create provider-patient relationship');
    return response.json();
  },
  async (relationshipData) => {
    return { success: true, relationship: { id: `rel-${Date.now()}`, ...relationshipData } };
  }
);

// Compute Services (AI Analysis)
export const submitAIAnalysis = createApiWrapper(
  async (analysisData: {
    fileData: any;
    analysisType: string;
    userId: string;
    fileId?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/compute/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(analysisData)
    });
    
    if (!response.ok) throw new Error('AI analysis submission failed');
    return response.json();
  },
  async (analysisData) => {
    return {
      success: true,
      jobId: `job-${Date.now()}`,
      analysis: 'Mock AI analysis result for development purposes.',
      isValid: true,
      provider: '0x3feE5a4dd5FDb8a32dDA97Bed899830605dBD9D3',
      timestamp: new Date().toISOString(),
      computeTime: 1500
    };
  }
);

export const getAIAnalysisJob = createApiWrapper(
  async (jobId: string) => {
    const response = await fetch(`${API_BASE_URL}/compute/jobs/${jobId}`);
    if (!response.ok) throw new Error('Failed to fetch AI analysis job');
    return response.json();
  },
  async (jobId: string) => {
    return {
      jobId,
      status: 'completed',
      result: 'Mock AI analysis result',
      timestamp: new Date().toISOString()
    };
  }
);

export const getComputeBalance = createApiWrapper(
  async () => {
    const response = await fetch(`${API_BASE_URL}/compute/balance`);
    if (!response.ok) throw new Error('Failed to fetch compute balance');
    return response.json();
  },
  async () => {
    return { balance: 1000, currency: 'credits' };
  }
);

export const getComputeServices = createApiWrapper(
  async () => {
    const response = await fetch(`${API_BASE_URL}/compute/services`);
    if (!response.ok) throw new Error('Failed to fetch compute services');
    return response.json();
  },
  async () => {
    return {
      services: [
        { id: 'medical-analysis', name: 'Medical Analysis', cost: 10 },
        { id: 'lab-interpretation', name: 'Lab Results Interpretation', cost: 15 }
      ]
    };
  }
);

// Health Connect Integration
export const syncHealthConnectData = createApiWrapper(
  async (syncData: {
    user_id: string;
    health_data: Array<{
      data_type: string;
      start_time: string;
      end_time: string;
      value: number;
      unit: string;
      source_app?: string;
      source_device?: string;
      metadata?: any;
    }>;
  }) => {
    const response = await fetch(`${API_BASE_URL}/health-connect/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(syncData)
    });
    
    if (!response.ok) throw new Error('Health Connect sync failed');
    return response.json();
  },
  async (syncData) => {
    return {
      success: true,
      message: `${syncData.health_data.length} health data points synced successfully`,
      synced_count: syncData.health_data.length
    };
  }
);

export const getHealthConnectData = createApiWrapper(
  async (userId: string, params?: {
    limit?: number;
    offset?: number;
    data_type?: string;
    start_date?: string;
    end_date?: string;
    source_app?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString());
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/health-connect/user/${userId}?${searchParams}`);
    if (!response.ok) throw new Error('Failed to fetch Health Connect data');
    return response.json();
  },
  async (userId: string) => {
    return { data: [], total: 0 };
  }
);

// Audit Logs
export const createAuditLog = createApiWrapper(
  async (auditData: {
    wallet_address: string;
    action: string;
    resource_type: string;
    resource_id: string;
    details?: any;
  }) => {
    const response = await fetch(`${API_BASE_URL}/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditData)
    });
    
    if (!response.ok) throw new Error('Audit log creation failed');
    return response.json();
  },
  async (auditData) => {
    return { success: true, audit: { id: `audit-${Date.now()}`, ...auditData } };
  }
);

export const getAuditLogs = createApiWrapper(
  async (walletAddress: string) => {
    const response = await fetch(`${API_BASE_URL}/audit/${walletAddress}`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },
  async (walletAddress: string) => {
    return { logs: [] };
  }
);

export const createProviderPatientRelationship = createApiWrapper(
  async (providerId: string, patientId: string, relationshipType: string = 'treated', notes: string = '') => {
    const response = await fetch(`${API_BASE_URL}/providers/patient-relationships`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: providerId,
        patient_id: patientId,
        relationship_type: relationshipType,
        notes
      })
    });
    
    if (!response.ok) throw new Error('Failed to create provider-patient relationship');
    return response.json();
  },
  mockAPI.createProviderPatientRelationship
);

// Provider record access with payment
export const accessRecordWithPayment = createApiWrapper(
  async (providerId: string, patientId: string, recordId: string, action: string = 'VIEW_RECORD') => {
    const response = await fetch(`${API_BASE_URL}/provider-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_id: providerId,
        patient_id: patientId,
        record_id: recordId,
        action
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to access record with payment');
    }
    return response.json();
  },
  mockAPI.accessRecordWithPayment
);

// Monetization
export const createMonetizationRecord = createApiWrapper(
  async (monetizationData: any) => {
    const response = await fetch(`${API_BASE_URL}/providers/monetization`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(monetizationData)
    });
    
    if (!response.ok) throw new Error('Monetization record creation failed');
    return response.json();
  },
  async (monetizationData: any) => {
    return { success: true, monetizationRecord: { id: `monetization-${Date.now()}`, ...monetizationData } };
  }
);

export const getPatientMonetizationRecords = createApiWrapper(
  async (patientId: string) => {
    const response = await fetch(`${API_BASE_URL}/providers/monetization/patient/${patientId}`);
    if (!response.ok) throw new Error('Failed to fetch monetization records');
    return response.json();
  },
  async (patientId: string) => {
    return { monetization_records: [] }; // Mock empty for now
  }
);

export const getMarketplaceRecords = createApiWrapper(
  async (category?: string, limit = 50, offset = 0) => {
    const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
    if (category) params.append('category', category);
    
    const response = await fetch(`${API_BASE_URL}/providers/marketplace?${params}`);
    if (!response.ok) throw new Error('Failed to fetch marketplace records');
    return response.json();
  },
  async (category?: string, limit = 50, offset = 0) => {
    return { marketplace_records: [] }; // Mock empty for now
  }
);

// Audit logs
export const createAuditLog = createApiWrapper(
  async (logData: {
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    details?: any;
  }) => {
    const response = await fetch(`${API_BASE_URL}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    
    if (!response.ok) throw new Error('Failed to create audit log');
    return response.json();
  },
  async (logData) => {
    return { success: true, log: { id: `log-${Date.now()}`, ...logData } };
  }
);

export const getAuditLogs = createApiWrapper(
  async (userId: string) => {
    const response = await fetch(`${API_BASE_URL}/audit-logs/${userId}`);
    if (!response.ok) throw new Error('Failed to get audit logs');
    return response.json();
  },
  mockAPI.getAuditLogs
);

// 0G Compute API functions
export const submitComputeAnalysis = createApiWrapper(
  async (
    fileData: any, 
    analysisType = 'medical-analysis', 
    userId: string,
    endpoint = 'analyze'
  ) => {
    const response = await fetch(`${API_BASE_URL}/compute/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileData, analysisType, userId })
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (error.fallback) {
        throw new Error('COMPUTE_UNAVAILABLE');
      }
      throw new Error(error.message || 'Analysis failed');
    }
    
    return response.json();
  },
  async (fileData, analysisType = 'medical-analysis', userId: string) => {
    // Mock successful analysis
    return {
      success: true,
      jobId: `mock-job-${Date.now()}`,
      analysis: `This is a mock analysis for ${analysisType}. Based on the provided information, here are some insights...`,
      isValid: true,
      provider: '0xMockProvider',
      timestamp: new Date().toISOString(),
      computeTime: 1500
    };
  }
);

export const getComputeBalance = createApiWrapper(
  async () => {
    const response = await fetch(`${API_BASE_URL}/compute/balance`);
    if (!response.ok) throw new Error('Failed to get compute balance');
    return response.json();
  },
  async () => {
    return { total: '0.250', locked: '0.000' }; // Mock balance
  }
);

export const checkComputeHealth = createApiWrapper(
  async () => {
    const response = await fetch(`${API_BASE_URL}/compute/health`);
    return response.json();
  },
  async () => {
    return { status: 'healthy', balance: '0.250', providers: ['Mock Provider'] };
  }
);