import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authenticateUser, updateUserProfile as apiUpdateProfile, updateHealthProfile as apiUpdateHealthProfile, completeUserOnboarding } from '@/lib/api';

export type Role = 'patient' | 'provider';

export interface HealthProfile {
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  lastCheckup?: string;
}

export interface PatientProfile {
  fullName: string;
  dob: string;
  contact: string;
  emergency: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  monetizeEnabled?: boolean;
  // Health profile data
  healthProfile?: HealthProfile;
  // Onboarding data
  email?: string;
  phone?: string;
  profileCompleted?: boolean;
}

export interface ProviderProfile {
  fullName: string;
  specialization: string;
  licenseNumber: string;
  contact: string;
  hospital?: string;
  experience?: string;
}

export interface User {
  id: string;
  walletAddress: string;
  role: Role;
  profile: PatientProfile | ProviderProfile;
  isOnboarded: boolean;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  selectedRole: Role | null;
  login: (role: Role, profile: PatientProfile | ProviderProfile, walletAddress: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: PatientProfile | ProviderProfile) => Promise<void>;
  updateHealthProfile: (healthData: Partial<HealthProfile>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setSelectedRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,
      isLoading: false,
      selectedRole: localStorage.getItem('selectedRole') as Role | null,

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setSelectedRole: (role: Role) => {
        localStorage.setItem('selectedRole', role);
        set({ selectedRole: role });
      },

      login: async (role: Role, profile: PatientProfile | ProviderProfile, walletAddress: string) => {
        try {
          set({ isLoading: true });
          // Authenticate with backend
          const { user } = await authenticateUser(walletAddress, role);
          
          const newUser: User = {
            id: user.id,
            walletAddress,
            role,
            profile: user.user_profiles?.[0] ? {
              fullName: user.user_profiles[0].full_name || '',
              dob: user.user_profiles[0].date_of_birth || '',
              contact: user.user_profiles[0].contact || user.user_profiles[0].email || '',
              emergency: user.user_profiles[0].emergency_contact || '',
              email: user.user_profiles[0].email,
              phone: user.user_profiles[0].phone,
              profileCompleted: user.user_profiles[0].profile_completed || false,
              ...profile,
              // Initialize health profile if not present
              healthProfile: {
                bloodType: '',
                allergies: [],
                medicalHistory: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
                emergencyContactRelation: '',
                lastCheckup: ''
              }
            } : {
              ...profile,
              // Initialize health profile if not present
              healthProfile: {
                bloodType: '',
                allergies: [],
                medicalHistory: '',
                emergencyContactName: '',
                emergencyContactPhone: '',
                emergencyContactRelation: '',
                lastCheckup: ''
              }
            },
            isOnboarded: user.is_onboarded || false
          };

          set({
            currentUser: newUser,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error) {
          set({ isLoading: false });
          console.error('Login failed:', error);
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('selectedRole');
        set({
          currentUser: null,
          isAuthenticated: false,
          selectedRole: null
        });
      },

      updateProfile: async (profile: PatientProfile | ProviderProfile) => {
        const currentUser = get().currentUser;
        if (currentUser) {
          try {
            set({ isLoading: true });
            // Update profile in backend
            await apiUpdateProfile(currentUser.id, {
              full_name: profile.fullName,
              email: (profile as any).email,
              phone: (profile as any).phone,
              date_of_birth: profile.dob,
              contact: profile.contact,
              emergency_contact: (profile as PatientProfile).emergency,
              profile_completed: true
            });

            const updatedUser = {
              ...currentUser,
              profile
            };
            set({ currentUser: updatedUser, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            console.error('Profile update failed:', error);
            throw error;
          }
        }
      },

      updateHealthProfile: async (healthData) => {
        const { currentUser } = get();
        if (!currentUser) return;

        try {
          // Update health profile in backend
          await apiUpdateHealthProfile(currentUser.id, healthData);
          
          // Update local state
          const updatedHealthProfile = {
            ...currentUser.profile.healthProfile,
            ...healthData
          };
          
          set(state => ({
            currentUser: state.currentUser ? {
              ...state.currentUser,
              profile: {
                ...state.currentUser.profile,
                healthProfile: updatedHealthProfile
              }
            } : null
          }));
        } catch (error) {
          console.error('Health profile update failed:', error);
          throw error;
        }
      },

      completeOnboarding: async () => {
        const currentUser = get().currentUser;
        if (currentUser) {
          try {
            set({ isLoading: true });
            await completeUserOnboarding(currentUser.id);
            
            const updatedUser = {
              ...currentUser,
              isOnboarded: true
            };
            set({ currentUser: updatedUser, isLoading: false });
          } catch (error) {
            set({ isLoading: false });
            console.error('Onboarding completion failed:', error);
            throw error;
          }
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
);
