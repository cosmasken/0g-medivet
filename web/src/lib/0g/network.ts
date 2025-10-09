export type NetworkType = 'standard' | 'turbo';

export interface NetworkConfig {
  name: string;
  flowAddress: string;
  storageRpc: string;
  explorerUrl: string;
  l1Rpc: string;
  computeRpc: string;
}

export function getNetworkConfig(networkType: NetworkType): NetworkConfig {
  const NETWORKS: Record<string, NetworkConfig> = {
    standard: {
      name: 'Standard',
      flowAddress: import.meta.env.VITE_STANDARD_FLOW_ADDRESS || '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
      storageRpc: import.meta.env.VITE_STANDARD_STORAGE_RPC || 'https://indexer-storage-testnet-standard.0g.ai',
      explorerUrl: import.meta.env.VITE_STANDARD_EXPLORER_URL || 'https://chainscan-galileo.0g.ai/tx/',
      l1Rpc: import.meta.env.VITE_L1_RPC || 'https://evmrpc-testnet.0g.ai',
      computeRpc: import.meta.env.VITE_COMPUTE_RPC || 'https://evmrpc-testnet.0g.ai'
    },
    turbo: {
      name: 'Turbo',
      flowAddress: import.meta.env.VITE_TURBO_FLOW_ADDRESS || '0xbD75117F80b4E22698D0Cd7612d92BDb8eaff628',
      storageRpc: import.meta.env.VITE_TURBO_STORAGE_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
      explorerUrl: import.meta.env.VITE_TURBO_EXPLORER_URL || 'https://chainscan-galileo.0g.ai/tx/',
      l1Rpc: import.meta.env.VITE_L1_RPC || 'https://evmrpc-testnet.0g.ai',
      computeRpc: import.meta.env.VITE_COMPUTE_RPC || 'https://evmrpc-testnet.0g.ai'
    }
  };
  
  return NETWORKS[networkType];
}

export function getExplorerUrl(txHash: string, networkType: NetworkType): string {
  const network = getNetworkConfig(networkType);
  return network.explorerUrl + txHash;
}
