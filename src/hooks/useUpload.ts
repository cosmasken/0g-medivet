import { useState, useCallback } from 'react';
import { Blob } from '@0glabs/0g-ts-sdk/browser';
import { uploadToStorage, submitTransaction } from '@/lib/0g/uploader';
import { getProvider, getSigner, getFlowContract, calculateFees } from '@/lib/0g/fees';
import { getNetworkConfig, NetworkType } from '@/lib/0g/network';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  const uploadFile = useCallback(async (blob: Blob, networkType: NetworkType = 'turbo', fileSize?: number, originalFile?: File) => {
    if (!blob) {
      setError('No file provided');
      return null;
    }
    
    setLoading(true);
    setError('');
    setUploadStatus('Preparing file...');
    setTxHash('');
    
    let transactionHash = '';
    
    try {
      // Get provider and signer
      console.log('📡 Getting provider and signer...');
      const [provider, providerErr] = await getProvider();
      if (!provider) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }
      
      const [signer, signerErr] = await getSigner(provider);
      if (!signer) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }
      
      // Create submission object with actual blob data
      const submission = {
        length: fileSize || blob.size || 0,
        tags: '0x',
        nodes: [{
          root: blob.merkleRoot || '0x0000000000000000000000000000000000000000000000000000000000000000',
          height: 1
        }]
      };
      
      console.log('Created submission with merkle root:', {
        length: submission.length,
        merkleRoot: blob.merkleRoot,
        hasValidRoot: !!blob.merkleRoot
      });
      
      // Calculate fees
      setUploadStatus('Calculating fees...');
      const [feeInfo, feeErr] = await calculateFees(submission, networkType);
      if (!feeInfo || feeErr) {
        throw new Error(`Fee calculation error: ${feeErr?.message}`);
      }
      
      // Skip flow contract submission for now and go directly to storage
      setUploadStatus('Uploading to 0G storage...');
      console.log('⚠️ Skipping flow contract submission, uploading directly to storage');
      
      // Get network configuration
      const network = getNetworkConfig(networkType);
      
      // Upload file to storage using original File object
      const [uploadSuccess, uploadErr] = await uploadToStorage(
        originalFile || blob, 
        network.storageRpc,
        network.l1Rpc,
        signer
      );
      
      if (!uploadSuccess) {
        throw new Error(`Storage upload failed: ${uploadErr?.message}`);
      }
      
      setUploadStatus('Upload complete!');
      return blob.merkleRoot || 'upload-success';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setUploadStatus('');
      return transactionHash || null;
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
    loading,
    error,
    uploadStatus,
    txHash,
    uploadFile,
    resetUploadState
  };
}
