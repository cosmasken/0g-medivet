import { useState, useCallback } from 'react';
import { useNetwork } from '@/providers/NetworkProvider';
import { createBlob, generateMerkleTree, createSubmission, getRootHash } from '@/lib/0g/blob';
import { getProvider, getSigner, getFlowContract, calculateFees, FeeInfo } from '@/lib/0g/fees';
import { getNetworkConfig } from '@/lib/0g/network';
import { Blob, MerkleTree } from '@0glabs/0g-ts-sdk';
import { Contract } from 'ethers';

/**
 * Custom hook for calculating fees for file uploads
 * Handles blob creation, merkle tree generation, and fee calculation
 */
export function useFees() {
  const { networkType } = useNetwork();
  const [feeInfo, setFeeInfo] = useState<FeeInfo>({
    storageFee: '0',
    estimatedGas: '0',
    totalFee: '0',
    rawStorageFee: BigInt(0),
    rawGasFee: BigInt(0),
    rawTotalFee: BigInt(0),
    isLoading: false
  });
  const [error, setError] = useState('');
  const [blob, setBlob] = useState<Blob | null>(null);
  const [tree, setTree] = useState<MerkleTree | null>(null);
  const [rootHash, setRootHash] = useState('');
  const [submission, setSubmission] = useState<any | null>(null);
  const [flowContract, setFlowContract] = useState<Contract | null>(null);

  // Calculate fees for a file
  const calculateFeesForFile = useCallback(async (file: File, isWalletConnected: boolean) => {
    if (!file) return;
    
    // Reset state for new calculation
    setError('');
    setFeeInfo(prev => ({ ...prev, isLoading: true }));
    
    // Check wallet connection
    if (!isWalletConnected) {
      setError('Please connect your wallet to calculate fees');
      setFeeInfo(prev => ({ ...prev, isLoading: false }));
      return;
    }
    
    try {
      // 1. Create a blob from the file
      const newBlob = createBlob(file);
      setBlob(newBlob);
      
      // 2. Generate a merkle tree
      const [newTree, treeErr] = await generateMerkleTree(newBlob);
      if (!newTree) {
        setError(`Failed to generate merkle tree: ${treeErr?.message}`);
        setFeeInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }
      setTree(newTree);
      
      // 3. Get the root hash
      const [hash, hashErr] = getRootHash(newTree);
      if (!hash) {
        setError(`Failed to get root hash: ${hashErr?.message}`);
        setFeeInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }
      setRootHash(hash);
      
      // 4. Create a submission
      const [newSubmission, submissionErr] = await createSubmission(newBlob);
      if (!newSubmission) {
        setError(`Failed to create submission: ${submissionErr?.message}`);
        setFeeInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }
      setSubmission(newSubmission);
      
      // 5. Get provider and signer
      const [provider, providerErr] = await getProvider();
      if (!provider) {
        setError(`Provider error: ${providerErr?.message}`);
        setFeeInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      const [signer, signerErr] = await getSigner(provider);
      if (!signer) {
        setError(`Signer error: ${signerErr?.message}`);
        setFeeInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      // 6. Get flow contract
      const network = getNetworkConfig(networkType);
      const newFlowContract = getFlowContract(network.flowAddress, signer);
      setFlowContract(newFlowContract);
      
      // 7. Calculate fee information
      const [fees, feeErr] = await calculateFees(newSubmission, newFlowContract, provider);
      if (!fees) {
        setError(`Fee calculation error: ${feeErr?.message}`);
        setFeeInfo(prev => ({ ...prev, isLoading: false }));
        return;
      }
      
      // 8. Update state with all calculation results
      setFeeInfo({
        ...fees,
        isLoading: false
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(`Calculation error: ${errorMessage}`);
      setFeeInfo(prev => ({ ...prev, isLoading: false }));
    }
  }, [networkType]);

  // Get current network config
  const getCurrentNetwork = useCallback(() => {
    return getNetworkConfig(networkType);
  }, [networkType]);

  return {
    feeInfo,
    error,
    blob,
    tree,
    rootHash,
    submission,
    flowContract,
    calculateFeesForFile,
    getCurrentNetwork
  };
} 