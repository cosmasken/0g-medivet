import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// 0G Galileo Testnet
const zgGalileo = {
  id: 16600,
  name: '0G Galileo Testnet',
  network: '0g-galileo',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: 'A0GI',
  },
  rpcUrls: {
    public: { http: ['https://evmrpc-testnet.0g.ai'] },
    default: { http: ['https://evmrpc-testnet.0g.ai'] },
  },
  blockExplorers: {
    default: { name: 'Newton Explorer', url: 'https://chainscan-newton.0g.ai' },
  },
} as const

export const config = createConfig({
  chains: [zgGalileo, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [zgGalileo.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
