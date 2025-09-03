import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { Wallet, Shield, Users, Activity, LogOut } from 'lucide-react';

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();
  const { login, logout, selectedRole, isLoading } = useAuthStore();

  useEffect(() => {
    if (isConnected && address && selectedRole) {
      // Auto-login with stored role
      login(selectedRole, {}, address).then(() => {
        const dashboardPath = selectedRole === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
        navigate(dashboardPath);
      });
    } else if (isConnected && address && !selectedRole) {
      // First time user, go to role selection
      navigate('/role-selection');
    }
  }, [isConnected, address, selectedRole, login, navigate]);

  const handleConnect = () => {
    if (!isConnected) {
      connect();
    }
  };

  const handleDisconnect = () => {
    disconnect();
    logout();
  };

  const handleRoleSelection = (role: 'patient' | 'provider') => {
    if (!address) return;
    
    const profile = role === 'patient' 
      ? {
          fullName: 'New Patient',
          dob: '',
          contact: '',
          emergency: '',
          monetizeEnabled: false
        }
      : {
          name: 'New Provider',
          license: '',
          specialty: '',
          contact: '',
          whitelisted: false,
          reputation: 0
        };

    login(role, profile, address);
    navigate(role === 'patient' ? '/dashboard/patient' : '/dashboard/provider');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to MediVet</h1>
          <p className="text-gray-600">Connect your wallet to access your health data</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </CardTitle>
            <CardDescription>
              Secure access to your medical records using blockchain technology
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-600 font-medium">
                    ✓ Wallet Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDisconnect}
                    className="text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Select your role:</p>
                  
                  <Button
                    onClick={() => handleRoleSelection('patient')}
                    className="w-full justify-start"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Patient - Manage my health records
                  </Button>
                  
                  <Button
                    onClick={() => handleRoleSelection('provider')}
                    className="w-full justify-start"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Healthcare Provider - Access patient data
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center text-sm text-gray-500">
          <Shield className="h-4 w-4 inline mr-1" />
          Your data is encrypted and secured on the blockchain
        </div>
      </div>
    </div>
  );
};

export default ConnectWallet;
