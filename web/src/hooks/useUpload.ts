import { useState, useCallback } from 'react';
import { Blob } from '@0glabs/0g-ts-sdk/browser';
import { uploadToStorage, submitTransaction } from '@/lib/0g/uploader';
import { getProvider, getSigner, getFlowContract, calculateFees } from '@/lib/0g/fees';
import { getNetworkConfig, NetworkType } from '@/lib/0g/network';
import { Contract } from 'ethers';
import { useAuthStore } from '@/stores/authStore';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const { currentUser } = useAuthStore();

  const uploadFile = useCallback(async (
    blob: Blob | null, 
    networkType: NetworkType = 'turbo',
    fileSize?: number,
    fileMetadata?: any
  ) => {
    console.log('🚀 Starting upload process:', {
      hasBlob: !!blob,
      networkType,
      fileSize
    });
    
    if (!blob) {
      const error = 'Missing required blob data';
      console.error('❌ Upload validation failed:', { blob: !!blob });
      setError(error);
      return null;
    }
    
    setLoading(true);
    setError('');
    setUploadStatus('Preparing file...');
    setTxHash('');
    
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
      
      // Upload directly to storage
      setUploadStatus('Uploading to 0G Storage...');
      console.log('⚠️ Uploading directly to 0G Storage');
      
      // Get network configuration
      const network = getNetworkConfig(networkType);
      
      // Extract root hash from blob
      let rootHash = blob?.root || blob?.merkleRoot || 'unknown';
      console.log('📋 Root hash extracted from blob before upload:', rootHash);
      
      // Upload file to storage
      const [uploadSuccess, uploadErr] = await uploadToStorage(
        blob, 
        network.storageRpc,
        network.l1Rpc,
        signer
      );
      
      if (uploadSuccess) {
        console.log('✅ Upload completed successfully');
        setUploadStatus('Upload completed successfully!');
      } else {
        console.error('❌ Upload failed:', uploadErr);
        throw new Error(`Upload failed: ${uploadErr?.message}`);
      }
      
      if (rootHash === 'unknown') {
        console.warn('⚠️ Root hash not accessible from blob, upload still succeeded');
        rootHash = 'hash-available-but-not-accessible';
      }
      
      const uploadResult = {
        success: true,
        root: rootHash !== 'hash-available-but-not-accessible' ? rootHash : 'unknown-hash',
        txHash: 'direct-upload',
        merkleRoot: rootHash !== 'hash-available-but-not-accessible' ? rootHash : 'unknown'
      };

      return uploadResult;
      
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
