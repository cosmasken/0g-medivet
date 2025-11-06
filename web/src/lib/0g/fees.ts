/**
 * Fee calculation utilities for 0G Storage
 */

import { calculatePrice, getMarketContract, FixedPriceFlow__factory } from '@0glabs/0g-ts-sdk';
import { Contract, JsonRpcProvider, BrowserProvider, formatEther } from 'ethers';

export interface FeeInfo {
  storageFee: string;
  estimatedGas: string;
  totalFee: string;
  rawStorageFee: bigint;
  rawGasFee: bigint;
  rawTotalFee: bigint;
  isLoading: boolean;
}

/**
 * Get Ethereum provider
 */
export async function getProvider(): Promise<[JsonRpcProvider | null, Error | null]> {
  try {
    const l1Rpc = import.meta.env.VITE_L1_RPC || 'https://evmrpc.0g.ai';
    const provider = new JsonRpcProvider(l1Rpc);
    return [provider, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Get signer from browser wallet
 */
export async function getSigner(provider: JsonRpcProvider): Promise<[any | null, Error | null]> {
  try {
    if (!window.ethereum) {
      throw new Error('No wallet found');
    }
    
    const browserProvider = new BrowserProvider(window.ethereum);
    const signer = await browserProvider.getSigner();
    return [signer, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Get flow contract instance
 */
export function getFlowContract(flowAddress: string, signer: any): Contract {
  return FixedPriceFlow__factory.connect(flowAddress, signer) as unknown as Contract;
}

/**
 * Calculate fees for submission
 */
export async function calculateFees(
  submission: any,
  flowContract: Contract,
  provider: JsonRpcProvider
): Promise<[FeeInfo | null, Error | null]> {
  try {
    // Get market address from the flow contract
    const marketAddr = await flowContract.market();
    const market = getMarketContract(marketAddr, provider);
    
    // Get price per sector from market contract
    const pricePerSector = await market.pricePerSector();
    
    // Calculate storage fee using the SDK function
    const storageFee = calculatePrice(submission, pricePerSector);
    
    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    
    // Estimate gas for the transaction with fallback
    let gasEstimate;
    try {
      gasEstimate = await flowContract.submit.estimateGas(submission, { value: storageFee });
    } catch (error) {
      // Use fallback gas estimate if estimation fails
      gasEstimate = BigInt(500000); // Fallback gas estimate
    }
    
    // Calculate estimated gas fee and total fee
    const estimatedGasFee = gasEstimate * gasPrice;
    const totalFee = BigInt(storageFee) + estimatedGasFee;
    
    return [{
      storageFee: formatEther(storageFee),
      estimatedGas: formatEther(estimatedGasFee),
      totalFee: formatEther(totalFee),
      rawStorageFee: storageFee,
      rawGasFee: estimatedGasFee,
      rawTotalFee: totalFee,
      isLoading: false
    }, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
