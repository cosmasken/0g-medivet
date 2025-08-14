import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  
  // Don't show layout on onboarding page
  if (location.pathname === '/onboarding' || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;