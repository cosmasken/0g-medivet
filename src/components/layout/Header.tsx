import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';
import WalletConnect from './WalletConnect';
import RoleSelectionDialog from '@/components/auth/RoleSelectionDialog';
import { useWallet } from '@/hooks/useWallet';

const Header: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { address, isConnected } = useWallet();
  const [isDark, setIsDark] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  // Show role selection when wallet connects but no user profile exists
  useEffect(() => {
    if (isConnected && address && !currentUser) {
      setShowRoleSelection(true);
    } else if (!isConnected || !address) {
      setShowRoleSelection(false);
    }
  }, [isConnected, address, currentUser]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <>
      <header className="medical-card border-b border-border px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
                <span className="text-primary-foreground font-bold text-sm">ØG</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">0G MediVet</h1>
            </div>
            {currentUser && (
              <div className="hidden md:flex items-center space-x-1 text-sm text-muted-foreground">
                <span>•</span>
                <span className="capitalize">{currentUser.role}</span>
                <span>•</span>
                <span className="text-accent font-medium">AI-Powered</span>
                {currentUser.role === 'Provider' && 'whitelisted' in currentUser.profile && (
                  <>
                    <span>•</span>
                    <span className={currentUser.profile.whitelisted ? 'text-success' : 'text-warning'}>
                      {currentUser.profile.whitelisted ? 'Verified' : 'Pending'}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="medical-transition"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>

            <WalletConnect />
          </div>
        </div>
      </header>
      
      {/* Role Selection Dialog */}
      {address && (
        <RoleSelectionDialog
          isOpen={showRoleSelection}
          onClose={() => setShowRoleSelection(false)}
          walletAddress={address}
        />
      )}
    </>
  );
};

export default Header;