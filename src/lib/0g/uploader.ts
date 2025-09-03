import { Indexer, Blob } from '@0glabs/0g-ts-sdk/browser';
import { Contract } from 'ethers';

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

export async function uploadToStorage(
  fileOrBlob: Blob | File, 
  storageRpc: string, 
  l1Rpc: string, 
  signer: any
): Promise<[boolean, Error | null]> {
  try {
    console.log('☁️ Starting storage upload to 0G:', {
      storageRpc,
      l1Rpc,
      blobSize: fileOrBlob instanceof File ? fileOrBlob.size : 'unknown',
      signerAddress: await signer.getAddress()
    });
    
    const indexer = new Indexer(storageRpc);
    
    const uploadOptions = {
      taskSize: 10,
      expectedReplica: 1,
      finalityRequired: true,
      tags: '0x',
      skipTx: false,
      fee: BigInt(0)
    };
    
    console.log('⬆️ Uploading with options:', uploadOptions);
    
    // Use File directly if available, otherwise use Blob
    const uploadTarget = fileOrBlob instanceof File ? fileOrBlob : fileOrBlob;
    
    await indexer.upload(uploadTarget, l1Rpc, signer, uploadOptions);
    
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
