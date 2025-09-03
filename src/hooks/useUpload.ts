import { useState, useCallback } from 'react';
import { Blob } from '@0glabs/0g-ts-sdk/browser';
import { uploadToStorage } from '@/lib/0g/uploader';
import { BrowserProvider } from 'ethers';

export function useUpload() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [txHash, setTxHash] = useState('');

  const uploadFile = useCallback(async (blob: Blob) => {
    if (!blob) {
      setError('No file provided');
      return null;
    }
    
    setLoading(true);
    setError('');
    setUploadStatus('Preparing file...');
    setTxHash('');
    
    try {
      // Get signer from wallet
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setUploadStatus('Uploading to 0G Network...');
      
      // Upload to 0G storage
      const storageRpc = 'https://rpc-storage-testnet.0g.ai';
      const l1Rpc = 'https://evmrpc-testnet.0g.ai';
      
      const [success, uploadErr] = await uploadToStorage(blob, storageRpc, l1Rpc, signer);
      
      if (!success || uploadErr) {
        throw uploadErr || new Error('Upload failed');
      }
      
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      setTxHash(mockTxHash);
      setUploadStatus('Upload complete!');
      
      return mockTxHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setUploadStatus('');
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
    loading,
    error,
    uploadStatus,
    txHash,
    uploadFile,
    resetUploadState
  };
}
