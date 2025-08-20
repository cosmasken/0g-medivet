import { Indexer, Blob } from '@0glabs/0g-ts-sdk';
import { Contract } from 'ethers';

/**
 * Submits a transaction to the flow contract
 * @param flowContract The flow contract
 * @param submission The submission object
 * @param value The value to send with the transaction
 * @returns A promise that resolves to the transaction result and any error
 */
export async function submitTransaction(
  flowContract: Contract, 
  submission: any, 
  value: bigint
): Promise<[any | null, Error | null]> {
  try {
    console.log('🔗 Submitting transaction to flow contract:', {
      flowAddress: await flowContract.getAddress(),
      value: value.toString(),
      submissionData: {
        ...submission,
        // Don't log the actual data, just structure
        nodes: submission.nodes?.length || 0,
        length: submission.length
      }
    });
    
    const tx = await flowContract.submit(submission, { value });
    console.log('📝 Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('✅ Transaction confirmed:', {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString()
    });
    
    return [{ tx, receipt }, null];
  } catch (error) {
    console.error('❌ Transaction submission failed:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Uploads a file to 0G storage using the exact same pattern as working starter kit
 * @param blob The blob to upload
 * @param storageRpc The storage RPC URL (may be proxied)
 * @param l1Rpc The L1 RPC URL
 * @param signer The signer
 * @returns A promise that resolves to a success flag and any error
 */
export async function uploadToStorage(
  blob: Blob, 
  storageRpc: string, 
  l1Rpc: string, 
  signer: any
): Promise<[boolean, Error | null]> {
  try {
    console.log('☁️ Starting storage upload to 0G:', {
      storageRpc,
      l1Rpc,
      blobSize: blob?.data?.length || 'unknown',
      signerAddress: await signer.getAddress()
    });
    
    // Create indexer with the RPC URL (which may be proxied in dev)
    const indexer = new Indexer(storageRpc);
    
    // Use the exact same upload options as working starter kit
    const uploadOptions = {
      taskSize: 10,
      expectedReplica: 1,
      finalityRequired: true,
      tags: '0x',
      skipTx: false,
      fee: BigInt(0)
    };
    
    console.log('⬆️ Uploading with options:', uploadOptions);
    
    await indexer.upload(blob, l1Rpc, signer, uploadOptions);
    
    console.log('✅ Storage upload completed successfully');
    return [true, null];
  } catch (error) {
    console.error('❌ Storage upload failed:', {
      error: error instanceof Error ? error.message : String(error),
      storageRpc,
      l1Rpc
    });
    return [false, error instanceof Error ? error : new Error(String(error))];
  }
}
