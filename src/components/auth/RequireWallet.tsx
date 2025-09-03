import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import OnboardingFlow from '@/components/OnboardingFlow';

interface RequireWalletProps {
  children: React.ReactNode;
}

const RequireWallet: React.FC<RequireWalletProps> = ({ children }) => {
  const { isConnected, address } = useWallet();
  const { isAuthenticated, currentUser, completeOnboarding, selectedRole } = useAuthStore();

  // Redirect to connect if wallet not connected
  if (!isConnected || !address) {
    return <Navigate to="/connect" replace />;
  }

  // Redirect to role selection if no role selected (first time users)
  if (!selectedRole && !isAuthenticated) {
    return <Navigate to="/role-selection" replace />;
  }

  // Show onboarding if user hasn't completed it
  if (currentUser && !currentUser.isOnboarded) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return <>{children}</>;
};

export default RequireWallet;
