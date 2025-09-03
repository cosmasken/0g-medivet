import { calculatePrice, getMarketContract, FixedPriceFlow__factory } from '@0glabs/0g-ts-sdk/browser';
import { BrowserProvider, Contract, formatEther } from 'ethers';

export interface FeeInfo {
  storageFee: string;
  estimatedGas: string;
  totalFee: string;
  rawStorageFee: bigint;
  rawGasFee: bigint;
  rawTotalFee: bigint;
}

export async function getProvider(): Promise<[BrowserProvider | null, Error | null]> {
  try {
    if (!window.ethereum) {
      return [null, new Error('No Ethereum provider found')];
    }
    
    const provider = new BrowserProvider(window.ethereum);
    return [provider, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

export async function getSigner(provider: BrowserProvider): Promise<[any | null, Error | null]> {
  try {
    const signer = await provider.getSigner();
    return [signer, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}

export function getFlowContract(flowAddress: string, signer: any): Contract {
  return FixedPriceFlow__factory.connect(flowAddress, signer) as unknown as Contract;
}

export async function calculateFees(
  submission: any, 
  flowContract: Contract, 
  provider: BrowserProvider
): Promise<[FeeInfo | null, Error | null]> {
  try {
    // Get market address and contract
    const marketAddr = await flowContract.market();
    const market = getMarketContract(marketAddr, provider);
    
    // Get price per sector
    const pricePerSector = await market.pricePerSector();
    
    // Calculate storage fee
    const storageFee = calculatePrice(submission, pricePerSector);
    const actualStorageFee = storageFee === BigInt(0) ? BigInt('1000000000000000') : storageFee; // 0.001 ETH minimum
    
    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt('20000000000'); // 20 gwei fallback
    
    // Estimate gas
    let gasEstimate = BigInt(500000); // Default fallback
    try {
      gasEstimate = await flowContract.submit.estimateGas(submission, { value: actualStorageFee });
      // Add 20% buffer
      gasEstimate = gasEstimate * BigInt(120) / BigInt(100);
    } catch (error) {
      console.warn('Gas estimation failed, using fallback');
    }
    
    // Calculate fees
    const estimatedGasFee = gasEstimate * gasPrice;
    const totalFee = actualStorageFee + estimatedGasFee;
    
    return [{
      storageFee: formatEther(actualStorageFee),
      estimatedGas: formatEther(estimatedGasFee),
      totalFee: formatEther(totalFee),
      rawStorageFee: actualStorageFee,
      rawGasFee: estimatedGasFee,
      rawTotalFee: totalFee
    }, null];
  } catch (error) {
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
