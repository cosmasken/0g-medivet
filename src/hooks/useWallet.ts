import { useDisconnect } from 'wagmi';
import { useWalletContext } from '@/providers/Web3Provider';

/**
 * Custom hook for wallet connectivity using Wagmi
 * Provides wallet connection status and functions
 */
export function useWallet() {
  const { address, isConnected, isConnecting, isHydrated, connect } = useWalletContext();
  const { disconnect } = useDisconnect();

  const disconnectWallet = async () => {
    try {
      disconnect();
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  return {
    address,
    isConnected,
    isConnecting,
    isDisconnected: !isConnected && isHydrated,
    isHydrated,
    connect,
    disconnect: disconnectWallet
  };
}
