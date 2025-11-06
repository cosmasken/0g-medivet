/**
 * Client-side 0G Storage upload hook
 */

import { useState, useCallback } from 'react';
import { createBlob, generateMerkleTree, createSubmission, getRootHash } from '../lib/0g/blob';
import { getProvider, getSigner, getFlowContract, calculateFees } from '../lib/0g/fees';
import { submitTransaction, uploadToStorage } from '../lib/0g/uploader';
import { getNetworkConfig } from '../lib/0g/network';

export interface UploadResult {
  success: boolean;
  rootHash?: string;
  txHash?: string;
  error?: string;
}

/**
 * Hook for client-side 0G Storage uploads
 */
export function useClientUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [error, setError] = useState('');

  const uploadFile = useCallback(async (
    file: File,
    networkType: 'standard' | 'turbo' = 'turbo'
  ): Promise<UploadResult> => {
    setUploading(true);
    setError('');
    setUploadStatus('Preparing file...');

    try {
      // 1. Create blob from file
      const blob = createBlob(file);
      
      // 2. Generate merkle tree
      setUploadStatus('Generating merkle tree...');
      const [tree, treeErr] = await generateMerkleTree(blob);
      if (!tree) {
        throw new Error(`Failed to generate merkle tree: ${treeErr?.message}`);
      }
      
      // 3. Get root hash
      const [rootHash, hashErr] = getRootHash(tree);
      if (!rootHash) {
        throw new Error(`Failed to get root hash: ${hashErr?.message}`);
      }
      
      // 4. Create submission
      setUploadStatus('Creating submission...');
      const [submission, submissionErr] = await createSubmission(blob);
      if (!submission) {
        throw new Error(`Failed to create submission: ${submissionErr?.message}`);
      }
      
      // 5. Get provider and signer
      setUploadStatus('Connecting to wallet...');
      const [provider, providerErr] = await getProvider();
      if (!provider) {
        throw new Error(`Provider error: ${providerErr?.message}`);
      }
      
      const [signer, signerErr] = await getSigner(provider);
      if (!signer) {
        throw new Error(`Signer error: ${signerErr?.message}`);
      }
      
      // 6. Get network config and flow contract
      const network = getNetworkConfig(networkType);
      const flowContract = getFlowContract(network.flowAddress, signer);
      
      // 7. Calculate fees
      setUploadStatus('Calculating fees...');
      const [feeInfo, feeErr] = await calculateFees(submission, flowContract, provider);
      if (!feeInfo) {
        throw new Error(`Fee calculation error: ${feeErr?.message}`);
      }
      
      // 8. Submit transaction
      setUploadStatus('Submitting transaction...');
      const [txResult, txErr] = await submitTransaction(flowContract, submission, feeInfo.rawTotalFee);
      if (!txResult) {
        throw new Error(`Transaction error: ${txErr?.message}`);
      }
      
      // 9. Upload to storage
      setUploadStatus('Uploading to 0G Storage...');
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
      
      return {
        success: true,
        rootHash,
        txHash: txResult.tx.hash
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setUploadStatus('');
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setUploading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setUploading(false);
    setUploadStatus('');
    setError('');
  }, []);

  return {
    uploading,
    uploadStatus,
    error,
    uploadFile,
    resetState
  };
}
