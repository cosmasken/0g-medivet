import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { Wallet, User, Stethoscope, Shield, Users, Activity } from 'lucide-react';

const Auth = () => {
  const navigate = useNavigate();
  const { connect, disconnect, isConnected, isConnecting, address } = useWallet();
  const { connectWallet, isLoading, currentUser } = useAuthStore();
  const [selectedRole, setSelectedRole] = useState<'patient' | 'provider' | null>(null);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (currentUser) {
      const dashboardPath = currentUser.role === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
      navigate(dashboardPath);
    }
  }, [currentUser, navigate]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleRoleSelect = async (role: 'patient' | 'provider') => {
    if (!isConnected || !address) {
      setSelectedRole(role);
      await handleConnect();
      return;
    }

    try {
      await connectWallet(address, role);
      const dashboardPath = role === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
      navigate(dashboardPath);
    } catch (error) {
      console.error('Role selection failed:', error);
      // Still navigate as we have fallback auth
      const dashboardPath = role === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
      navigate(dashboardPath);
    }
  };

  // Auto-select role after wallet connection if role was pre-selected
  useEffect(() => {
    if (isConnected && address && selectedRole && !currentUser) {
      handleRoleSelect(selectedRole);
    }
  }, [isConnected, address, selectedRole]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to MediVet</h1>
          <p className="text-xl text-gray-600">Secure medical data management on the blockchain</p>
        </div>

        {!isConnected ? (
          <Card className="max-w-md mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Wallet className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Connect Your Wallet</CardTitle>
              <CardDescription>
                Connect your Web3 wallet to get started
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-500" />
                  <span>Your data is encrypted and secure</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-blue-500" />
                  <span>Control who accesses your medical records</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Activity className="w-4 h-4 text-purple-500" />
                  <span>AI-powered health insights</span>
                </div>
              </div>

              <Button 
                onClick={handleConnect} 
                disabled={isConnecting}
                className="w-full"
                size="lg"
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardContent className="pt-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-800">Wallet Connected</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1 font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Choose Your Role</h2>
              <p className="text-gray-600">Select how you'll use MediVet</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleRoleSelect('patient')}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl">I'm a Patient</CardTitle>
                  <CardDescription className="text-lg">
                    Manage your medical records securely
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li>• Store medical files on blockchain</li>
                    <li>• Control who accesses your data</li>
                    <li>• AI-powered health insights</li>
                    <li>• Earn from data sharing</li>
                  </ul>
                  <Button 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect('patient');
                    }}
                  >
                    {isLoading ? 'Setting up...' : 'Continue as Patient'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleRoleSelect('provider')}>
                <CardHeader className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Stethoscope className="w-8 h-8 text-green-600" />
                  </div>
                  <CardTitle className="text-2xl">I'm a Healthcare Provider</CardTitle>
                  <CardDescription className="text-lg">
                    Access patient data with consent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600 mb-6">
                    <li>• Request patient data access</li>
                    <li>• Pay for verified medical records</li>
                    <li>• Enhanced AI analysis tools</li>
                    <li>• HIPAA compliant workflow</li>
                  </ul>
                  <Button 
                    className="w-full" 
                    size="lg" 
                    variant="outline"
                    disabled={isLoading}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRoleSelect('provider');
                    }}
                  >
                    {isLoading ? 'Setting up...' : 'Continue as Provider'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <Button 
                onClick={disconnect}
                variant="ghost"
                size="sm"
              >
                Disconnect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
