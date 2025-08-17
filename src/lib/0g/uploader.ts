import { Indexer, Blob } from '@0glabs/0g-ts-sdk';
import { Contract } from 'ethers';

/**
 * Waits for transaction confirmation with timeout and retry logic
 * @param tx The transaction object
 * @param timeoutMs Timeout in milliseconds (default 5 minutes)
 * @param retries Number of retries (default 3)
 * @returns Promise that resolves to transaction receipt
 */
async function waitForTransactionWithTimeout(
  tx: any, 
  timeoutMs: number = 300000, // 5 minutes
  retries: number = 3
): Promise<any> {
  console.log(`Waiting for transaction ${tx.hash} with timeout ${timeoutMs}ms`);
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Transaction wait attempt ${attempt + 1}/${retries + 1}`);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Transaction timeout after ${timeoutMs}ms`));
        }, timeoutMs);
      });
      
      // Race between transaction wait and timeout
      const receipt = await Promise.race([
        tx.wait(),
        timeoutPromise
      ]);
      
      if (receipt) {
        console.log(`Transaction confirmed in block ${receipt.blockNumber}`);
        return receipt;
      }
    } catch (error) {
      console.warn(`Transaction wait attempt ${attempt + 1} failed:`, error);
      
      if (attempt === retries) {
        // Last attempt failed, check if transaction was actually mined
        try {
          const provider = tx.provider || (tx as any).runner?.provider;
          if (provider) {
            const receipt = await provider.getTransactionReceipt(tx.hash);
            if (receipt) {
              console.log(`Transaction ${tx.hash} was actually mined, returning receipt`);
              return receipt;
            }
          }
        } catch (checkError) {
          console.warn('Failed to check transaction status:', checkError);
        }
        
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.min(5000 * Math.pow(2, attempt), 30000);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Maximum retries exceeded');
}

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
    console.log('Submitting transaction...', {
      value: value.toString(),
      submissionLength: submission?.length || 0
    });
    
    // Submit transaction with proper gas settings
    // For 0G chain, only need to pay storage fee as value
    const tx = await flowContract.submit(submission, { 
      value // This is the storage fee only
    });
    
    console.log('Transaction submitted:', {
      hash: tx.hash,
      nonce: tx.nonce,
      gasLimit: tx.gasLimit?.toString(),
      gasPrice: tx.gasPrice?.toString()
    });
    
    // Wait for confirmation with improved timeout handling
    const receipt = await waitForTransactionWithTimeout(tx);
    
    console.log('Transaction confirmed:', {
      hash: tx.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed?.toString(),
      status: receipt.status
    });
    
    if (receipt.status === 0) {
      throw new Error('Transaction failed (status: 0)');
    }
    
    return [{ tx, receipt }, null];
  } catch (error) {
    console.error('Transaction submission/confirmation failed:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Uploads a file to 0G storage
 * @param blob The blob to upload
 * @param storageRpc The storage RPC URL
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
    const indexer = new Indexer(storageRpc);
    
    const uploadOptions = {
      taskSize: 10,
      expectedReplica: 1,
      finalityRequired: true,
      tags: '0x',
      skipTx: false,
      fee: BigInt(0)
    };
    
    await indexer.upload(blob, l1Rpc, signer, uploadOptions);
    return [true, null];
  } catch (error) {
    return [false, error instanceof Error ? error : new Error(String(error))];
  }
} 