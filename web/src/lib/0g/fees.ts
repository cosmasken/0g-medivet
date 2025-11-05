import { calculatePrice, getMarketContract, FixedPriceFlow__factory } from '@0glabs/0g-ts-sdk';
import { BrowserProvider, Contract, formatEther } from 'ethers';

export interface FeeInfo {
  storageFee: string;
  estimatedGas: string;
  totalFee: string;
  rawStorageFee: bigint;
  rawGasFee: bigint;
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
 * Simple calculateFees function for current usage
 * @param submission The submission object
 * @param networkType The network type
 * @returns A promise that resolves to the fee information and any error
 */
export async function calculateFees(
  submission: any, 
  networkType: string
): Promise<[FeeInfo | null, Error | null]> {
  try {
    console.log('Starting fee calculation...', { submission, networkType });
    
    // Get provider and signer
    const [provider, providerErr] = await getProvider();
    if (!provider) {
      throw new Error(`Provider error: ${providerErr?.message}`);
    }
    
    const [signer, signerErr] = await getSigner(provider);
    if (!signer) {
      throw new Error(`Signer error: ${signerErr?.message}`);
    }
    
    // Get flow contract address based on network
    const flowAddress = networkType === 'turbo' 
      ? '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628'
      : '0x0460aA47b41a66694c0a73f667a1b795A5ED3556';
    
    console.log('Flow contract address:', flowAddress);
    
    const flowContract = getFlowContract(flowAddress, signer);
    
    return await calculateFeesWithContract(submission, flowContract, provider);
  } catch (error) {
    console.error('Fee calculation error:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

/**
 * Calculates fees for a submission with contract
 * @param submission The submission object
 * @param flowContract The flow contract
 * @param provider The Ethereum provider
 * @returns A promise that resolves to the fee information and any error
 */
export async function calculateFeesWithContract(
  submission: any, 
  flowContract: Contract, 
  provider: BrowserProvider
): Promise<[FeeInfo | null, Error | null]> {
  try {
    console.log('Starting fee calculation...', { submission });
    
    // Try to get market address, but use fallback if it fails
    let marketAddr;
    let pricePerSector = BigInt('1000000000000000'); // 0.001 OG fallback
    
    try {
      marketAddr = await flowContract.market();
      console.log('Market address:', marketAddr);
      
      const market = getMarketContract(marketAddr, provider);
      pricePerSector = await market.pricePerSector();
      console.log('Price per sector:', pricePerSector.toString());
    } catch (error) {
      console.warn('Failed to get market data, using fallback pricing:', error);
    }
    
    // Ensure we have valid submission data
    if (!submission || !submission.length) {
      throw new Error('Invalid submission data');
    }
    
    // Calculate storage fee with fallback
    let storageFee;
    try {
      storageFee = calculatePrice(submission, pricePerSector);
    } catch (error) {
      console.warn('Price calculation failed, using size-based fallback:', error);
      // Fallback: ~0.001 OG per MB
      const sizeInMB = Math.ceil(submission.length / (1024 * 1024));
      storageFee = BigInt(sizeInMB) * BigInt('1000000000000000');
    }
    
    console.log('Storage fee calculated:', storageFee.toString());
    
    // Ensure storage fee is not zero
    const actualStorageFee = storageFee === BigInt(0) ? BigInt('1000000000000000') : storageFee;
    
    // Simple gas estimation fallback
    const gasEstimate = BigInt(500000);
    const gasPrice = BigInt('20000000000'); // 20 gwei
    const estimatedGasFee = gasEstimate * gasPrice;
    const totalFee = actualStorageFee + estimatedGasFee;
    
    const result = {
      storageFee: formatEther(actualStorageFee),
      estimatedGas: formatEther(estimatedGasFee),
      totalFee: formatEther(totalFee),
      rawStorageFee: actualStorageFee,
      rawGasFee: estimatedGasFee,
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
