const API_BASE_URL = 'https://medivet-production.up.railway.app/api';

// User management
export const authenticateUser = async (walletAddress: string, role: 'patient' | 'provider' = 'patient') => {
  const response = await fetch(`${API_BASE_URL}/users/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wallet_address: walletAddress, role })
  });
  
  if (!response.ok) {
    throw new Error('Authentication failed');
  }
  
  return response.json();
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  
  if (!response.ok) {
    throw new Error('Profile update failed');
  }
  
  return response.json();
};

export const completeUserOnboarding = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/complete-onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error('Onboarding completion failed');
  }
  
  return response.json();
};

// Medical records
export const createMedicalRecord = async (recordData: {
  user_id: string;
  title: string;
  description?: string;
  category: string;
  file_type?: string;
  file_size?: number;
  zero_g_hash: string;
  merkle_root?: string;
  transaction_hash?: string;
  tags?: string[];
}) => {
  const response = await fetch(`${API_BASE_URL}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(recordData)
  });
  
  if (!response.ok) {
    throw new Error('Record creation failed');
  }
  
  return response.json();
};

export const getUserMedicalRecords = async (userId: string, limit = 50, offset = 0) => {
  const response = await fetch(`${API_BASE_URL}/records/user/${userId}?limit=${limit}&offset=${offset}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch records');
  }
  
  return response.json();
};

export const updateRecordStatus = async (recordId: string, status: string, transactionHash?: string, merkleRoot?: string) => {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      upload_status: status,
      transaction_hash: transactionHash,
      merkle_root: merkleRoot
    })
  });
  
  if (!response.ok) {
    throw new Error('Record status update failed');
  }
  
  return response.json();
};

// Audit logs (existing)
export const createAuditLog = async (logData: {
  wallet_address: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(logData)
  });
  
  if (!response.ok) {
    throw new Error('Audit log creation failed');
  }
  
  return response.json();
};

export const getUserAuditLogs = async (walletAddress: string, limit = 50, offset = 0) => {
  const response = await fetch(`${API_BASE_URL}/audit/${walletAddress}?limit=${limit}&offset=${offset}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch audit logs');
  }
  
  return response.json();
};
