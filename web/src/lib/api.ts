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

// Contract operations are handled client-side, but we can still get contract info
export const getContractInfo = async () => {
  const response = await fetch(`${API_BASE_URL}/contract/info`);
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

// Log contract transactions that were executed client-side
export const logContractTransaction = async (data: {
  wallet_address: string;
  action: string;
  transaction_hash: string;
  details: any;
}) => {
  const response = await fetch(`${API_BASE_URL}/contract/log-transaction`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to log contract transaction');
  return response.json();
};
