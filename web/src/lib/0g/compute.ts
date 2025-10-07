const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://medivet-production.up.railway.app/api';

export interface ComputeJob {
  jobId: string;
  analysis: string;
  isValid: boolean;
  provider: string;
  timestamp: string;
}

export interface ComputeBalance {
  total: string;
  locked: string;
}

export interface ComputeService {
  provider: string;
  serviceType: string;
  url: string;
  inputPrice: bigint;
  outputPrice: bigint;
  model: string;
  verifiability: string;
}

/**
 * Submit medical file for AI analysis using 0G Compute
 */
export const submitAnalysis = async (
  fileData: any, 
  analysisType: 'medical-analysis' | 'enhanced-analysis' = 'medical-analysis',
  userId: string
): Promise<ComputeJob> => {
  const response = await fetch(`${API_BASE_URL}/compute/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fileData, analysisType, userId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    if (error.fallback) {
      // Server indicates we should use fallback analysis
      throw new Error('COMPUTE_UNAVAILABLE');
    }
    throw new Error(error.message || 'Analysis failed');
  }
  
  return response.json();
};

/**
 * Get compute account balance
 */
export const getComputeBalance = async (): Promise<ComputeBalance> => {
  const response = await fetch(`${API_BASE_URL}/compute/balance`);
  if (!response.ok) throw new Error('Failed to get balance');
  return response.json();
};

/**
 * List available compute services
 */
export const listComputeServices = async (): Promise<ComputeService[]> => {
  const response = await fetch(`${API_BASE_URL}/compute/services`);
  if (!response.ok) throw new Error('Failed to list services');
  const data = await response.json();
  return data.services;
};

/**
 * Check compute service health
 */
export const checkComputeHealth = async (): Promise<{
  status: 'healthy' | 'unhealthy';
  balance?: string;
  error?: string;
  timestamp: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/compute/health`);
  return response.json();
};
