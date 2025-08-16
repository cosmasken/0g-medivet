import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProviderProfile } from '@/types';
import { useAuthStore } from './authStore';

interface AdminState {
  providers: ProviderProfile[];
  whitelistProvider: (license: string, whitelisted: boolean) => void;
  toggleMonetizeFlag: (recordId: number) => void;
  updateProviderReputation: (license: string, reputation: number) => void;
  getProviders: () => ProviderProfile[];
  getPendingProviders: () => ProviderProfile[];
}

// Seed provider data
const seedProviders: ProviderProfile[] = [
  {
    name: 'Dr. John Smith',
    license: 'MD555555',
    specialty: 'General Practice',
    contact: 'dr.smith@medivet.com',
    whitelisted: true,
    reputation: 98,
    organization: 'General Hospital',
    lastInteraction: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    name: 'Dr. Michael Chen',
    license: 'MD123456',
    specialty: 'Cardiology',
    contact: 'dr.chen@medivet.com',
    whitelisted: true,
    reputation: 95,
    organization: 'Heartbeat Clinic',
    lastInteraction: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    name: 'Dr. Emily Rodriguez',
    license: 'MD789012',
    specialty: 'Endocrinology',
    contact: 'dr.rodriguez@medivet.com',
    whitelisted: false,
    reputation: 88,
    organization: 'Wellness Center',
    lastInteraction: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    name: 'Dr. James Wilson',
    license: 'MD345678',
    specialty: 'Neurology',
    contact: 'dr.wilson@medivet.com',
    whitelisted: false,
    reputation: 92,
    organization: 'Brainiacs Institute',
    lastInteraction: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    name: 'Dr. Sarah Kim',
    license: 'MD901234',
    specialty: 'Psychiatry',
    contact: 'dr.kim@medivet.com',
    whitelisted: true,
    reputation: 89,
    organization: 'Mindful Solutions',
    lastInteraction: new Date(Date.now() - 86400000 * 15).toISOString(),
  }
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      providers: seedProviders,

      whitelistProvider: (license, whitelisted) => {
        set(state => {
          const updatedProviders = state.providers.map(provider =>
            provider.license === license
              ? { ...provider, whitelisted }
              : provider
          );

          // Check if the currently logged-in user is the one being whitelisted/unwhitelisted
          const currentUser = useAuthStore.getState().currentUser;
          if (currentUser && currentUser.role === 'Provider' && currentUser.profile.license === license) {
            const updatedProfile = updatedProviders.find(p => p.license === license);
            if (updatedProfile) {
              useAuthStore.getState().updateProfile(updatedProfile);
            }
          }

          return { providers: updatedProviders };
        });
      },

      toggleMonetizeFlag: (recordId) => {
        // This would interact with the record store in a real implementation
        console.log(`Toggling monetize flag for record ${recordId}`);
      },

      updateProviderReputation: (license, reputation) => {
        set(state => ({
          providers: state.providers.map(provider =>
            provider.license === license
              ? { ...provider, reputation }
              : provider
          )
        }));
      },

      getProviders: () => {
        return get().providers;
      },

      getPendingProviders: () => {
        return get().providers.filter(provider => !provider.whitelisted);
      }
    }),
    {
      name: 'medivet-admin'
    }
  )
);