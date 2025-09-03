import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'patient' | 'provider' | 'admin';

export interface PatientProfile {
  fullName: string;
  dob: string;
  contact: string;
  emergency: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  monetizeEnabled?: boolean;
  // Onboarding data
  email?: string;
  phone?: string;
  profileCompleted?: boolean;
}

export interface ProviderProfile {
  name: string;
  license: string;
  specialty: string;
  contact: string;
  whitelisted: boolean;
  reputation: number;
}

export interface User {
  id: string;
  role: Role;
  walletAddress: string;
  profile: PatientProfile | ProviderProfile;
  isOnboarded?: boolean;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (role: Role, profile: PatientProfile | ProviderProfile, walletAddress: string) => void;
  logout: () => void;
  updateProfile: (profile: PatientProfile | ProviderProfile) => void;
  completeOnboarding: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (role: Role, profile: PatientProfile | ProviderProfile, walletAddress: string) => {
        const user: User = {
          id: `${role}_${Date.now()}`,
          role,
          walletAddress,
          profile,
          isOnboarded: false
        };

        set({
          currentUser: user,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false
        });
      },

      updateProfile: (profile: PatientProfile | ProviderProfile) => {
        const currentUser = get().currentUser;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            profile
          };
          set({ currentUser: updatedUser });
        }
      },

      completeOnboarding: () => {
        const currentUser = get().currentUser;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            isOnboarded: true
          };
          set({ currentUser: updatedUser });
        }
      }
    }),
    {
      name: 'medivet-auth'
    }
  )
);
