import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useProviderRecordsQuery, useViewRecordMutation, useProviderPatientRelationship } from '@/hooks/useProviderRecords';
import { useAuthStore } from '@/stores/authStore';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { getProviderPatientRelationships, getComputeBalance, submitAIAnalysis } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import {
  Eye,
  FileText,
  Calendar,
  User,
  Brain,
  Zap,
  DollarSign,
  Activity,
  AlertTriangle,
  Shield,
  Heart,
  Users,
  Search,
  Wallet,
  Coins,
  Plus,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle,
  LogOut,
  Settings
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ComputeDashboard from '@/components/ComputeDashboard';
import AIAnalysisDisplay from '@/components/AIAnalysisDisplay';
import { useWallet } from '@/hooks/useWallet';
import toast from 'react-hot-toast';

export default function ProviderDashboard() {
  const { address, disconnect } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const { data: recordsData, isLoading: recordsLoading } = useProviderRecordsQuery();
  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery({
    queryKey: ['provider-patient-relationships', currentUser?.id],
    queryFn: () => getProviderPatientRelationships(currentUser?.id || ''),
    enabled: !!currentUser?.id && currentUser?.role === 'provider',
  });
  const { data: computeBalance } = useQuery({
    queryKey: ['compute-balance'],
    queryFn: getComputeBalance,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  const viewRecordMutation = useViewRecordMutation();
  const { analyzeFile, loading: aiLoading, result: aiResult, error: aiError } = useAIAnalysis();
  
  // Enhanced AI Analysis State
  const [selectedRecordForAI, setSelectedRecordForAI] = useState('');
  const [analysisType, setAnalysisType] = useState('medical-analysis');
  const [clinicalContext, setClinicalContext] = useState('');

  const handleViewRecord = (recordId: string, patientId: string) => {
    viewRecordMutation.mutate({ recordId, patientId });
  };

  const handleLogout = () => {
    disconnect();
    logout();
  };

  const handleRunAIAnalysis = async () => {
    if (!selectedRecordForAI || !currentUser?.id) {
      toast.error('Please select a record and ensure you are logged in');
      return;
    }

    const record = sharedRecords.find(p => p.record_id === selectedRecordForAI);
    if (!record) {
      toast.error('Selected record not found');
      return;
    }

    try {
      await analyzeFile(
        {
          recordId: selectedRecordForAI,
          analysisType,
          clinicalContext,
          providerSpecialty: currentUser.profile?.specialty || 'general',
        },
        analysisType,
        currentUser.id,
        selectedRecordForAI
      );
      toast.success('AI analysis completed successfully');
    } catch (error) {
      console.error('AI analysis failed:', error);
      toast.error('AI analysis failed. Please try again.');
    }
  };

  if (recordsLoading || relationshipsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!address || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p>Please connect your wallet to access the provider dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const sharedRecords = recordsData?.permissions || [];
  const provider = {
    id: currentUser.id,
    name: currentUser.profile?.fullName || currentUser.profile?.username || 'Dr. Provider',
    email: currentUser.profile?.email || `${currentUser.profile?.username || 'provider'}@medivet.test`,
    specialty: currentUser.profile?.specialty || 'General Practice',
    license: currentUser.profile?.licenseNumber || 'Not set'
  };

  // Real stats from backend data
  const realStats = {
    sharedRecords: sharedRecords.length,
    aiAnalyses: 5, // TODO: Get from backend
    computeBalance: computeBalance?.balance || 0,
    activePatients: relationshipsData?.relationships?.length || 0
  };

  // Generate recent activity from real data
  const recentActivity = [
    ...sharedRecords.slice(0, 2).map((record, index) => ({
      id: `view-${index}`,
      action: 'Accessed patient record',
      patient: record.patient?.name || 'Unknown Patient',
      time: new Date(record.created_at || Date.now()).toLocaleTimeString(),
      type: 'view'
    })),
    ...(aiResult ? [{
      id: 'ai-latest',
      action: 'Completed AI analysis',
      patient: 'Recent Patient',
      time: 'Just now',
      type: 'compute'
    }] : []),
    // TODO: Add real audit log data from backend
    { id: 'mock-1', action: 'Received new record share', patient: 'John Doe', time: '1 hour ago', type: 'share' },
    { id: 'mock-2', action: 'Updated patient profile', patient: 'Jane Smith', time: '3 hours ago', type: 'update' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-medical-primary/5 via-white to-medical-accent/5">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-medical-primary to-medical-accent rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-medical-primary to-medical-accent bg-clip-text text-transparent">
                  MediVet
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                Provider Portal
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              {/* Compute Balance Display */}
              <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700">
                  {realStats.computeBalance.toFixed(2)} OG
                </span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/provider.png" alt={provider.name} />
                      <AvatarFallback className="bg-gradient-to-br from-medical-primary/20 to-medical-accent/20">
                        {provider.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{provider.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {provider.specialty}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {provider.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6 space-y-6">
        {/* Provider Info Card */}
        <Card className="bg-gradient-to-r from-medical-primary/10 to-medical-accent/10 border-medical-primary/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/avatars/provider.png" alt={provider.name} />
                <AvatarFallback className="bg-gradient-to-br from-medical-primary/20 to-medical-accent/20 text-lg">
                  {provider.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{provider.name}</CardTitle>
                <CardDescription className="text-base">
                  {provider.specialty} • License: {provider.license}
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Provider ID: {provider.id}</Badge>
                  <Badge variant="outline">Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>
              Security Settings
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Shared Records</CardTitle>
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{realStats.sharedRecords}</div>
              <p className="text-xs text-muted-foreground">
                Records accessible to you
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">AI Analyses</CardTitle>
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{realStats.aiAnalyses}</div>
              <p className="text-xs text-muted-foreground">
                This month
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Compute Balance</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{realStats.computeBalance.toFixed(2)} OG</div>
              <p className="text-xs text-muted-foreground">
                Tokens available
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                <Users className="h-5 w-5 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-indigo-600">{realStats.activePatients}</div>
              <p className="text-xs text-muted-foreground">
                Under your care
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="shared-records">Patient Records</TabsTrigger>
            <TabsTrigger value="ai-compute">AI Analysis</TabsTrigger>
            <TabsTrigger value="patients">My Patients</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardDescription>
                    Latest actions in your dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 4).map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-accent rounded-lg">
                        <div className="mt-0.5 flex-shrink-0">
                          {activity.type === 'view' && (
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <Eye className="h-4 w-4 text-blue-600" />
                            </div>
                          )}
                          {activity.type === 'compute' && (
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                              <Brain className="h-4 w-4 text-purple-600" />
                            </div>
                          )}
                          {activity.type === 'share' && (
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-green-600" />
                            </div>
                          )}
                          {activity.type === 'update' && (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                              <Activity className="h-4 w-4 text-indigo-600" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{activity.action}</p>
                          <p className="text-xs text-muted-foreground truncate">{activity.patient}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Quick Actions</CardTitle>
                    <Zap className="h-5 w-5 text-yellow-600" />
                  </div>
                  <CardDescription>
                    Common tasks you can perform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button className="w-full justify-start" variant="outline">
                      <Brain className="h-4 w-4 mr-3" />
                      Run AI Analysis
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <Zap className="h-4 w-4 mr-3" />
                      Add Compute Funds
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="h-4 w-4 mr-3" />
                      View Patient Records
                    </Button>
                    <Button className="w-full justify-start" variant="outline">
                      <User className="h-4 w-4 mr-3" />
                      Add New Patient
                    </Button>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium text-blue-900">Tip: Secure Access</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Remember to log out when using shared computers and enable 2FA for enhanced security.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Appointments */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <CardDescription>
                  Your scheduled patient visits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                    <div>
                      <h4 className="font-medium">John Doe</h4>
                      <p className="text-sm text-muted-foreground">Follow-up: Hypertension</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Today, 2:00 PM</p>
                      <p className="text-sm text-muted-foreground">Room 3</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                    <div>
                      <h4 className="font-medium">Jane Smith</h4>
                      <p className="text-sm text-muted-foreground">Consultation: Diabetic Review</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Tomorrow, 10:30 AM</p>
                      <p className="text-sm text-muted-foreground">Virtual</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent">
                    <div>
                      <h4 className="font-medium">Robert Johnson</h4>
                      <p className="text-sm text-muted-foreground">Annual Checkup</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">Oct 5, 11:00 AM</p>
                      <p className="text-sm text-muted-foreground">Room 7</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Patient Records Tab */}
          <TabsContent value="shared-records" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Patient Records</h2>
                <p className="text-muted-foreground">
                  Medical records shared with you by your patients
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Shared Records</CardTitle>
                <CardDescription>
                  Records that patients have granted you access to view
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sharedRecords.length > 0 ? (
                  <div className="space-y-4">
                    {sharedRecords.map((permission) => (
                      <div 
                        key={permission.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{permission.record?.title || 'Medical Record'}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Patient: {permission.patient?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(permission.created_at || Date.now()).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="capitalize">{permission.permission_level || 'view'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => handleViewRecord(permission.record_id, permission.patient_id)}
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Shared Records</h3>
                    <p className="text-muted-foreground mb-4">
                      You currently don't have access to any patient records.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Patients need to grant you permission to access their medical records.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Analysis Tab */}
          <TabsContent value="ai-compute" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AI Analysis</h2>
                <p className="text-muted-foreground">
                  AI-powered analysis of patient medical data using 0G Compute Network
                </p>
              </div>
              <Button onClick={handleRunAIAnalysis} disabled={!selectedRecordForAI || aiLoading}>
                <Brain className="h-4 w-4 mr-2" />
                {aiLoading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Analysis Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Configure Analysis</CardTitle>
                  <CardDescription>
                    Select patient record and analysis parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Select Patient Record</label>
                    <Select value={selectedRecordForAI} onValueChange={setSelectedRecordForAI}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a record to analyze" />
                      </SelectTrigger>
                      <SelectContent>
                        {sharedRecords.map((permission) => (
                          <SelectItem key={permission.id} value={permission.record_id}>
                            {permission.record?.title || 'Medical Record'} - {permission.patient?.name || 'Unknown Patient'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Analysis Type</label>
                    <Select value={analysisType} onValueChange={setAnalysisType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="medical-analysis">General Medical Analysis</SelectItem>
                        <SelectItem value="radiology-analysis">Radiology Analysis</SelectItem>
                        <SelectItem value="lab-interpretation">Lab Results Interpretation</SelectItem>
                        <SelectItem value="cardiology-analysis">Cardiology Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Clinical Context (Optional)</label>
                    <Input
                      placeholder="Additional clinical context..."
                      value={clinicalContext}
                      onChange={(e) => setClinicalContext(e.target.value)}
                    />
                  </div>

                  {/* Cost Estimate */}
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <Coins className="h-4 w-4" />
                      <span className="font-medium text-sm">Estimated Cost</span>
                    </div>
                    <p className="text-sm text-yellow-700 mt-1">
                      ~2.5 OG tokens for {analysisType.replace('-', ' ')}
                    </p>
                  </div>
                </CardContent>
              </Card>
              
              {/* Analysis Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Analysis Status</CardTitle>
                  <CardDescription>
                    Current analysis progress and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {aiLoading && (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto mb-4 animate-pulse text-purple-600" />
                      <p className="font-medium">Running AI Analysis...</p>
                      <p className="text-sm text-muted-foreground">Processing with 0G Compute Network</p>
                    </div>
                  )}
                  
                  {aiError && (
                    <div className="text-center py-8 text-red-500">
                      <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
                      <p className="font-medium">Analysis Failed</p>
                      <p className="text-sm">{aiError}</p>
                    </div>
                  )}
                  
                  {!aiLoading && !aiError && !aiResult && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Brain className="h-12 w-12 mx-auto mb-4" />
                      <p>Select a record and click "Run Analysis" to get AI insights.</p>
                    </div>
                  )}

                  {aiResult && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Analysis Complete</span>
                      </div>
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm leading-relaxed">{aiResult.analysis}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Job ID:</span>
                          <span className="ml-2 font-mono text-xs">{aiResult.jobId}</span>
                        </div>
                        <div>
                          <span className="font-medium">Compute Time:</span>
                          <span className="ml-2">{aiResult.computeTime || 'N/A'}ms</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Analyses */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Analyses</CardTitle>
                <CardDescription>
                  Your recent AI analysis history
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* TODO: Implement real analysis history from backend */}
                <div className="space-y-4">
                  {[
                    { id: 1, patient: 'John Doe', type: 'Medical Analysis', time: '2 hours ago', cost: '2.5 OG' },
                    { id: 2, patient: 'Jane Smith', type: 'Lab Interpretation', time: '1 day ago', cost: '1.8 OG' },
                    { id: 3, patient: 'Robert Johnson', type: 'Radiology Analysis', time: '2 days ago', cost: '3.2 OG' }
                  ].map((analysis) => (
                    <div key={analysis.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-600" />
                        <div>
                          <h4 className="font-medium">{analysis.type}</h4>
                          <p className="text-sm text-muted-foreground">Patient: {analysis.patient}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{analysis.cost}</p>
                        <p className="text-xs text-muted-foreground">{analysis.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* My Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Patients</h2>
                <p className="text-muted-foreground">
                  Patients under your care and treatment plans
                </p>
              </div>
              <Button>
                <User className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Patients</CardTitle>
                <CardDescription>
                  Patients currently under your care
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relationshipsData?.relationships && relationshipsData.relationships.length > 0 ? (
                  <div className="space-y-4">
                    {relationshipsData.relationships.map((relationship, index) => (
                      <div key={relationship.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{relationship.patient_name || `Patient ${index + 1}`}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Patient ID: {relationship.patient_id?.substring(0, 8) || `PT-${1000 + index}`}</span>
                              <span>•</span>
                              <span>Relationship: {relationship.relationship_type || 'Treated'}</span>
                              <span>•</span>
                              <Badge variant="secondary">
                                {relationship.specialty || 'General'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Records
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Patients</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any patients assigned to you yet.
                    </p>
                    <Button>
                      <User className="h-4 w-4 mr-2" />
                      Add First Patient
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Status</CardTitle>
                  <CardDescription>
                    Distribution of patient conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Treatment</span>
                      <span className="text-sm font-medium">4</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Follow-up Required</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-1/2"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stable Monitoring</span>
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patient Activity</CardTitle>
                  <CardDescription>
                    Latest interactions with your patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { patient: 'John Doe', action: 'New record updated', time: '10 min ago' },
                      { patient: 'Jane Smith', action: 'Lab results received', time: '45 min ago' },
                      { patient: 'Robert Johnson', action: 'Appointment scheduled', time: '2 hours ago' },
                      { patient: 'Emily Davis', action: 'Medication updated', time: '1 day ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 bg-green-100 rounded-full">
                          <User className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm">{activity.patient}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
