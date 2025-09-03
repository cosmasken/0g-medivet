import React, { createContext, useContext, useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { config } from '@/lib/config';

const queryClient = new QueryClient();

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  isConnecting: boolean;
  isHydrated: boolean;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: undefined,
  isConnected: false,
  isConnecting: false,
  isHydrated: false,
  connect: () => {},
  disconnect: () => {},
});

export const useWalletContext = () => useContext(WalletContext);

const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { connect: wagmiConnect, connectors } = useConnect();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  const connect = () => {
    if (!isHydrated || isConnecting) return;
    const injector = connectors.find(c => c.id === 'injected');
    if (injector) {
      wagmiConnect({ connector: injector });
    }
  };

  const disconnect = () => {
    wagmiDisconnect();
  };
  
  const walletContextValue: WalletContextType = {
    address,
    isConnected: isHydrated ? isConnected : false,
    isConnecting: isHydrated ? isConnecting : false,
    isHydrated,
    connect,
    disconnect,
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
