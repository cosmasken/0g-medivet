/**
 * File upload utilities for 0G Storage
 */

import { Contract } from 'ethers';
import { Blob, Uploader, Indexer } from '@0glabs/0g-ts-sdk';

/**
 * Submit transaction to flow contract
 */
export async function submitTransaction(
  flowContract: Contract,
  submission: any,
  storageFee: bigint
): Promise<[any | null, Error | null]> {
  try {
    const tx = await flowContract.submit(submission, {
      value: storageFee
    });
    
    const receipt = await tx.wait();
    return [{ tx, receipt }, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Upload file to 0G Storage
 */
export async function uploadToStorage(
  blob: Blob,
  storageRpc: string,
  l1Rpc: string,
  signer: any
): Promise<[boolean | null, Error | null]> {
  try {
    // Use the indexer to get the proper flow contract
    const indexer = new Indexer(new URL(storageRpc));
    
    // Get uploader from indexer which will handle the flow contract properly
    const [uploader, err] = await indexer.newUploaderFromIndexerNodes(l1Rpc, signer, 1);
    
    if (err || !uploader) {
      console.error('Failed to create uploader:', err);
      return [null, err || new Error('Failed to create uploader')];
    }
    
    // Define upload options based on the SDK's expected format
    const uploadOptions = {
      tags: '0x',
      finalityRequired: true,
      taskSize: 1,
      expectedReplica: 1,
      skipTx: false,
      fee: BigInt(0),
    };
    
    const [result, error] = await uploader.uploadFile(blob, uploadOptions);
    
    if (error) {
      console.error('Upload failed:', error);
      return [null, error];
    }
    
    console.log('Upload successful:', result);
    return [true, null];
  } catch (error) {
    console.error('Upload exception:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
