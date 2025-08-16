import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';

// Define the zgTestnet chain
export const zgTestnet = {
  id: 16601,
  name: '0G Galileo Testnet',
  network: '0g-galileo-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'OG',
    symbol: 'OG',
  },
  rpcUrls: {
    default: {
      http: [import.meta.env.VITE_L1_RPC || 'https://evmrpc-testnet.0g.ai'],
    },
    public: {
      http: [import.meta.env.VITE_L1_RPC || 'https://evmrpc-testnet.0g.ai'],
    },
  },
} as const;

// Simple wagmi config using injected connector (MetaMask, etc.)
export const config = createConfig({
  chains: [zgTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [zgTestnet.id]: http(import.meta.env.VITE_L1_RPC || 'https://evmrpc-testnet.0g.ai'),
  },
});
