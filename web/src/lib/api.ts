const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://medivet.paymebro.xyz/api';

// User authentication
export const authenticateUser = async (walletAddress: string, role: string, username?: string) => {
  const response = await fetch(`${API_BASE_URL}/users/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({
      wallet_address: walletAddress,
      role,
      username: username || walletAddress.slice(0, 8)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Authentication failed:', response.status, errorText);
    throw new Error(`Authentication failed: ${response.status}`);
  }
  return response.json();
};

// User records (metadata only, files handled by frontend 0G integration)
export const getUserRecords = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/records/user/${userId}?limit=50&offset=0`);
  if (!response.ok) throw new Error('Failed to fetch records');
  return response.json();
};

// Contract operations with message signing
export const stakeAsProvider = async (walletAddress: string, signature: string) => {
  const response = await fetch(`${API_BASE_URL}/contract/provider/stake`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ walletAddress, signature })
  });

  if (!response.ok) throw new Error('Failed to stake as provider');
  return response.json();
};

export const giveConsent = async (data: {
  providerAddress: string;
  recordId: string;
  durationDays: number;
  patientAddress: string;
  signature: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/contract/consent/give`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to give consent');
  return response.json();
};

export const accessRecord = async (data: {
  patientAddress: string;
  recordId: string;
  purpose: string;
  providerAddress: string;
  signature: string;
}) => {
  const response = await fetch(`${API_BASE_URL}/contract/record/access`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to access record');
  return response.json();
};

export const getContractInfo = async () => {
  const response = await fetch(`${API_BASE_URL}/test/contract`);
  if (!response.ok) throw new Error('Failed to get contract info');
  return response.json();
};

export const checkProviderStake = async (address: string) => {
  const response = await fetch(`${API_BASE_URL}/test/stake/${address}`);
  if (!response.ok) throw new Error('Failed to check provider stake');
  return response.json();
};

// Audit logging
export const createAuditLog = async (data: {
  wallet_address: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: any;
}) => {
  const response = await fetch(`${API_BASE_URL}/audit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create audit log');
  return response.json();
};
