import { useState, useCallback } from 'react';
import { useNetwork } from '@/providers/NetworkProvider';
import { getProvider, getSigner } from '@/lib/0g/fees';
import { submitTransaction, uploadToStorage } from '@/lib/0g/uploader';
import { getNetworkConfig, getExplorerUrl } from '@/lib/0g/network';
import { Blob } from '@0glabs/0g-ts-sdk';
import { Contract } from 'ethers';

/**
 * Custom hook for handling file uploads to 0G Storage
 * Manages the upload process, transaction status, and error handling
 */
export function useUpload() {
  const { networkType } = useNetwork();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  // Upload a file to 0G Storage
  const uploadFile = useCallback(async (
    blob: Blob | null, 
    submission: any | null, 
    flowContract: Contract | null, 
    storageFee: bigint
  ) => {
    if (!blob || !submission || !flowContract) {
      setError('Missing required upload data');
      return null;
    }
    
    setLoading(true);
    setError('');
    setUploadStatus('Preparing file...');
    setTxHash('');
    
    try {
      // 1. Get provider and signer
      const [provider, providerErr] = await getProvider();
      if (!provider) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }
      
      const [signer, signerErr] = await getSigner(provider);
      if (!signer) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }
      
      // 2. Submit transaction to flow contract
      setUploadStatus('Confirming transaction...');
      const [txResult, txErr] = await submitTransaction(flowContract, submission, storageFee);
      if (!txResult) {
        throw new Error(`Transaction error: ${txErr?.message}`);
      }
      
      // 3. Store transaction hash
      setTxHash(txResult.tx.hash);
      setUploadStatus('Waiting for transaction confirmation...');
      
      // 4. Get network configuration
      const network = getNetworkConfig(networkType);
      
      // 5. Upload file to storage
      setUploadStatus('Uploading file to storage...');
      const [uploadSuccess, uploadErr] = await uploadToStorage(
        blob, 
        network.storageRpc,
        network.l1Rpc,
        signer
      );
      
      if (!uploadSuccess) {
        throw new Error(`Upload error: ${uploadErr?.message}`);
      }
      
      setUploadStatus('Upload complete!');
      return txResult.tx.hash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setUploadStatus('');
      return null;
    } finally {
      setLoading(false);
    }
  }, [networkType]);

  // Reset upload state
  const resetUploadState = useCallback(() => {
    setLoading(false);
    setError('');
    setUploadStatus('');
    setTxHash('');
  }, []);

  // Get explorer URL for transaction
  const getTransactionExplorerUrl = useCallback((hash: string) => {
    return getExplorerUrl(hash, networkType);
  }, [networkType]);

  return {
    loading,
    error,
    uploadStatus,
    txHash,
    uploadFile,
    resetUploadState,
    getExplorerUrl: getTransactionExplorerUrl
  };
} 