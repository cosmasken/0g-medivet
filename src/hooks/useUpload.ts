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
        throw new Error(`Storage upload error: ${uploadErr?.message}`);
      }
      
      console.log('✅ Upload completed successfully');
      setUploadStatus('Upload completed successfully!');
      
      return {
        success: true,
        txHash: transactionHash,
        merkleRoot: submission.nodes[0]?.root
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

  return {
    uploadFile,
    loading,
    error,
    uploadStatus,
    txHash
  };
}
