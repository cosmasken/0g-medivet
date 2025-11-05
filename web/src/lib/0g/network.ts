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
      flowAddress: '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526',
      storageRpc: import.meta.env.VITE_TESTNET_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai',
      explorerUrl: 'https://chainscan.0g.ai/tx/',
      l1Rpc: import.meta.env.VITE_TESTNET_RPC_URL || 'https://evmrpc-testnet.0g.ai/',
      computeRpc: import.meta.env.VITE_TESTNET_RPC_URL || 'https://evmrpc-testnet.0g.ai/'
    },
    turbo: {
      name: 'Turbo',
      flowAddress: '0x62D4144dB0F0a6fBBaeb6296c785C71B3D57C526',
      storageRpc: import.meta.env.VITE_MAINNET_INDEXER_RPC || 'https://indexer-storage-turbo.0g.ai',
      explorerUrl: 'https://chainscan.0g.ai/tx/',
      l1Rpc: import.meta.env.VITE_MAINNET_RPC_URL || 'https://evmrpc.0g.ai/',
      computeRpc: import.meta.env.VITE_MAINNET_RPC_URL || 'https://evmrpc.0g.ai/'
    }
  };
  
  return NETWORKS[networkType];
}

export function getExplorerUrl(txHash: string, networkType: NetworkType): string {
  const network = getNetworkConfig(networkType);
  return network.explorerUrl + txHash;
}
