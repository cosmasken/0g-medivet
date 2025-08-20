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
      console.log('✅ Provider obtained');
      
      const [signer, signerErr] = await getSigner(provider);
      if (!signer) {
        console.error('❌ Signer failed:', signerErr);
        throw new Error(`Signer error: ${signerErr?.message}`);
      }
      console.log('✅ Signer obtained');
      
      // 2. Submit transaction to flow contract
      setUploadStatus('Confirming transaction...');
      console.log('📝 Submitting transaction to flow contract...');
      const [txResult, txErr] = await submitTransaction(flowContract, submission, storageFee);
      if (!txResult) {
        console.error('❌ Transaction submission failed:', txErr);
        throw new Error(`Transaction error: ${txErr?.message}`);
      }
      
      // 3. Store transaction hash
      transactionHash = txResult.tx.hash;
      setTxHash(transactionHash);
      console.log('✅ Transaction submitted successfully:', {
        txHash: transactionHash,
        gasUsed: txResult.receipt?.gasUsed?.toString(),
        blockNumber: txResult.receipt?.blockNumber
      });
      setUploadStatus('Waiting for transaction confirmation...');
      
      // 4. Get network configuration
      const network = getNetworkConfig(networkType);
      console.log('🌐 Network configuration:', {
        storageRpc: network.storageRpc,
        l1Rpc: network.l1Rpc
      });
      
      // 5. Upload file to storage
      setUploadStatus('Uploading file to storage...');
      console.log('☁️ Starting storage upload...');
      const [uploadSuccess, uploadErr] = await uploadToStorage(
        blob, 
        network.storageRpc,
        network.l1Rpc,
        signer
      );
      
      if (!uploadSuccess) {
        console.error('❌ Storage upload failed:', uploadErr);
        console.log('⚠️ Transaction was successful but storage upload failed');
        console.log('💡 Transaction hash for successful on-chain submission:', transactionHash);
        throw new Error(`Storage upload failed: ${uploadErr?.message}. Transaction was successful: ${transactionHash}`);
      }
      
      console.log('✅ Storage upload completed successfully');
      setUploadStatus('Upload complete!');
      return transactionHash;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ Upload process failed:', {
        error: errorMessage,
        transactionHash: transactionHash || 'No transaction submitted',
        stage: transactionHash ? 'Storage Upload' : 'Transaction Submission'
      });
      setError(errorMessage);
      setUploadStatus('');
      
      // Return transaction hash even if storage upload failed
      return transactionHash || null;
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