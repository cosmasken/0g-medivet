import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { checkProviderStake, logContractTransaction } from '@/lib/api';
import { contractService } from '@/services/contractService';
import { ProviderStaking } from '@/components/provider/ProviderStaking';
import { Search, FileText, Users, DollarSign, Settings, LogOut, User, Stethoscope, AlertCircle, Shield, Activity, Wallet, Zap } from 'lucide-react';

export default function ProviderDashboard() {
  const { address, disconnect, signMessage } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const [patientSearch, setPatientSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [accessPurpose, setAccessPurpose] = useState('');
  const [isStaked, setIsStaked] = useState(false);
  const [staking, setStaking] = useState(false);
  const [accessing, setAccessing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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
      await contractService.initialize();
      // Use the contract service directly instead of the API call that was failing
      const minStake = await contractService.getMinimumStake();
      const currentStake = await contractService.getProviderStake(address);
      
      setIsStaked(parseFloat(currentStake) >= parseFloat(minStake));
    } catch (error) {
      console.error('Failed to check stake status:', error);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    logout();
  };

  const handleStake = async () => {
    if (!address) {
      alert('Please connect your wallet first');
      return;
    }

    try {
      setStaking(true);
      
      // Initialize contract service
      await contractService.initialize();
      
      // Stake as provider (0.1 OG as per smart contract requirement)
      const receipt = await contractService.stakeAsProvider('0.1');
      
      // Log the transaction on the backend
      await logContractTransaction({
        wallet_address: address,
        action: 'STAKE_AS_PROVIDER',
        transaction_hash: receipt.hash,
        details: {
          amount: '0.1',
          timestamp: Date.now()
        }
      });
      
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
    if (!selectedPatient || !accessPurpose.trim() || !address) {
      alert('Please fill in all fields and connect your wallet');
      return;
    }

    try {
      setAccessing(true);

      // Initialize contract service
      await contractService.initialize();

      // Access record with payment (0.001 OG as per smart contract requirement)
      const receipt = await contractService.accessRecord(selectedPatient, 'sample-record-id', accessPurpose, '0.001');
      
      // Log the transaction on the backend
      await logContractTransaction({
        wallet_address: address,
        action: 'ACCESS_RECORD',
        transaction_hash: receipt.hash,
        details: {
          patient_address: selectedPatient,
          purpose: accessPurpose,
          timestamp: Date.now()
        }
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

  const [stats, setStats] = useState([
    { label: 'Active Patients', value: '0', icon: Users, color: 'text-blue-600' },
    { label: 'Records Accessed', value: '0', icon: FileText, color: 'text-green-600' },
    { label: 'Earned Fees', value: '0.00 OG', icon: DollarSign, color: 'text-purple-600' },
    { label: 'Stake Amount', value: '0.00 OG', icon: Wallet, color: 'text-amber-600' }
  ]);

  // Load provider stats
  useEffect(() => {
    if (address) {
      loadProviderStats();
    }
  }, [address]);

  const loadProviderStats = async () => {
    if (!address) return;

    try {
      // Fetch stake info from contract
      const stakeInfo = await contractService.getProviderStake(address);

      const newStats = [
        { label: 'Active Patients', value: '0', icon: Users, color: 'text-blue-600' },
        { label: 'Records Accessed', value: '0', icon: FileText, color: 'text-green-600' },
        { label: 'Earned Fees', value: '0.00 OG', icon: DollarSign, color: 'text-purple-600' },
        {
          label: 'Stake Amount',
          value: `${parseFloat(stakeInfo || '0').toFixed(2)} OG`,
          icon: Wallet,
          color: 'text-amber-600'
        }
      ];

      setStats(newStats);
    } catch (error) {
      console.error('Failed to load provider stats:', error);
      // Keep default zero values on error
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-green-100 text-green-600">
                  {provider.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, Dr. {provider.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={isStaked ? "default" : "secondary"} className={isStaked ? "bg-green-500" : ""}>
                    {isStaked ? 'Active Provider' : 'Needs Staking'}
                  </Badge>
                  {isStaked && (
                    <div className="flex items-center text-xs text-green-600">
                      <Zap className="h-3 w-3 mr-1" />
                      <span>Ready to access records</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="hidden sm:flex items-center text-xs text-gray-500">
                <Wallet className="h-4 w-4 mr-1" />
                <span>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <User className="h-4 w-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Activity className="h-4 w-4 mr-2" />
                    Activity Log
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="access">Record Access</TabsTrigger>
            <TabsTrigger value="management">Stake Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Staking Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Stethoscope className="h-5 w-5 mr-2 text-green-600" />
                        <span>Provider Status</span>
                      </div>
                      <Badge variant={isStaked ? "default" : "secondary"}>
                        {isStaked ? 'Active' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {isStaked 
                        ? 'You are an active provider with full access rights' 
                        : 'You need to stake tokens to become an active provider'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isStaked ? (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-full mr-3">
                            <Zap className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-green-900">Provider Active</h4>
                            <p className="text-sm text-green-700">You can access patient records and provide services</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
                          <div>
                            <h4 className="font-medium text-yellow-800">Staking Required</h4>
                            <p className="text-sm text-yellow-700">You need to stake tokens to become an active provider</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

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
                {/* Provider Staking Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>Stake Management</CardTitle>
                    <CardDescription>Manage your provider stake</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ProviderStaking />
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
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
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
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-amber-500" />
                  Stake Management
                </CardTitle>
                <CardDescription>
                  Manage your provider stake and access privileges
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderStaking />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}