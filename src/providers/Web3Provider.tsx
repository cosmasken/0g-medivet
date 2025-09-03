import React, { createContext, useContext, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useConnect } from 'wagmi';
import { config } from '@/lib/config';

const queryClient = new QueryClient();

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isHydrated: boolean;
  connect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isHydrated: false,
  connect: () => {},
});

export const useWalletContext = () => useContext(WalletContext);

const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const connect = () => {
    if (!isHydrated) return;
    const injector = connectors.find(c => c.id === 'injected');
    if (injector) {
      wagmiConnect({ connector: injector });
    }
  };
  
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

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
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
