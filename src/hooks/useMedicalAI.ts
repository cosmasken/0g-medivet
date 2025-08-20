import { useState, useCallback } from 'react';
import { medicalAIService, MedicalAnalysisResult, MedicalInsight } from '@/lib/ai/medicalAI';
import { useWallet } from '@/hooks/useWallet';

export interface UseMedicalAIState {
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  insights: MedicalInsight[];
  analysisResults: MedicalAnalysisResult | null;
  balance: any;
}

export interface UseMedicalAIActions {
  initializeAI: () => Promise<void>;
  analyzeFile: (fileContent: string, fileName: string, fileType: string, patientContext?: string) => Promise<MedicalAnalysisResult>;
  generateHealthInsights: (patientData: any) => Promise<MedicalAnalysisResult>;
  getTreatmentRecommendations: (diagnosis: string, patientProfile: string, currentTreatments?: string[]) => Promise<MedicalAnalysisResult>;
  getBalance: () => Promise<void>;
  addFunds: (amount: number) => Promise<void>;
  clearError: () => void;
  clearResults: () => void;
}

export function useMedicalAI(): UseMedicalAIState & UseMedicalAIActions {
  const { isConnected } = useWallet();
  
  const [state, setState] = useState<UseMedicalAIState>({
    isLoading: false,
    isInitialized: false,
    error: null,
    insights: [],
    analysisResults: null,
    balance: null,
  });

  const updateState = (updates: Partial<UseMedicalAIState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const setLoading = (isLoading: boolean) => updateState({ isLoading });
  const setError = (error: string | null) => updateState({ error });

  /**
   * Initialize the AI service
   */
  const initializeAI = useCallback(async () => {
    if (state.isInitialized) return;
    
    if (!isConnected) {
      setError('Wallet must be connected to use AI features');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get private key from environment variable
      const privateKey = process.env.NEXT_PUBLIC_AI_PRIVATE_KEY || process.env.REACT_APP_AI_PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('AI_PRIVATE_KEY environment variable is required for AI features');
      }

      await medicalAIService.initialize(privateKey);
      await medicalAIService.setupAccount(); // Initialize with 0.1 ETH funding

      updateState({ isInitialized: true });
      console.log('Medical AI service initialized successfully');
    } catch (error: any) {
      console.error('Failed to initialize AI service:', error);
      setError(`Failed to initialize AI service: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [isConnected, state.isInitialized]);

  /**
   * Analyze a medical file
   */
  const analyzeFile = useCallback(async (
    fileContent: string,
    fileName: string,
    fileType: string,
    patientContext?: string
  ): Promise<MedicalAnalysisResult> => {
    if (!state.isInitialized) {
      await initializeAI();
    }

    try {
      setLoading(true);
      setError(null);

      const result = await medicalAIService.analyzeMedicalFile(
        fileContent,
        fileName,
        fileType,
        patientContext
      );

      updateState({
        analysisResults: result,
        insights: result.insights,
      });

      return result;
    } catch (error: any) {
      console.error('File analysis failed:', error);
      setError(`File analysis failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.isInitialized, initializeAI]);

  /**
   * Generate health insights from patient data
   */
  const generateHealthInsights = useCallback(async (patientData: any): Promise<MedicalAnalysisResult> => {
    if (!state.isInitialized) {
      await initializeAI();
    }

    try {
      setLoading(true);
      setError(null);

      const result = await medicalAIService.generateHealthInsights(patientData);

      updateState({
        analysisResults: result,
        insights: result.insights,
      });

      return result;
    } catch (error: any) {
      console.error('Health insights generation failed:', error);
      setError(`Health insights generation failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.isInitialized, initializeAI]);

  /**
   * Get treatment recommendations
   */
  const getTreatmentRecommendations = useCallback(async (
    diagnosis: string,
    patientProfile: string,
    currentTreatments?: string[]
  ): Promise<MedicalAnalysisResult> => {
    if (!state.isInitialized) {
      await initializeAI();
    }

    try {
      setLoading(true);
      setError(null);

      const result = await medicalAIService.getTreatmentRecommendations(
        diagnosis,
        patientProfile,
        currentTreatments
      );

      updateState({
        analysisResults: result,
        insights: result.insights,
      });

      return result;
    } catch (error: any) {
      console.error('Treatment recommendations failed:', error);
      setError(`Treatment recommendations failed: ${error.message}`);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [state.isInitialized, initializeAI]);

  /**
   * Get current balance
   */
  const getBalance = useCallback(async () => {
    if (!state.isInitialized) {
      setError('AI service not initialized');
      return;
    }

    try {
      const balance = await medicalAIService.getBalance();
      updateState({ balance });
    } catch (error: any) {
      console.error('Failed to get balance:', error);
      setError(`Failed to get balance: ${error.message}`);
    }
  }, [state.isInitialized]);

  /**
   * Add funds to ledger
   */
  const addFunds = useCallback(async (amount: number) => {
    if (!state.isInitialized) {
      setError('AI service not initialized');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await medicalAIService.addFunds(amount);
      await getBalance(); // Refresh balance
    } catch (error: any) {
      console.error('Failed to add funds:', error);
      setError(`Failed to add funds: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [state.isInitialized, getBalance]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear results
   */
  const clearResults = useCallback(() => {
    updateState({
      insights: [],
      analysisResults: null,
    });
  }, []);

  return {
    ...state,
    initializeAI,
    analyzeFile,
    generateHealthInsights,
    getTreatmentRecommendations,
    getBalance,
    addFunds,
    clearError,
    clearResults,
  };
}

export default useMedicalAI;
