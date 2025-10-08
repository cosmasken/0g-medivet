import { useState, useCallback } from 'react';
import { submitAIAnalysis, getAIAnalysisJob } from '../lib/api';

export interface AnalysisResult {
  jobId: string;
  analysis: string;
  isValid: boolean;
  provider: string;
  timestamp: string;
  computeTime?: number;
}

export interface AnalysisStatus {
  loading: boolean;
  error: string | null;
  result: AnalysisResult | null;
  progress: number;
}

/**
 * Hook for managing AI analysis jobs with 0G Compute Network
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
    analysisType: string = 'medical-analysis',
    userId: string,
    fileId?: string
  ) => {
    setStatus({
      loading: true,
      error: null,
      result: null,
      progress: 10
    });

    try {
      // Submit analysis request
      setStatus(prev => ({ ...prev, progress: 30 }));
      
      const result = await submitAIAnalysis({
        fileData,
        analysisType,
        userId,
        fileId
      });
      
      setStatus(prev => ({ ...prev, progress: 70 }));
      
      // If job ID is returned, poll for completion
      if (result.jobId && !result.analysis) {
        const jobResult = await getAIAnalysisJob(result.jobId);
        result.analysis = jobResult.result || result.analysis;
      }
      
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
