/**
 * Fee calculation utilities for 0G Storage
 */

import { ethers, Contract, JsonRpcProvider, BrowserProvider } from 'ethers';
import { formatEther } from 'ethers';

export interface FeeInfo {
  storageFee: string;
  estimatedGas: string;
  totalFee: string;
  rawStorageFee: bigint;
  rawGasFee: bigint;
  rawTotalFee: bigint;
  isLoading: boolean;
}

const FLOW_ABI = [
  'function submit(tuple(uint256 length, bytes tags, bytes nodes) submission) payable returns (uint256)',
  'function getPrice() view returns (uint256)'
];

/**
 * Get Ethereum provider
 */
export async function getProvider(): Promise<[JsonRpcProvider | null, Error | null]> {
  try {
    const l1Rpc = import.meta.env.VITE_L1_RPC || 'https://evmrpc-testnet.0g.ai';
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
  return new Contract(flowAddress, FLOW_ABI, signer);
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
    // Get storage price per byte
    const pricePerByte = await flowContract.getPrice();
    const storageFee = BigInt(submission.length) * pricePerByte;
    
    // Estimate gas for the transaction
    const gasEstimate = await flowContract.submit.estimateGas(submission, {
      value: storageFee
    });
    
    // Get current gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt(0);
    const gasFee = gasEstimate * gasPrice;
    
    const totalFee = storageFee + gasFee;
    
    return [{
      storageFee: formatEther(storageFee),
      estimatedGas: formatEther(gasFee),
      totalFee: formatEther(totalFee),
      rawStorageFee: storageFee,
      rawGasFee: gasFee,
      rawTotalFee: totalFee,
      isLoading: false
    }, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
