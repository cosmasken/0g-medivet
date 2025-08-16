import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallet';

interface RequireWalletProps {
  children: React.ReactNode;
}

const RequireWallet: React.FC<RequireWalletProps> = ({ children }) => {
  const { isConnected, address } = useWallet();

  // If wallet is not connected, redirect to connect wallet page
  if (!isConnected || !address) {
    return <Navigate to="/connect" replace />;
  }

  return <>{children}</>;
};

export default RequireWallet;
