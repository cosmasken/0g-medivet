import { useState, useCallback } from 'react';
import { submitComputeAnalysis } from '../lib/api';

export interface AnalysisResult {
  jobId: string;
  analysis: string;
  isValid: boolean;
  provider: string;
  model: string;
  timestamp: string;
}

export interface AnalysisStatus {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  progress: number;
}

/**
 * Hook for managing AI analysis jobs with 0G Compute
 */
export const useAIAnalysis = () => {
  const [status, setStatus] = useState<AnalysisStatus>({
    loading: false,
    error: null,
    result: null,
    progress: 0
  });

  const analyzeFile = useCallback(async (
    fileData: any,
    analysisType: 'medical-analysis' | 'enhanced-analysis' | 'test-analysis' = 'medical-analysis',
    userId: string
  ) => {
    setStatus({
      loading: true,
      error: null,
      result: null,
      progress: 10
    });

    try {
      // Simulate progress updates
      setStatus(prev => ({ ...prev, progress: 30 }));
      
      // Use test endpoint for test-analysis type
      const endpoint = analysisType === 'test-analysis' 
        ? 'test-analyze' 
        : 'analyze';
      
      const result = await submitComputeAnalysis(fileData, analysisType, userId, endpoint);
      
      setStatus(prev => ({ ...prev, progress: 90 }));
      
      setStatus({
        loading: false,
        error: null,
        result,
        progress: 100
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      
      setStatus({
        loading: false,
        error: errorMessage,
        result: null,
        progress: 0
      });

      // Re-throw for caller to handle fallback
      throw error;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus({
      loading: false,
      error: null,
      result: null,
      progress: 0
    });
  }, []);

  return {
    analyzeFile,
    reset,
    ...status
  };
};
