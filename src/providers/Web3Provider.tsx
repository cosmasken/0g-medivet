import React, { createContext, useContext, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useConnect } from 'wagmi';
import { config } from '@/lib/config';

// Create a client
const queryClient = new QueryClient();

// Types for our wallet context
interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isHydrated: boolean;
  connect: () => void;
}

// Create the context with a default value
const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isHydrated: false,
  connect: () => {},
});

// Hook to use the wallet context
export const useWalletContext = () => useContext(WalletContext);

const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Track hydration state
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Wagmi hooks - only used after hydration
  const { address, isConnected, isConnecting } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  
  // Mark as hydrated on client side
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  // Simplified connect function using injected connector
  const connect = () => {
    if (!isHydrated) return;
    
    const injector = connectors.find(c => c.id === 'injected');
    if (injector) {
      wagmiConnect({ connector: injector });
    }
  };
  
  // Create a stable wallet context value
  const walletContextValue: WalletContextType = {
    address,
    isConnected: isHydrated ? isConnected : false,
    isConnecting: isHydrated ? isConnecting : false,
    isHydrated,
    connect,
  };
  
  return (
    <WalletContext.Provider value={walletContextValue}>
      {children}
    </WalletContext.Provider>
  );
};

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);

  // Mark component as mounted
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* Prevent hydration mismatches */}
        {!mounted ? (
          <div className="min-h-screen bg-background" />
        ) : (
          <WalletProvider>
            {children}
          </WalletProvider>
        )}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
