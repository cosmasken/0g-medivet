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
    
    // Get market address and contract
    const marketAddr = await flowContract.market();
    console.log('Market address:', marketAddr);
    
    const market = getMarketContract(marketAddr, provider);
    
    // Get price per sector
    const pricePerSector = await market.pricePerSector();
    console.log('Price per sector:', pricePerSector.toString());
    
    // Calculate storage fee
    const storageFee = calculatePrice(submission, pricePerSector);
    console.log('Storage fee calculated:', storageFee.toString());
    
    // Ensure minimum storage fee
    const actualStorageFee = storageFee === BigInt(0) ? BigInt('1000000000000000') : storageFee; // 0.001 ETH minimum
    
    // Get gas price
    const feeData = await provider.getFeeData();
    const gasPrice = feeData.gasPrice || BigInt('20000000000'); // 20 gwei fallback
    console.log('Gas price:', gasPrice.toString());
    
    // Estimate gas
    let gasEstimate = BigInt(500000); // Default fallback
    try {
      console.log('Estimating gas for submission...');
      gasEstimate = await flowContract.submit.estimateGas(submission, { value: actualStorageFee });
      console.log('Gas estimate:', gasEstimate.toString());
      // Add 20% buffer
      gasEstimate = gasEstimate * BigInt(120) / BigInt(100);
    } catch (error) {
      console.warn('Gas estimation failed, using fallback:', error);
    }
    
    // Calculate fees
    const estimatedGasFee = gasEstimate * gasPrice;
    const totalFee = actualStorageFee + estimatedGasFee;
    
    console.log('Final fee calculation:', {
      storageFee: actualStorageFee.toString(),
      gasEstimate: gasEstimate.toString(),
      gasPrice: gasPrice.toString(),
      estimatedGasFee: estimatedGasFee.toString(),
      totalFee: totalFee.toString()
    });
    
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
