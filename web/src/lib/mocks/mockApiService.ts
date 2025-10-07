import { 
  mockUsers, 
  mockMedicalRecords, 
  mockProviderPatientRelationships, 
  mockProviderPermissions, 
  mockAuditLogs, 
  mockHealthMetrics,
  mockMedications,
  mockFamilyMembers
} from './apiMocks';

// Mock delay to simulate network requests
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Flag to determine if we're in a mock environment (e.g., Netlify)
const isMockEnvironment = () => {
  // Check if we're running on Netlify or if the backend is unavailable
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('netlify.app') || 
          process.env.REACT_APP_USE_MOCKS === 'true');
};

// Create a wrapper for API calls that falls back to mocks
const createMockableAPI = <T>(
  realFunction: () => Promise<T>,
  mockFunction: () => Promise<T>
): (() => Promise<T>) => {
  return async (): Promise<T> => {
    if (isMockEnvironment()) {
      console.log('Using mock data for API call');
      return mockFunction();
    }
    
    try {
      return await realFunction();
    } catch (error) {
      console.warn('Real API failed, falling back to mock:', error);
      return mockFunction();
    }
  };
};

// Mock API implementations
export const mockAPI = {
  // Authentication
  authenticateUser: async (walletAddress: string, role: 'patient' | 'provider' = 'patient') => {
    await mockDelay();
    const user = mockUsers.find(u => u.wallet_address === walletAddress);
    
    if (!user) {
      // Create a new user if not found
      const newUser = {
        id: `user-${Date.now()}`,
        wallet_address: walletAddress,
        role,
        user_profiles: [{
          full_name: role === 'patient' ? 'New Patient' : 'New Provider',
          email: '',
          profile_completed: false
        }],
        is_onboarded: false
      };
      mockUsers.push(newUser);
      return { user: newUser };
    }
    
    return { user };
  },

  // User profile
  updateUserProfile: async (userId: string, profileData: any) => {
    await mockDelay();
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      mockUsers[userIndex].user_profiles = [{
        ...mockUsers[userIndex].user_profiles[0],
        ...profileData
      }];
      return { user: mockUsers[userIndex] };
    }
    throw new Error('User not found');
  },

  // Medical records
  getUserMedicalRecords: async (userId: string, limit = 50, offset = 0) => {
    await mockDelay();
    const userRecords = mockMedicalRecords.filter(record => record.user_id === userId);
    return { 
      records: userRecords.slice(offset, offset + limit) 
    };
  },

  // Provider permissions
  getProviderPermissions: async (providerId: string) => {
    await mockDelay();
    const permissions = mockProviderPermissions.filter(p => p.provider_id === providerId);
    return { permissions };
  },

  getPatientPermissions: async (patientId: string) => {
    await mockDelay();
    const permissions = mockProviderPermissions.filter(p => p.patient_id === patientId);
    return { permissions };
  },

  // Provider-patient relationships
  getProviderPatientRelationships: async (providerId: string) => {
    await mockDelay();
    const relationships = mockProviderPatientRelationships.filter(r => r.provider_id === providerId);
    return { relationships };
  },

  createProviderPatientRelationship: async (providerId: string, patientId: string, relationshipType: string = 'treated', notes: string = '') => {
    await mockDelay();
    
    // Check if relationship already exists
    const existing = mockProviderPatientRelationships.find(
      r => r.provider_id === providerId && r.patient_id === patientId
    );
    
    if (existing) {
      // Update existing
      existing.relationship_type = relationshipType;
      existing.notes = notes;
      existing.updated_at = new Date().toISOString();
      return { relationship: existing };
    } else {
      // Create new
      const newRelationship = {
        id: `rel-${Date.now()}`,
        provider_id: providerId,
        patient_id: patientId,
        relationship_type: relationshipType,
        notes,
        created_at: new Date().toISOString()
      };
      mockProviderPatientRelationships.push(newRelationship);
      return { relationship: newRelationship };
    }
  },

  // Record access with payment
  accessRecordWithPayment: async (providerId: string, patientId: string, recordId: string, action: string = 'VIEW_RECORD') => {
    await mockDelay();
    
    // Find the record
    const record = mockMedicalRecords.find(r => r.id === recordId && r.user_id === patientId);
    if (!record) {
      throw new Error('Record not found');
    }
    
    // Create a mock audit log entry
    const auditLog = {
      id: `log-${Date.now()}`,
      user_id: providerId,
      action,
      resource_type: 'medical_record',
      resource_id: recordId,
      details: {
        patient_id: patientId,
        accessed_by: providerId,
        payment_processed: true,
        payment_amount: 0.001
      },
      timestamp: new Date().toISOString()
    };
    
    mockAuditLogs.push(auditLog);
    
    return {
      success: true,
      message: 'Record access granted with auto-payment to patient',
      payment_amount: 0.001,
      provider_wallet: mockUsers.find(u => u.id === providerId)?.wallet_address,
      patient_wallet: mockUsers.find(u => u.id === patientId)?.wallet_address,
      audit_log: auditLog
    };
  },

  // Audit logs
  getAuditLogs: async (userId: string) => {
    await mockDelay();
    const logs = mockAuditLogs.filter(log => log.user_id === userId);
    return { logs };
  },

  // Health metrics
  getUserHealthMetrics: async (userId: string, type?: string, limit = 100) => {
    await mockDelay();
    let metrics = mockHealthMetrics.filter(metric => metric.user_id === userId);
    
    if (type) {
      metrics = metrics.filter(metric => metric.type === type);
    }
    
    return { metrics: metrics.slice(0, limit) };
  },

  // Medications
  getUserMedications: async (userId: string, activeOnly = true) => {
    await mockDelay();
    let medications = mockMedications.filter(med => med.user_id === userId);
    
    if (activeOnly) {
      medications = medications.filter(med => med.is_active);
    }
    
    return { medications };
  },

  // Family members
  getUserFamilyMembers: async (userId: string) => {
    await mockDelay();
    const familyMembers = mockFamilyMembers.filter(fm => fm.patient_id === userId);
    return { familyMembers };
  }
};