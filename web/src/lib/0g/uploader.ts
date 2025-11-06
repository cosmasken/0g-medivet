/**
 * File upload utilities for 0G Storage
 */

import { Contract } from 'ethers';
import { Blob, Uploader } from '@0glabs/0g-ts-sdk';

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
    await uploader.uploadFile(blob);
    return [true, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
