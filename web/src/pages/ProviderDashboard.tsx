import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { stakeAsProvider, accessRecord, checkProviderStake } from '@/lib/api';
import { Search, FileText, Users, DollarSign, Settings, LogOut, User, Stethoscope, AlertCircle, Shield } from 'lucide-react';

export default function ProviderDashboard() {
  const { address, disconnect, signMessage } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [accessPurpose, setAccessPurpose] = useState('');
  const [isStaked, setIsStaked] = useState(false);
  const [staking, setStaking] = useState(false);
  const [accessing, setAccessing] = useState(false);

  const provider = {
    name: currentUser?.fullName || address?.slice(0, 8) || 'Provider',
    walletAddress: address || 'Not connected'
  };

  useEffect(() => {
    if (address) {
      checkStakeStatus();
    }
  }, [address]);

  const checkStakeStatus = async () => {
    if (!address) return;
    
    try {
      const response = await checkProviderStake(address);
      setIsStaked(response.isStaked || false);
    } catch (error) {
      console.error('Failed to check stake status:', error);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    logout();
  };

  const handleStake = async () => {
    if (!address || !signMessage) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setStaking(true);
      
      // Sign a message to prove ownership
      const message = `Stake as healthcare provider on MediVet\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const signature = await signMessage({ message });
      
      await stakeAsProvider(address, signature);
      alert('Successfully staked as provider!');
      setIsStaked(true);
    } catch (error) {
      console.error('Staking failed:', error);
      alert('Staking failed. Please try again.');
    } finally {
      setStaking(false);
    }
  };

  const handleSearch = () => {
    if (patientSearch.trim()) {
      setSelectedPatient(patientSearch.trim());
    }
  };

  const handleAccessRecord = async () => {
    if (!selectedPatient || !accessPurpose.trim() || !address || !signMessage) {
      alert('Please fill in all fields and connect your wallet');
      return;
    }

    try {
      setAccessing(true);
      
      // Sign a message for record access
      const message = `Access medical record\nProvider: ${address}\nPatient: ${selectedPatient}\nPurpose: ${accessPurpose}\nTimestamp: ${Date.now()}`;
      const signature = await signMessage({ message });
      
      await accessRecord({
        patientAddress: selectedPatient,
        recordId: 'sample-record-id',
        purpose: accessPurpose,
        providerAddress: address,
        signature
      });
      
      alert('Record access granted! Payment processed.');
      setAccessPurpose('');
    } catch (error) {
      console.error('Record access failed:', error);
      alert('Record access failed. Please try again.');
    } finally {
      setAccessing(false);
    }
  };

  const stats = [
    { label: 'Patients Accessed', value: 0, icon: Users, color: 'text-blue-600' },
    { label: 'Records Viewed', value: 0, icon: FileText, color: 'text-green-600' },
    { label: 'Amount Spent', value: '$0.00', icon: DollarSign, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-green-100 text-green-600">
                  {provider.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, Dr. {provider.name}</h1>
                <p className="text-sm text-gray-500">Healthcare Provider Dashboard</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Menu
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {!isStaked ? (
              /* Provider Staking */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                    Stake as Provider
                  </CardTitle>
                  <CardDescription>
                    You must stake tokens to access patient records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                      <p className="text-sm text-yellow-800">Staking required to unlock dashboard features</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <p className="text-sm font-medium text-blue-800">Secure Message Signing</p>
                    </div>
                    <p className="text-xs text-blue-700">
                      We use secure message signing instead of private keys. Your wallet will prompt you to sign a message to prove ownership.
                    </p>
                  </div>
                  
                  <Button 
                    onClick={handleStake}
                    disabled={staking || !address}
                    className="w-full"
                  >
                    {staking ? 'Staking...' : 'Stake as Provider (Sign Message)'}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              /* Patient Search - Only shown when staked */
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Search className="h-5 w-5 mr-2 text-blue-500" />
                    Patient Record Access
                  </CardTitle>
                  <CardDescription>
                    Search for patients and request access to their medical records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Enter patient wallet address"
                      value={patientSearch}
                      onChange={(e) => setPatientSearch(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleSearch}>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </Button>
                  </div>

                  {selectedPatient && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-4">
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Patient Found</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Address: {selectedPatient.slice(0, 6)}...{selectedPatient.slice(-4)}
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <Textarea
                          placeholder="Enter the medical purpose for accessing this record (required for HIPAA compliance)"
                          value={accessPurpose}
                          onChange={(e) => setAccessPurpose(e.target.value)}
                          rows={3}
                        />
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <AlertCircle className="h-4 w-4" />
                          <span>Access fee: 0.001 OG (estimated)</span>
                        </div>
                        
                        <Button 
                          onClick={handleAccessRecord}
                          disabled={accessing || !accessPurpose.trim()}
                          className="w-full"
                        >
                          {accessing ? 'Processing...' : 'Request Access & Pay Fee (Sign Message)'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent activity</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {isStaked ? 'Start by searching for patients and accessing their records' : 'Stake as provider to access patient records'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Wallet Address</p>
                  <p className="text-sm font-mono bg-gray-100 p-2 rounded">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Role</p>
                  <Badge variant="outline">Healthcare Provider</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Network</p>
                  <Badge variant="outline">0G Mainnet</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Provider Status</p>
                  <Badge variant={isStaked ? "default" : "secondary"}>
                    {isStaked ? 'Staked' : 'Not Staked'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!isStaked}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Patient List
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!isStaked}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Access History
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  disabled={!isStaked}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Payment History
                </Button>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Security Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-600">
                  We use secure message signing for all transactions. Your private keys never leave your wallet, 
                  ensuring maximum security for your healthcare provider account.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
