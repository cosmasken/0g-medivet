import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role, PatientProfile, ProviderProfile } from '@/types';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (role: Role, profile: PatientProfile | ProviderProfile) => void;
  logout: () => void;
  updateProfile: (profile: PatientProfile | ProviderProfile) => void;
}

// Seed users for demo
const seedUsers: User[] = [
  {
    id: 'patient_1',
    role: 'Patient',
    principal: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    profile: {
      fullName: 'Sarah Johnson',
      dob: '1985-03-15',
      contact: 'sarah.johnson@email.com',
      emergency: 'John Johnson - +1 555-0123',
      medicalHistory: 'Hypertension, Type 2 Diabetes',
      allergies: 'Penicillin, Peanuts',
      medications: 'Metformin 500mg, Lisinopril 10mg',
      monetizeEnabled: true
    } as PatientProfile
  },
  {
    id: 'provider_1',
    role: 'Provider',
    principal: 'rrkah-fqaaa-aaaah-qcaiq-cai',
    profile: {
      name: 'Dr. Michael Chen',
      license: 'MD123456',
      specialty: 'Cardiology',
      contact: 'dr.chen@medivet.com',
      whitelisted: true,
      reputation: 95
    } as ProviderProfile
  },
  {
    id: 'provider_2',
    role: 'Provider',
    principal: 'rjqhf-xiaaa-aaaah-qcaiq-cai',
    profile: {
      name: 'Dr. Emily Rodriguez',
      license: 'MD789012',
      specialty: 'Endocrinology',
      contact: 'dr.rodriguez@medivet.com',
      whitelisted: false,
      reputation: 88
    } as ProviderProfile
  },
  {
    id: 'admin_1',
    role: 'Admin',
    principal: 'rdmx6-jaaaa-aaaah-admin-cai',
    profile: {
      name: 'Admin User',
      license: 'ADMIN001',
      specialty: 'Platform Administration',
      contact: 'admin@medivet.com',
      whitelisted: true,
      reputation: 100
    } as ProviderProfile
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: (role: Role, profile: PatientProfile | ProviderProfile) => {
        // Find existing user or create new one
        let user = seedUsers.find(u => u.role === role && 
          ('fullName' in profile ? profile.fullName === (u.profile as PatientProfile).fullName : 
           profile.name === (u.profile as ProviderProfile).name));
        
        if (!user) {
          // Create new user
          user = {
            id: `${role.toLowerCase()}_${Date.now()}`,
            role,
            principal: `${role.toLowerCase()}-${Date.now()}-cai`,
            profile
          };
          seedUsers.push(user);
        }

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
      }
    }),
    {
      name: 'medivet-auth'
    }
  )
);