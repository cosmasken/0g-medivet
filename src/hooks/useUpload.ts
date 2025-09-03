import { useState, useCallback } from 'react';
import { Blob } from '@0glabs/0g-ts-sdk/browser';
import { uploadToStorage, submitTransaction } from '@/lib/0g/uploader';
import { getProvider, getSigner, getFlowContract, calculateFees } from '@/lib/0g/fees';
import { getNetworkConfig, NetworkType } from '@/lib/0g/network';
import { Contract } from 'ethers';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  const uploadFile = useCallback(async (
    blob: Blob | null, 
    submission: any | null, 
    flowContract: Contract | null, 
    storageFee: bigint,
    networkType: NetworkType = 'turbo'
  ) => {
    console.log('🚀 Starting upload process:', {
      hasBlob: !!blob,
      hasSubmission: !!submission,
      hasFlowContract: !!flowContract,
      storageFee: storageFee.toString(),
      networkType
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
      
      return {
        success: true,
        txHash: 'direct-upload', // Placeholder since no transaction
        merkleRoot: submission?.nodes?.[0]?.root || 'unknown'
      };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      console.error('❌ Upload process failed:', err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetUploadState = useCallback(() => {
    setLoading(false);
    setError('');
    setUploadStatus('');
    setTxHash('');
  }, []);

  return {
    uploadFile,
    loading,
    error,
    uploadStatus,
    txHash,
    resetUploadState
  };
}
