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
  const { isAuthenticated, currentUser, completeOnboarding, selectedRole, isLoading } = useAuthStore();

  // Show loading while auth operations are in progress
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to connect if wallet not connected
  if (!isConnected || !address) {
    return <Navigate to="/connect" replace />;
  }

  // If authenticated, show onboarding or children
  if (isAuthenticated) {
    // Show onboarding if user hasn't completed it
    if (currentUser && !currentUser.isOnboarded) {
      return <OnboardingFlow onComplete={completeOnboarding} />;
    }
    // User is authenticated and onboarded, show protected content
    return <>{children}</>;
  }

  // Not authenticated - redirect to role selection if no role
  if (!selectedRole) {
    return <Navigate to="/role-selection" replace />;
  }

  // Has role but not authenticated yet - show loading
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Authenticating...</p>
      </div>
    </div>
  );
};

export default RequireWallet;
