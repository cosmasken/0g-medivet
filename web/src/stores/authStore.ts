import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authenticateUser } from '@/lib/api';

export type Role = 'patient' | 'provider';

export interface User {
  id: string;
  walletAddress: string;
  role: Role;
  fullName?: string;
  isOnboarded: boolean;
}

interface AuthState {
  currentUser: User | null;
  isLoading: boolean;
  selectedRole: Role | null;
  
  // Actions
  setSelectedRole: (role: Role) => void;
  connectWallet: (walletAddress: string, role: Role) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoading: false,
      selectedRole: null,

      setSelectedRole: (role: Role) => {
        set({ selectedRole: role });
      },

      connectWallet: async (walletAddress: string, role: Role) => {
        console.log('🔐 Wallet connection started:', { walletAddress, role });
        set({ isLoading: true });
        
        try {
          // Try to authenticate with backend
          console.log('📡 Attempting backend authentication...');
          const response = await authenticateUser(walletAddress, role);
          console.log('✅ Backend authentication successful:', response);
          const user = response.user;

          const newUser: User = {
            id: user.id,
            walletAddress,
            role,
            fullName: user.username || walletAddress.slice(0, 8),
            isOnboarded: user.is_onboarded || false
          };

          set({ 
            currentUser: newUser, 
            selectedRole: role,
            isLoading: false 
          });

        } catch (error) {
          console.error('❌ Backend authentication failed:', error);
          
          // Retry authentication with a simple approach
          try {
            const retryResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/auth`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              credentials: 'include',
              body: JSON.stringify({ 
                wallet_address: walletAddress,
                role 
              })
            });
            
            if (retryResponse.ok) {
              const { user } = await retryResponse.json();
              const newUser: User = {
                id: user.id,
                walletAddress,
                role,
                fullName: user.username || walletAddress.slice(0, 8),
                isOnboarded: user.is_onboarded || false
              };
              
              set({ 
                currentUser: newUser, 
                selectedRole: role,
                isLoading: false 
              });
            } else {
              throw new Error('Authentication failed after retry');
            }
          } catch (retryError) {
            console.error('❌ Retry authentication also failed:', retryError);
            set({ isLoading: false });
            throw new Error('Unable to authenticate user');
          }
        }
      },

      logout: () => {
        set({ 
          currentUser: null, 
          selectedRole: null,
          isLoading: false 
        });
      },

      updateProfile: (updates: Partial<User>) => {
        const { currentUser } = get();
        if (currentUser) {
          set({ 
            currentUser: { ...currentUser, ...updates }
          });
        }
      }
    }),
    {
      name: 'medivet-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        selectedRole: state.selectedRole
      })
    }
  )
);
