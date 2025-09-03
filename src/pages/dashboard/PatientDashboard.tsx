import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FileUpload } from '@/components/FileUpload';
import { AddProviderModal } from '@/components/AddProviderModal';
import { ProviderSearch } from '@/components/ProviderSearch';
import { useProviderStore } from '@/stores/providerStore';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { useRecordsQuery } from '@/hooks/useRecordsQuery';
import { Upload, Users, UserPlus, FileText, DollarSign, Brain, Shield, Settings, LogOut, User, Bell, Activity, Calendar, Heart } from 'lucide-react';

export default function PatientDashboard() {
  const { address, disconnect } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const { providers } = useProviderStore();
  const { data: recordsData } = useRecordsQuery(currentUser?.id);
  const [showAddProvider, setShowAddProvider] = useState(false);

  // Real patient data
  const patient = {
    id: currentUser?.id || 'patient-1',
    name: currentUser?.name || 'John Doe',
    email: currentUser?.email || 'john.doe@example.com',
    dateOfBirth: '1985-03-15',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    emergencyContact: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phone: '+1 (555) 123-4567'
    }
  };

  const medicalRecords = recordsData?.records || [
    {
      id: '1',
      title: 'Annual Physical Exam',
      date: '2024-01-15',
      type: 'Checkup',
      provider: 'Dr. Smith',
      status: 'Completed'
    },
    {
      id: '2', 
      title: 'Blood Test Results',
      date: '2024-01-10',
      type: 'Lab Results',
      provider: 'LabCorp',
      status: 'Reviewed'
    }
  ];

  const handleLogout = () => {
    disconnect();
    logout();
  };

  if (!address || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p>Please connect your wallet to access the dashboard.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                Patient Portal
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/patient.png" alt={patient.name} />
                      <AvatarFallback className="bg-gradient-to-br from-medical-primary/20 to-medical-accent/20">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{patient.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {patient.email}
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
        {/* Patient Info Card */}
        <Card className="bg-gradient-to-r from-medical-primary/10 to-medical-accent/10 border-medical-primary/20">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/avatars/patient.png" alt={patient.name} />
                <AvatarFallback className="bg-gradient-to-br from-medical-primary/20 to-medical-accent/20 text-lg">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-xl">{patient.name}</CardTitle>
                <CardDescription className="text-base">
                  DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} • Blood Type: {patient.bloodType}
                </CardDescription>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">Patient ID: {patient.id}</Badge>
                  <Badge variant="outline">Wallet: {address?.slice(0, 6)}...{address?.slice(-4)}</Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="h-4 w-4 mr-1" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="records">
              <FileText className="h-4 w-4 mr-1" />
              Records
            </TabsTrigger>
            <TabsTrigger value="providers">
              <Users className="h-4 w-4 mr-1" />
              Providers
            </TabsTrigger>
            <TabsTrigger value="monetization">
              <DollarSign className="h-4 w-4 mr-1" />
              Monetization
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Brain className="h-4 w-4 mr-1" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{medicalRecords.length}</div>
                  <p className="text-xs text-muted-foreground">Medical files uploaded</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Providers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{providers.length}</div>
                  <p className="text-xs text-muted-foreground">Connected healthcare providers</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.4 GB</div>
                  <p className="text-xs text-muted-foreground">On 0G Network</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">85%</div>
                  <p className="text-xs text-muted-foreground">Based on recent data</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Blood test results uploaded</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI analysis generated</p>
                        <p className="text-xs text-muted-foreground">1 day ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Provider access granted</p>
                        <p className="text-xs text-muted-foreground">3 days ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Health Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Blood Type</span>
                        <span className="font-medium">{patient.bloodType}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Allergies</span>
                        <span className="font-medium">{patient.allergies.join(', ')}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Emergency Contact</span>
                        <span className="font-medium">{patient.emergencyContact.name}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm">
                        <span>Last Checkup</span>
                        <span className="font-medium">Jan 15, 2024</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Upload Medical Files</CardTitle>
                <CardDescription>
                  Securely upload your medical documents to 0G decentralized storage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Medical Records</CardTitle>
                <CardDescription>
                  View and manage your uploaded medical files
                </CardDescription>
              </CardHeader>
              <CardContent>
                {medicalRecords.length > 0 ? (
                  <div className="space-y-4">
                    {medicalRecords.map((record) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <FileText className="h-8 w-8 text-muted-foreground" />
                          <div>
                            <h4 className="font-medium">{record.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {record.provider} • {new Date(record.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Badge variant={record.status === 'Completed' ? 'default' : 'secondary'}>
                          {record.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4" />
                    <p>No medical records found.</p>
                    <p className="text-sm">Upload your first medical file to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="providers" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Healthcare Providers</h3>
                <p className="text-sm text-muted-foreground">Manage provider access to your medical data</p>
              </div>
              <Button onClick={() => setShowAddProvider(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Provider
              </Button>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Provider Management</CardTitle>
                <CardDescription>
                  Add healthcare providers by wallet address and manage their access levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ProviderSearch />
              </CardContent>
            </Card>

            {providers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">View Only Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProviderSearch filterByAccess="view" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Edit Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProviderSearch filterByAccess="edit" />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Full Access</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProviderSearch filterByAccess="full" />
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="monetization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Monetization</CardTitle>
                <CardDescription>
                  Earn from your anonymized medical data contributions to research
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4" />
                  <p>Monetization features coming soon.</p>
                  <p className="text-sm">Help advance medical research while earning rewards.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Health Insights</CardTitle>
                <CardDescription>
                  AI-powered analysis of your medical data and health trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4" />
                  <p>AI insights will appear here after uploading medical files.</p>
                  <p className="text-sm">Get personalized health recommendations and trend analysis.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <AddProviderModal 
          open={showAddProvider} 
          onOpenChange={setShowAddProvider} 
        />
      </div>
    </div>
  );
}
