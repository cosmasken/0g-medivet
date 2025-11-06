/**
 * Network configuration for 0G Storage
 */

export type NetworkType = 'standard' | 'turbo';

export interface NetworkConfig {
  flowAddress: string;
  storageRpc: string;
  l1Rpc: string;
  explorerUrl: string;
}

/**
 * Get network configuration based on network type
 */
export function getNetworkConfig(networkType: NetworkType): NetworkConfig {
  const configs = {
    standard: {
      flowAddress: import.meta.env.VITE_STANDARD_FLOW_ADDRESS || '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526', // Mainnet Flow contract
      storageRpc: import.meta.env.VITE_STANDARD_STORAGE_RPC || 'https://indexer-storage.0g.ai',
      l1Rpc: import.meta.env.VITE_STANDARD_L1_RPC || 'https://evmrpc.0g.ai',
      explorerUrl: import.meta.env.VITE_STANDARD_EXPLORER_URL || 'https://chainscan.0g.ai/tx/'
    },
    turbo: {
      flowAddress: import.meta.env.VITE_TURBO_FLOW_ADDRESS || '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526', // Mainnet Flow contract
      storageRpc: import.meta.env.VITE_TURBO_STORAGE_RPC || 'https://indexer-storage-turbo.0g.ai',
      l1Rpc: import.meta.env.VITE_TURBO_L1_RPC || 'https://evmrpc.0g.ai',
      explorerUrl: import.meta.env.VITE_TURBO_EXPLORER_URL || 'https://chainscan.0g.ai/tx/'
    }
  };

  return configs[networkType];
}

/**
 * Get explorer URL for a transaction hash
 */
export function getExplorerUrl(txHash: string, networkType: NetworkType): string {
  const config = getNetworkConfig(networkType);
  return `${config.explorerUrl}${txHash}`;
}
