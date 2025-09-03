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
  const { isAuthenticated, currentUser, completeOnboarding } = useAuthStore();

  if (!isConnected || !address || !isAuthenticated) {
    return <Navigate to="/connect" replace />;
  }

  // Show onboarding if user hasn't completed it
  if (currentUser && !currentUser.isOnboarded) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  return <>{children}</>;
};

export default RequireWallet;
