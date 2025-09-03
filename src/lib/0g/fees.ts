import { calculatePrice, getMarketContract, FixedPriceFlow__factory } from '@0glabs/0g-ts-sdk/browser';
import { BrowserProvider, Contract, formatEther } from 'ethers';
import { getNetworkConfig, NetworkType } from './network';

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

export function getFlowContract(networkType: NetworkType, signer: any): Contract {
  const config = getNetworkConfig(networkType);
  return FixedPriceFlow__factory.connect(config.flowAddress, signer) as unknown as Contract;
}

export async function calculateFees(
  submission: any, 
  networkType: NetworkType = 'turbo'
): Promise<[FeeInfo | null, Error | null]> {
  try {
    console.log('Starting fee calculation...', { submission, networkType });
    
    // Get provider and signer
    const [provider, providerErr] = await getProvider();
    if (!provider) {
      throw providerErr || new Error('Failed to get provider');
    }
    
    const [signer, signerErr] = await getSigner(provider);
    if (!signer) {
      throw signerErr || new Error('Failed to get signer');
    }
    
    // Get flow contract
    const flowContract = getFlowContract(networkType, signer);
    console.log('Flow contract address:', await flowContract.getAddress());
    
    // Calculate basic storage fee (fallback approach)
    console.log('Submission object:', submission);
    const fileSizeInBytes = Number(submission.length) || 0;
    console.log('File size in bytes:', fileSizeInBytes);
    
    if (fileSizeInBytes === 0) {
      // Use a default minimum size if length is 0
      console.warn('File size is 0, using minimum size of 1KB');
      const minSize = 1024; // 1KB minimum
      const sectorSize = 256;
      const sectorsNeeded = Math.ceil(minSize / sectorSize);
      const actualStorageFee = BigInt(sectorsNeeded) * BigInt('1000000000000000');
      
      // Return minimal fee calculation
      const gasEstimate = BigInt(300000);
      const feeData = await provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt('20000000000');
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
    }
    
    const sectorSize = 256;
    const sectorsNeeded = Math.ceil(fileSizeInBytes / sectorSize);
    let actualStorageFee = BigInt(sectorsNeeded) * BigInt('1000000000000000'); // 0.001 ETH per sector
    
    try {
      // Try to get market pricing
      const marketAddr = await flowContract.market();
      console.log('Market address:', marketAddr);
      
      if (marketAddr && marketAddr !== '0x0000000000000000000000000000000000000000') {
        const market = getMarketContract(marketAddr, provider);
        const pricePerSector = await market.pricePerSector();
        console.log('Price per sector:', pricePerSector.toString());
        
        const storageFee = calculatePrice(submission, pricePerSector);
        if (storageFee > BigInt(0)) {
          actualStorageFee = storageFee;
        }
      }
    } catch (contractError) {
      console.warn('Market contract call failed, using fallback pricing');
    }
    
    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt('20000000000'); // 20 gwei
    
    // Conservative gas estimate
    const gasEstimate = BigInt(300000);
    
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
    console.error('Fee calculation error:', error);
    return [null, error instanceof Error ? error : new Error(String(error))];
  }
}
