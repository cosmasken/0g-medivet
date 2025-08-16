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
  
  // Don't show layout on onboarding, but show Header on connect page for role selection
  if (location.pathname === '/onboarding') {
    return <>{children}</>;
  }
  
  // For connect page, show Header but no Sidebar
  if (location.pathname === '/connect') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        {children}
      </div>
    );
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