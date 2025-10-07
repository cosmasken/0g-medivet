// Mock data for Netlify deployment
export const mockUsers = [
  {
    id: 'user-1',
    wallet_address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    role: 'patient',
    user_profiles: [{
      full_name: 'John Doe',
      email: 'john@example.com',
      profile_completed: true
    }],
    is_onboarded: true
  },
  {
    id: 'user-2',
    wallet_address: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    role: 'provider',
    user_profiles: [{
      full_name: 'Dr. Jane Smith',
      email: 'jane@provider.com',
      profile_completed: true
    }],
    is_onboarded: true
  }
];

export const mockMedicalRecords = [
  {
    id: 'record-1',
    user_id: 'user-1', // John Doe
    title: 'Annual Physical Examination',
    description: 'Complete physical examination with normal results',
    category: 'visit',
    created_at: '2024-01-15T10:30:00Z',
    file_type: 'pdf',
    file_size: 2500000,
    zero_g_hash: '0xabc123def456',
    upload_status: 'completed'
  },
  {
    id: 'record-2',
    user_id: 'user-1', // John Doe
    title: 'Blood Test Results',
    description: 'Comprehensive metabolic panel and lipid panel',
    category: 'lab',
    created_at: '2024-02-20T09:15:00Z',
    file_type: 'pdf',
    file_size: 1800000,
    zero_g_hash: '0xdef456ghi789',
    upload_status: 'completed'
  },
  {
    id: 'record-3',
    user_id: 'user-1', // John Doe
    title: 'Chest X-Ray Report',
    description: 'Chest X-ray showing normal findings',
    category: 'imaging',
    created_at: '2024-03-10T14:20:00Z',
    file_type: 'pdf',
    file_size: 3200000,
    zero_g_hash: '0xghi789jkl012',
    upload_status: 'completed'
  }
];

export const mockProviderPatientRelationships = [
  {
    id: 'rel-1',
    provider_id: 'user-2', // Dr. Jane Smith
    patient_id: 'user-1', // John Doe
    relationship_type: 'primary_care',
    notes: 'Primary care physician relationship',
    created_at: '2023-12-01T00:00:00Z'
  }
];

export const mockProviderPermissions = [
  {
    id: 'perm-1',
    patient_id: 'user-1',
    provider_id: 'user-2',
    record_id: 'record-1',
    permission_level: 'view',
    granted_at: '2023-12-01T00:00:00Z',
    medical_record: {
      title: 'Annual Physical Examination',
      description: 'Complete physical examination with normal results',
      category: 'visit'
    }
  },
  {
    id: 'perm-2',
    patient_id: 'user-1',
    provider_id: 'user-2',
    record_id: 'record-2',
    permission_level: 'view',
    granted_at: '2023-12-01T00:00:00Z',
    medical_record: {
      title: 'Blood Test Results',
      description: 'Comprehensive metabolic panel and lipid panel',
      category: 'lab'
    }
  },
  {
    id: 'perm-3',
    patient_id: 'user-1',
    provider_id: 'user-2',
    record_id: 'record-3',
    permission_level: 'view',
    granted_at: '2023-12-01T00:00:00Z',
    medical_record: {
      title: 'Chest X-Ray Report',
      description: 'Chest X-ray showing normal findings',
      category: 'imaging'
    }
  }
];

export const mockAuditLogs = [
  {
    id: 'log-1',
    user_id: 'user-2',
    action: 'VIEW_RECORD',
    resource_type: 'medical_record',
    resource_id: 'record-1',
    details: {
      patient_id: 'user-1',
      accessed_by: 'user-2',
      payment_processed: true,
      payment_amount: 0.001
    },
    timestamp: '2024-05-01T10:00:00Z'
  },
  {
    id: 'log-2',
    user_id: 'user-2',
    action: 'VIEW_RECORD',
    resource_type: 'medical_record',
    resource_id: 'record-2',
    details: {
      patient_id: 'user-1',
      accessed_by: 'user-2',
      payment_processed: true,
      payment_amount: 0.001
    },
    timestamp: '2024-05-02T14:30:00Z'
  }
];

export const mockHealthMetrics = [
  {
    id: 'metric-1',
    user_id: 'user-1',
    type: 'blood_pressure',
    value: '120/80',
    unit: 'mmHg',
    timestamp: '2024-05-01T08:00:00Z',
    notes: 'Normal blood pressure reading'
  },
  {
    id: 'metric-2',
    user_id: 'user-1',
    type: 'heart_rate',
    value: 72,
    unit: 'bpm',
    timestamp: '2024-05-01T08:00:00Z',
    notes: 'Resting heart rate'
  }
];

export const mockMedications = [
  {
    id: 'med-1',
    user_id: 'user-1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'daily',
    prescribed_by: 'Dr. Jane Smith',
    start_date: '2024-01-01',
    is_active: true
  }
];

export const mockFamilyMembers = [
  {
    id: 'family-1',
    patient_id: 'user-1',
    first_name: 'Jane',
    last_name: 'Doe',
    relationship: 'spouse',
    date_of_birth: '1990-05-15',
    is_dependent: true
  }
];