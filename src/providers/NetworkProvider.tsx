import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NetworkType = 'standard' | 'turbo';

interface NetworkContextType {
  networkType: NetworkType;
  setNetworkType: (type: NetworkType) => void;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

interface NetworkProviderProps {
  children: ReactNode;
}

export function NetworkProvider({ children }: NetworkProviderProps) {
  const [networkType, setNetworkType] = useState<NetworkType>('standard');

  return (
    <NetworkContext.Provider value={{ networkType, setNetworkType }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
