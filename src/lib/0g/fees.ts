import { calculatePrice, getMarketContract, FixedPriceFlow__factory } from '@0glabs/0g-ts-sdk';
import { BrowserProvider, Contract, formatEther } from 'ethers';

export interface FeeInfo {
  storageFee: string;
  totalFee: string;
  rawStorageFee: bigint;
  rawTotalFee: bigint;
  isLoading?: boolean;
}

/**
 * Gets an Ethereum provider
 * @returns A promise that resolves to the provider and any error
 */
export async function getProvider(): Promise<[BrowserProvider | null, Error | null]> {
  try {
    if (!(window as any).ethereum) {
      return [null, new Error('No Ethereum provider found')];
    }
    
    const provider = new BrowserProvider((window as any).ethereum);
    return [provider, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Gets a signer from a provider
 * @param provider The Ethereum provider
 * @returns A promise that resolves to the signer and any error
 */
export async function getSigner(provider: BrowserProvider): Promise<[any | null, Error | null]> {
  try {
    const signer = await provider.getSigner();
    return [signer, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Gets a flow contract instance
 * @param flowAddress The flow contract address
 * @param signer The signer
 * @returns The flow contract
 */
export function getFlowContract(flowAddress: string, signer: any): Contract {
  return FixedPriceFlow__factory.connect(flowAddress, signer) as unknown as Contract;
}

/**
 * Calculates fees for a submission
 * @param submission The submission object
 * @param flowContract The flow contract
 * @param provider The Ethereum provider
 * @returns A promise that resolves to the fee information and any error
 */
export async function calculateFees(
  submission: any, 
  flowContract: Contract, 
  provider: BrowserProvider
): Promise<[FeeInfo | null, Error | null]> {
  try {
    console.log('Starting fee calculation...', { submission });
    
    // Get market address and contract
    const marketAddr = await flowContract.market();
    console.log('Market address:', marketAddr);
    
    const market = getMarketContract(marketAddr, provider);
    
    // Get price per sector
    const pricePerSector = await market.pricePerSector();
    console.log('Price per sector:', pricePerSector.toString());
    
    // Ensure we have valid submission data
    if (!submission || !submission.length) {
      throw new Error('Invalid submission data');
    }
    
    // Calculate storage fee
    const storageFee = calculatePrice(submission, pricePerSector);
    console.log('Storage fee calculated:', storageFee.toString());
    
    // Ensure storage fee is not zero
    const actualStorageFee = storageFee === BigInt(0) ? BigInt('1000000000000000') : storageFee; // 0.001 ETH minimum
    if (storageFee === BigInt(0)) {
      console.warn('Storage fee is 0, using minimum:', actualStorageFee.toString());
    }
    
    // For 0G chain, total fee is just the storage fee (no gas fees)
    const totalFee = actualStorageFee;
    
    console.log('Final fee calculation (0G chain - storage only):', {
      storageFee: actualStorageFee.toString(),
      totalFee: totalFee.toString()
    });
    
    const result = {
      storageFee: formatEther(actualStorageFee),
      totalFee: formatEther(totalFee),
      rawStorageFee: actualStorageFee,
      rawTotalFee: totalFee,
      isLoading: false
    };
    
    console.log('Fee calculation result:', result);
    return [result, null];
  } catch (error) {
    console.error('Fee calculation error:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
