import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';

interface RequireWalletProps {
  children: React.ReactNode;
}

const RequireWallet: React.FC<RequireWalletProps> = ({ children }) => {
  const { isConnected, address } = useWallet();
  const { isAuthenticated } = useAuthStore();

  if (!isConnected || !address || !isAuthenticated) {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
};

export default RequireWallet;
