import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = import.meta.env.VITE_PROJECT_ID || import.meta.env.VITE_WALLETCONNECT_PROJECT_ID

// 0G Aristotle Mainnet
const zgAristotle = {
  id: 16661,
  name: '0G Aristotle Mainnet',
  network: '0g-aristotle',
  nativeCurrency: {
    decimals: 18,
    name: '0G',
    symbol: 'A0GI',
  },
  rpcUrls: {
    public: { http: ['https://evmrpc.0g.ai'] },
    default: { http: ['https://evmrpc.0g.ai'] },
  },
  blockExplorers: {
    default: { name: '0G Explorer', url: 'https://chainscan.0g.ai' },
  },
} as const

export const config = createConfig({
  chains: [zgAristotle, mainnet, sepolia],
  connectors: [
    injected(),
    metaMask(),
    ...(projectId ? [walletConnect({ projectId })] : []),
  ],
  transports: {
    [zgAristotle.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
