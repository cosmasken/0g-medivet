/**
 * File upload utilities for 0G Storage
 */

import { Contract } from 'ethers';
import { Blob, Uploader } from '@0glabs/0g-ts-sdk';

export interface UploadOption {
  tags: string;
  finalityRequired: boolean;
  taskSize: number;
  expectedReplica: number;
  skipTx: boolean;
  fee: bigint;
  nonce?: bigint;
}

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
    const uploader = new Uploader(storageRpc, l1Rpc, signer);
    
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
