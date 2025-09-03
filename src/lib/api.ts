const API_BASE_URL = 'https://medivet-production.up.railway.app/api';

// User management
export const authenticateUser = async (walletAddress: string, role: 'patient' | 'provider' = 'patient') => {
  const response = await fetch(`${API_BASE_URL}/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: walletAddress, role })
  });
  
  if (!response.ok) throw new Error('Authentication failed');
  return response.json();
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) throw new Error('Profile update failed');
  return response.json();
};

export const completeUserOnboarding = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/complete-onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) throw new Error('Onboarding completion failed');
  return response.json();
};

// Medical records
export const createMedicalRecord = async (recordData: any) => {
  const response = await fetch(`${API_BASE_URL}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData)
  });
  
  if (!response.ok) throw new Error('Record creation failed');
  return response.json();
};

export const getUserMedicalRecords = async (userId: string, limit = 50, offset = 0) => {
  const response = await fetch(`${API_BASE_URL}/records/user/${userId}?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch records');
  return response.json();
};

// Health metrics
export const createHealthMetric = async (metricData: any) => {
  const response = await fetch(`${API_BASE_URL}/health/metrics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(metricData)
  });
  
  if (!response.ok) throw new Error('Metric creation failed');
  return response.json();
};

export const getUserHealthMetrics = async (userId: string, type?: string, limit = 100) => {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (type) params.append('type', type);
  
  const response = await fetch(`${API_BASE_URL}/health/metrics/${userId}?${params}`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
};

// Medications
export const createMedication = async (medicationData: any) => {
  const response = await fetch(`${API_BASE_URL}/health/medications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(medicationData)
  });
  
  if (!response.ok) throw new Error('Medication creation failed');
  return response.json();
};

export const getUserMedications = async (userId: string, activeOnly = true) => {
  const response = await fetch(`${API_BASE_URL}/health/medications/${userId}?active_only=${activeOnly}`);
  if (!response.ok) throw new Error('Failed to fetch medications');
  return response.json();
};

// Family members
export const createFamilyMember = async (familyData: any) => {
  const response = await fetch(`${API_BASE_URL}/health/family`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(familyData)
  });
  
  if (!response.ok) throw new Error('Family member creation failed');
  return response.json();
};

export const getUserFamilyMembers = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/health/family/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch family members');
  return response.json();
};

// Provider permissions
export const createProviderPermission = async (permissionData: any) => {
  const response = await fetch(`${API_BASE_URL}/providers/permissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(permissionData)
  });
  
  if (!response.ok) throw new Error('Permission creation failed');
  return response.json();
};

export const getPatientPermissions = async (patientId: string) => {
  const response = await fetch(`${API_BASE_URL}/providers/permissions/patient/${patientId}`);
  if (!response.ok) throw new Error('Failed to fetch permissions');
  return response.json();
};

export const getProviderPermissions = async (providerId: string) => {
  const response = await fetch(`${API_BASE_URL}/providers/permissions/provider/${providerId}`);
  if (!response.ok) throw new Error('Failed to fetch permissions');
  return response.json();
};

// Monetization
export const createMonetizationRecord = async (monetizationData: any) => {
  const response = await fetch(`${API_BASE_URL}/providers/monetization`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(monetizationData)
  });
  
  if (!response.ok) throw new Error('Monetization record creation failed');
  return response.json();
};

export const getPatientMonetizationRecords = async (patientId: string) => {
  const response = await fetch(`${API_BASE_URL}/providers/monetization/patient/${patientId}`);
  if (!response.ok) throw new Error('Failed to fetch monetization records');
  return response.json();
};

export const getMarketplaceRecords = async (category?: string, limit = 50, offset = 0) => {
  const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  if (category) params.append('category', category);
  
  const response = await fetch(`${API_BASE_URL}/providers/marketplace?${params}`);
  if (!response.ok) throw new Error('Failed to fetch marketplace records');
  return response.json();
};

// Audit logs
export const createAuditLog = async (logData: any) => {
  const response = await fetch(`${API_BASE_URL}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  });
  
  if (!response.ok) throw new Error('Audit log creation failed');
  return response.json();
};

export const getUserAuditLogs = async (walletAddress: string, limit = 50, offset = 0) => {
  const response = await fetch(`${API_BASE_URL}/audit/${walletAddress}?limit=${limit}&offset=${offset}`);
  if (!response.ok) throw new Error('Failed to fetch audit logs');
  return response.json();
};
