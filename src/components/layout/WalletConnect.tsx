import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  LogOut,
  User,
  CreditCard,
  Shield,
  Stethoscope,
  UserCircle
} from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { useNetwork } from '@/providers/NetworkProvider';
import { getNetworkConfig } from '@/lib/0g/network';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const WalletConnect: React.FC = () => {
  const { address, isConnected, isConnecting, isHydrated, connect, disconnect } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const { networkType } = useNetwork();

  const network = getNetworkConfig(networkType);

  // Show loading state while hydrating
  if (!isHydrated) {
    return (
      <Button 
        disabled
        className="ai-gradient opacity-50 font-medium"
        size="sm"
      >
        <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
        Loading...
      </Button>
    );
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const viewOnExplorer = () => {
    if (address) {
      const explorerUrl = network.explorerUrl.replace('/tx/', '/address/');
      window.open(`${explorerUrl}${address}`, '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
    toast.success('Wallet disconnected');
  };

  const getRoleIcon = () => {
    if (!currentUser) return UserCircle;
    switch (currentUser.role) {
      case 'Patient': return UserCircle;
      case 'Provider': return Stethoscope;
      case 'Admin': return Shield;
      default: return User;
    }
  };

  const getProfileLink = () => {
    if (!currentUser) return '/';
    switch (currentUser.role) {
      case 'Admin': return '/admin/profile';
      case 'Provider': return '/provider/profile';
      case 'Patient': return '/patient/profile';
      default: return '/';
    }
  };

  // Not connected state
  if (!isConnected || !address) {
    return (
      <Button 
        onClick={connect}
        disabled={isConnecting}
        className="ai-gradient zero-g-glow font-medium"
        size="sm"
      >
        <Wallet className="mr-2 h-4 w-4" />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  // Connected state
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center space-x-2 p-2 bg-card hover:bg-accent/50 border-primary/20"
        >
          <div className="w-6 h-6 ai-gradient rounded-full flex items-center justify-center">
            <Wallet className="h-3 w-3 text-white" />
          </div>
          <div className="hidden md:flex flex-col items-start text-xs">
            <span className="font-medium text-foreground">
              {truncateAddress(address)}
            </span>
            <span className="text-muted-foreground text-[10px]">
              {network.name} Network
            </span>
          </div>
          {currentUser && (
            <Avatar className="h-6 w-6 md:ml-2">
              <AvatarFallback className="bg-primary text-primary-foreground text-[10px]">
                {currentUser.role.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64 p-2">
        {/* Wallet Info */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center">
                <Wallet className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium">Wallet Connected</p>
                <p className="text-xs text-muted-foreground">
                  {truncateAddress(address)}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Network: {network.name}</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span>Connected</span>
              </div>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* User Profile Section */}
        {currentUser && (
          <>
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center space-x-2">
                {React.createElement(getRoleIcon(), { className: "h-4 w-4 text-primary" })}
                <div>
                  <p className="text-sm font-medium">
                    {'fullName' in currentUser.profile 
                      ? currentUser.profile.fullName 
                      : currentUser.profile.name
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentUser.role}
                    {currentUser.role === 'Provider' && 'whitelisted' in currentUser.profile && (
                      <span className={`ml-2 ${currentUser.profile.whitelisted ? 'text-success' : 'text-warning'}`}>
                        • {currentUser.profile.whitelisted ? 'Verified' : 'Pending'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            {/* Profile Actions */}
            <Link to={getProfileLink()}>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                View Profile
              </DropdownMenuItem>
            </Link>
            
            {currentUser.role === 'Patient' && (
              <Link to="/patient/billing">
                <DropdownMenuItem>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing & Earnings
                </DropdownMenuItem>
              </Link>
            )}
          </>
        )}

        {/* Wallet Actions */}
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={viewOnExplorer}>
          <ExternalLink className="mr-2 h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDisconnect}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletConnect;
