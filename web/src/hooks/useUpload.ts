import { useState, useCallback } from 'react';
import { Blob } from '@0glabs/0g-ts-sdk/browser';
import { uploadToStorage, submitTransaction } from '@/lib/0g/uploader';
import { getProvider, getSigner, getFlowContract, calculateFees } from '@/lib/0g/fees';
import { getNetworkConfig, NetworkType } from '@/lib/0g/network';
import { Contract } from 'ethers';
import { useAIAnalysis } from './useAIAnalysis';
import { useAuthStore } from '@/stores/authStore';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(true);
  
  const { analyzeFile } = useAIAnalysis();
  const { currentUser } = useAuthStore();

  const uploadFile = useCallback(async (
    blob: Blob | null, 
    submission: any | null, 
    flowContract: Contract | null, 
    storageFee: bigint,
    networkType: NetworkType = 'turbo',
    userId?: string,
    fileMetadata?: any
  ) => {
    console.log('🚀 Starting upload process:', {
      hasBlob: !!blob,
      hasSubmission: !!submission,
      hasFlowContract: !!flowContract,
      storageFee: storageFee.toString(),
      networkType,
      aiAnalysisEnabled
    });
    
    if (!blob || !submission || !flowContract) {
      const error = 'Missing required upload data';
      console.error('❌ Upload validation failed:', { blob: !!blob, submission: !!submission, flowContract: !!flowContract });
      setError(error);
      return null;
    }
    
    setLoading(true);
    setError('');
    setUploadStatus('Preparing file...');
    setTxHash('');
    
    let transactionHash = '';
    
    try {
      // 1. Get provider and signer
      console.log('📡 Getting provider and signer...');
      const [provider, providerErr] = await getProvider();
      if (!provider) {
        console.error('❌ Provider failed:', providerErr);
        throw new Error(`Provider error: ${providerErr?.message}`);
      }
      
      const [signer, signerErr] = await getSigner(provider);
      if (!signer) {
        console.error('❌ Signer failed:', signerErr);
        throw new Error(`Signer error: ${signerErr?.message}`);
      }
      
      // Skip flow contract submission for now - upload directly to storage
      setUploadStatus('Uploading to storage...');
      console.log('⚠️ Skipping flow contract submission, uploading directly to storage');
      
      // Get network configuration
      const network = getNetworkConfig(networkType);
      
      // Upload file to storage
      const [uploadSuccess, uploadErr] = await uploadToStorage(
        blob, 
        network.storageRpc,
        network.l1Rpc,
        signer
      );
      
      if (!uploadSuccess) {
        console.error('❌ Storage upload failed:', uploadErr);
        throw new Error(`Storage upload error: ${uploadErr?.message}`);
      }
      
      console.log('✅ Upload completed successfully');
      setUploadStatus('Upload completed successfully!');
      
      // Get the root hash from the submission data
      const rootHash = submission?.root || submission?.merkleRoot || submission?.nodes?.[0]?.root;
      console.log('📋 Root hash extracted:', rootHash);
      
      const uploadResult = {
        success: true,
        root: rootHash,
        txHash: rootHash || 'direct-upload',
        merkleRoot: rootHash || 'unknown'
      };

      // Trigger AI analysis if enabled and conditions are met
      if (aiAnalysisEnabled && userId && fileMetadata && isMedicalFile(fileMetadata)) {
        try {
          setUploadStatus('Starting AI analysis...');
          console.log('🤖 Triggering AI analysis for medical file');
          
          // Use test endpoint for patients, real endpoint for providers
          const analysisType = currentUser?.role === 'provider' ? 'medical-analysis' : 'test-analysis';
          await analyzeFile(fileMetadata, analysisType, userId);
          console.log('✅ AI analysis completed');
        } catch (analysisError) {
          console.warn('⚠️ AI analysis failed, continuing with upload:', analysisError);
          // Don't fail the upload if AI analysis fails
        }
      }
      
      return uploadResult;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('❌ Upload process failed:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [analyzeFile, aiAnalysisEnabled]);

  const resetUploadState = useCallback(() => {
    setLoading(false);
    setError('');
    setUploadStatus('');
    setTxHash('');
  }, []);

  const toggleAIAnalysis = useCallback((enabled: boolean) => {
    setAiAnalysisEnabled(enabled);
  }, []);

  return {
    uploadFile,
    loading,
    error,
    uploadStatus,
    txHash,
    aiAnalysisEnabled,
    toggleAIAnalysis,
    resetUploadState
  };
}

/**
 * Check if file is a medical file that should be analyzed
 */
function isMedicalFile(metadata: any): boolean {
  if (!metadata) return false;
  
  const medicalTypes = ['lab-result', 'x-ray', 'mri', 'ct-scan', 'medical-report', 'prescription'];
  const medicalExtensions = ['.pdf', '.dcm', '.jpg', '.jpeg', '.png'];
  
  return medicalTypes.includes(metadata.category) || 
         medicalExtensions.some(ext => metadata.fileName?.toLowerCase().endsWith(ext));
}
