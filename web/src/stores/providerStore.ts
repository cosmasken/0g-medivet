import { create } from 'zustand';

export type AccessLevel = 'view' | 'edit' | 'full';

export interface Provider {
  id: string;
  walletAddress: string;
  name: string;
  specialty?: string;
  accessLevel: AccessLevel;
  addedAt: string;
}

interface ProviderStore {
  providers: Provider[];
  addProvider: (walletAddress: string, name: string, accessLevel: AccessLevel, specialty?: string) => void;
  removeProvider: (walletAddress: string) => void;
  updateAccessLevel: (walletAddress: string, accessLevel: AccessLevel) => void;
  searchProviders: (query: string) => Provider[];
  getProvidersByAccess: (accessLevel: AccessLevel) => Provider[];
}

export const useProviderStore = create<ProviderStore>((set, get) => ({
  providers: [],
  
  addProvider: (walletAddress, name, accessLevel, specialty) => {
    const provider: Provider = {
      id: `provider-${Date.now()}`,
      walletAddress: walletAddress.toLowerCase(),
      name,
      specialty,
      accessLevel,
      addedAt: new Date().toISOString()
    };
    
    set(state => ({
      providers: [...state.providers.filter(p => p.walletAddress !== walletAddress.toLowerCase()), provider]
    }));
  },
  
  removeProvider: (walletAddress) => {
    set(state => ({
      providers: state.providers.filter(p => p.walletAddress !== walletAddress.toLowerCase())
    }));
  },
  
  updateAccessLevel: (walletAddress, accessLevel) => {
    set(state => ({
      providers: state.providers.map(p => 
        p.walletAddress === walletAddress.toLowerCase() 
          ? { ...p, accessLevel }
          : p
      )
    }));
  },
  
  searchProviders: (query) => {
    const { providers } = get();
    const lowerQuery = query.toLowerCase();
    return providers.filter(p => 
      p.walletAddress.toLowerCase().includes(lowerQuery) ||
      p.name.toLowerCase().includes(lowerQuery) ||
      p.specialty?.toLowerCase().includes(lowerQuery)
    );
  },
  
  getProvidersByAccess: (accessLevel) => {
    const { providers } = get();
    return providers.filter(p => p.accessLevel === accessLevel);
  }
}));
