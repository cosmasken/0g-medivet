import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProviderProfile } from '@/types';

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
    name: 'Dr. Michael Chen',
    license: 'MD123456',
    specialty: 'Cardiology',
    contact: 'dr.chen@medivet.com',
    whitelisted: true,
    reputation: 95
  },
  {
    name: 'Dr. Emily Rodriguez',
    license: 'MD789012',
    specialty: 'Endocrinology',
    contact: 'dr.rodriguez@medivet.com',
    whitelisted: false,
    reputation: 88
  },
  {
    name: 'Dr. James Wilson',
    license: 'MD345678',
    specialty: 'Neurology',
    contact: 'dr.wilson@medivet.com',
    whitelisted: false,
    reputation: 92
  },
  {
    name: 'Dr. Sarah Kim',
    license: 'MD901234',
    specialty: 'Psychiatry',
    contact: 'dr.kim@medivet.com',
    whitelisted: true,
    reputation: 89
  }
];

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      providers: seedProviders,

      whitelistProvider: (license, whitelisted) => {
        set(state => ({
          providers: state.providers.map(provider =>
            provider.license === license
              ? { ...provider, whitelisted }
              : provider
          )
        }));
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