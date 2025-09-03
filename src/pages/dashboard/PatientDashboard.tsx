import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MedicalRecordCard } from "@/components/MedicalRecordCard";
import { PermissionControl } from "@/components/PermissionControl";
import { MonetizationDashboard } from "@/components/MonetizationDashboard";
import { ProviderRequestsManager } from "@/components/ProviderRequestsManager";
import AuditTrail from "@/pages/AuditTrail";
import { TrendingUp, Upload } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import { useWallet } from "@/hooks/useWallet";
import { useAuthStore } from "@/stores/authStore";
import WelcomeBanner from '@/components/WelcomeBanner';
import { useRecordsQuery, useCreateRecordMutation } from '@/hooks/useRecordsQuery';
import { getUserMedicalRecords, createMedicalRecord, updateRecordStatus, createProviderPermission, updateUserProfile, authenticateUser } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { generateMockAttachments } from "@/lib/mock-attachments";
import {
  FileText,
  Users,
  Calendar,
  Phone,
  Mail,
  MapPin,
  AlertCircle,
  Share,
  Bell,
  Shield,
  Settings,
  Lock,
  Eye,
  Edit,
  DollarSign,
  LogOut,
  User,
  ChevronDown,
  Copy,
  Check,
  Share2,
  CheckCircle,
  AlertTriangle,
  Download,
  Paperclip,
  Image,
  Video,
  Music,
  Plus
} from "lucide-react";
import { mockPatients, mockProviders, Patient, mockProviderRequests } from "@/lib/mock-data";
import { mockPatientEarnings } from "@/lib/monetization-data";

interface PatientDashboardProps {
  patientId?: string;
}

// Empty patient data for testing empty states
const emptyPatient = {
  id: '1',
  name: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '(555) 123-4567',
  dateOfBirth: '1985-03-15',
  address: '123 Main St, Anytown, ST 12345',
  emergencyContact: {
    name: 'Mike Johnson',
    phone: '(555) 987-6543',
    relationship: 'Spouse'
  },
  medicalHistory: [], // Empty for testing
  permissions: {},
  // Privacy settings from onboarding
  privacySettings: {
    // Default Provider Permissions (from PermissionCard)
    defaultPermissions: {
      'demographics': 'view',
      'medical-history': 'comment',
      'medications': 'full',
      'lab-results': 'comment',
      'imaging': 'view',
      'mental-health': 'none',
      'genetic': 'none',
      'insurance': 'view'
    },
    // Emergency Access Permissions
    emergencyPermissions: {
      'demographics': 'full',
      'medical-history': 'full',
      'medications': 'full',
      'lab-results': 'full',
      'imaging': 'view',
      'mental-health': 'view',
      'genetic': 'none',
      'insurance': 'view'
    },
    // Additional Privacy Settings
    allowFamilyAccess: false,
    allowAnonymousResearch: false,
    auditLogging: true, // Always enabled
    allowEmergencyOverride: true
  }
};

export default function PatientDashboard({ patientId = '1' }: PatientDashboardProps = {}) {
  const { address } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const { data: recordsData, isLoading: isLoadingRecords, error: recordsError } = useRecordsQuery();
  const createRecordMutation = useCreateRecordMutation();
  
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isRequestsManagerOpen, setIsRequestsManagerOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isTextRecordDialogOpen, setIsTextRecordDialogOpen] = useState(false);
  const [isEmptyState, setIsEmptyState] = useState(false);

  const medicalRecords = recordsData?.records || [];

  // Use real user data if available
  const patient = currentUser?.profile ? {
    id: currentUser.id,
    name: currentUser.profile.fullName || 'User',
    email: (currentUser.profile as any).email || currentUser.profile.contact || 'user@example.com',
    phone: (currentUser.profile as any).phone || 'Not provided',
    avatar: '',
    dateOfBirth: currentUser.profile.dob || 'Not provided',
    address: address || 'Not connected',
    medicalHistory: medicalRecords
  } : {
    id: patientId,
    name: 'User',
    email: 'user@example.com',
    phone: 'Not provided',
    avatar: '',
    dateOfBirth: 'Not provided',
    address: address || 'Not connected',
    medicalHistory: []
  };

  const handleLogout = () => {
    logout();
  };

  const handleRecordCreated = () => {
    // TanStack Query will auto-refresh via invalidateQueries
    setIsUploadDialogOpen(false);
    setIsTextRecordDialogOpen(false);
  };

  // Modal states
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);
  const [showProfileSettingsDialog, setShowProfileSettingsDialog] = useState(false);
  const [showPrivacySettingsDialog, setShowPrivacySettingsDialog] = useState(false);
  const [showAccountSettingsDialog, setShowAccountSettingsDialog] = useState(false);
  const [showExportOverviewDialog, setShowExportOverviewDialog] = useState(false);

  // Form states for modals
  const [recordForm, setRecordForm] = useState({
    type: 'visit',
    title: '',
    description: '',
    provider: '',
    sensitive: false
  });

  const [providerForm, setProviderForm] = useState({
    name: '',
    specialty: '',
    organization: '',
    email: '',
    phone: ''
  });

  const connectedProviders = [];

  // Get pending provider requests count
  const pendingRequestsCount = 0;

  // Get patient earnings for display
  const patientEarnings = mockPatientEarnings.find(pe => pe.patientId === patientId) || {
    patientId,
    totalEarnings: 0,
    totalRecordsSold: 0,
    averageRecordPrice: 0,
    monthlyEarnings: [],
    topPerformingRecords: [],
    pendingPayouts: 0
  };

  // Record sharing and monetization handlers
  const handleShareRecord = async (recordId: string, providerIds: string[]) => {
    console.log(`Sharing record ${recordId} with providers:`, providerIds);
    try {
      for (const providerId of providerIds) {
        await createProviderPermission({
          patient_id: currentUser?.id,
          provider_id: providerId,
          record_id: recordId,
          permission_level: 'view'
        });
      }
      toast.success('Record shared successfully');
    } catch (error) {
      console.error('Failed to share record:', error);
      toast.error('Failed to share record');
    }
  };

  const handleMonetizeRecord = (recordId: string, enabled: boolean) => {
    console.log(`${enabled ? 'Enabling' : 'Disabling'} monetization for record ${recordId}`);
    // In a real app, this would create/remove the monetized record
  };

  const handleUpdateRecord = async (recordId: string, updates: Partial<any>) => {
    console.log(`Updating record ${recordId}:`, updates);
    try {
      await updateRecordStatus(recordId, 'completed', updates.transaction_hash, updates.merkle_root);
      toast.success('Record updated successfully');
      handleRecordCreated(); // Refresh records
    } catch (error) {
      console.error('Failed to update record:', error);
      toast.error('Failed to update record');
    }
  };

  const handleProviderRequestUpdate = (requestId: string, status: 'approved' | 'denied') => {
    console.log(`Provider request ${requestId} ${status}`);
    // In a real app, this would update the backend and potentially add the provider to connected providers
    if (status === 'approved') {
      // Could add logic here to automatically connect the provider
      console.log('Provider request approved - could auto-connect provider');
    }
  };

  /**
   * Dev function to toggle between empty and populated states
   */
  const toggleEmptyState = () => {
    setIsEmptyState(!isEmptyState);
  };

  // Add new medical record
  const addMedicalRecord = () => {
    const newRecord = {
      id: `r${Date.now()}`,
      type: recordForm.type,
      title: recordForm.title || `Sample ${recordForm.type} record`,
      description: recordForm.description || `Sample description for ${recordForm.type} record`,
      date: new Date().toISOString().split('T')[0],
      provider: recordForm.provider || 'Dr. Sample',
      sharedWith: [],
      sensitive: recordForm.sensitive,
      attachments: generateMockAttachments(recordForm.type, recordForm.title || `Sample ${recordForm.type} record`),
      tags: [recordForm.type, 'generated', 'sample'],
      notes: recordForm.description || `Auto-generated ${recordForm.type} record with mock attachments`
    };

    console.log('Adding new record:', newRecord);
    if (currentUser?.id) {
      createRecordMutation.mutate({
        user_id: currentUser.id,
        title: newRecord.title,
        description: newRecord.description,
        category: newRecord.type,
        zero_g_hash: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tags: []
      });
    }

    // Reset form and close modal
    setRecordForm({
      type: 'visit',
      title: '',
      description: '',
      provider: '',
      sensitive: false
    });
    setIsRecordModalOpen(false);
  };

  // Add new provider
  const addProvider = async () => {
    const newProvider = {
      id: `p${Date.now()}`,
      name: providerForm.name || 'Dr. Sample Provider',
      specialty: providerForm.specialty || 'General Practice',
      organization: providerForm.organization || 'Sample Medical Center',
      email: providerForm.email || 'doctor@example.com',
      phone: providerForm.phone || '(555) 123-0000',
      patients: [patientId],
      permissions: {}
    };

    console.log('Adding new provider:', newProvider);
    try {
      // Create provider user account
      const { user } = await authenticateUser(newProvider.email, 'provider');

      // Update provider profile
      await updateUserProfile(user.id, {
        full_name: newProvider.name,
        email: newProvider.email,
        phone: newProvider.phone,
        contact: newProvider.email,
        profile_completed: true
      });

      toast.success('Provider added successfully');
    } catch (error) {
      console.error('Failed to add provider:', error);
      toast.error('Failed to add provider');
    }

    // Reset form and close modal
    setProviderForm({
      name: '',
      specialty: '',
      organization: '',
      email: '',
      phone: ''
    });
    setIsProviderModalOpen(false);
  };

  const updatePermission = (providerId: string, key: string, value: boolean) => {
    // In a real app, this would make an API call
    console.log('Permission update:', { providerId, key, value });
  };

  // Update privacy setting
  const updatePrivacySetting = async (key: string, value: boolean) => {
    console.log(`Updating privacy setting ${key}:`, value);
    try {
      if (currentUser?.id) {
        await updateUserProfile(currentUser.id, { [key]: value });
        toast.success('Privacy setting updated');
      }
    } catch (error) {
      console.error('Failed to update privacy setting:', error);
      toast.error('Failed to update privacy setting');
    }
  };

  // Update default permission level
  const updateDefaultPermission = async (categoryId: string, level: string) => {
    console.log(`Updating default permission for ${categoryId}:`, level);
    try {
      if (currentUser?.id) {
        await updateUserProfile(currentUser.id, {
          default_permissions: { [categoryId]: level }
        });
        toast.success('Default permission updated');
      }
    } catch (error) {
      console.error('Failed to update default permission:', error);
      toast.error('Failed to update default permission');
    }
  };

  // Update emergency permission level
  const updateEmergencyPermission = async (categoryId: string, level: string) => {
    console.log(`Updating emergency permission for ${categoryId}:`, level);
    try {
      if (currentUser?.id) {
        await updateUserProfile(currentUser.id, {
          emergency_permissions: { [categoryId]: level }
        });
        toast.success('Emergency permission updated');
      }
    } catch (error) {
      console.error('Failed to update emergency permission:', error);
      toast.error('Failed to update emergency permission');
    }
  };

  const getSharedRecords = () => {
    return patient.medicalHistory.filter(record => record.sharedWith.length > 0);
  };

  const getPrivateRecords = () => {
    return patient.medicalHistory.filter(record => record.sharedWith.length === 0);
  };

  /**
   * Opens the profile settings dialog for editing personal information
   */
  const mockOpenProfileSettings = () => {
    setShowProfileSettingsDialog(true);
  };

  /**
   * Opens the privacy settings dialog for managing data sharing preferences
   */
  const mockOpenPrivacySettings = () => {
    setShowPrivacySettingsDialog(true);
  };

  /**
   * Opens the account settings dialog for managing account preferences
   */
  const mockOpenAccountSettings = () => {
    setShowAccountSettingsDialog(true);
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(patient.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = patient.address;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const truncateAddress = (address: string, maxLength: number = 30) => {
    if (address.length <= maxLength) return address;
    return address.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gradient-health rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-health-foreground" />
            </div>
            <div>
              <span className="text-xl font-bold">Medivet</span>
              <Badge variant="secondary" className="ml-2">Patient</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant={isEmptyState ? "default" : "outline"}
              size="sm"
              onClick={toggleEmptyState}
            >
              {isEmptyState ? "Load Sample Data" : "Show Empty State"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={() => setIsRequestsManagerOpen(true)}
            >
              <Bell className="h-5 w-5" />
              {pendingRequestsCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {pendingRequestsCount}
                </Badge>
              )}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={patient.avatar} alt={patient.name} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                      {patient.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{patient.name}</div>
                    <div className="text-xs text-muted-foreground">{patient.email}</div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={patient.avatar} alt={patient.name} />
                      <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-xs text-muted-foreground">{patient.email}</div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-muted-foreground mb-1">Address</div>
                      <div className="text-sm font-mono text-gray-700 truncate" title={address || 'No wallet connected'}>
                        {truncateAddress(address || 'No wallet connected')}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-8 w-8 p-0"
                      onClick={handleCopyAddress}
                    >
                      {copiedAddress ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={mockOpenProfileSettings}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={mockOpenPrivacySettings}>
                  <Shield className="mr-2 h-4 w-4" />
                  Privacy Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={mockOpenAccountSettings}>
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>



      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <WelcomeBanner />
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">My Health Records</h1>
              <p className="text-muted-foreground">
                Manage your medical information and sharing preferences
              </p>
            </div>
            <Card className="p-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-medical-primary">{patient.medicalHistory.length}</div>
                  <div className="text-sm text-muted-foreground">Total Records</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-medical-secondary">{connectedProviders.length}</div>
                  <div className="text-sm text-muted-foreground">Connected Providers</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${patientEarnings.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                </div>
                <Separator orientation="vertical" className="h-12" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{patientEarnings.totalRecordsSold}</div>
                  <div className="text-sm text-muted-foreground">Records Sold</div>
                </div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="records">My Records</TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="providers">Providers</TabsTrigger>
              <TabsTrigger value="monetization">
                <DollarSign className="h-4 w-4 mr-1" />
                Monetization
              </TabsTrigger>
              <TabsTrigger value="audit">
                <Shield className="h-4 w-4 mr-1" />
                Audit Trail
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-medium">Health Overview</h3>
                  <p className="text-sm text-muted-foreground">Your complete health summary and key metrics</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowExportOverviewDialog(true)}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Overview
                  </Button>
                </div>
              </div>
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                        {patient.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="text-xl">{patient.name}</h2>
                      <p className="text-muted-foreground">Personal Information</p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Date of Birth:</strong> {new Date(patient.dateOfBirth).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Phone:</strong> {patient.phone}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <strong>Email:</strong> {patient.email}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">
                        <strong>Address:</strong><br />
                        {patient.address}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-medical-primary/10">
                      <FileText className="h-5 w-5 text-medical-primary" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{getSharedRecords().length}</div>
                      <div className="text-sm text-muted-foreground">Shared Records</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-medical-secondary/10">
                      <Shield className="h-5 w-5 text-medical-secondary" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{getPrivateRecords().length}</div>
                      <div className="text-sm text-muted-foreground">Private Records</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-medical-accent/10">
                      <Users className="h-5 w-5 text-medical-accent" />
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{connectedProviders.length}</div>
                      <div className="text-sm text-muted-foreground">Healthcare Teams</div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Health Insights Preview */}
              <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <TrendingUp className="h-5 w-5" />
                    Health Insights Available
                  </CardTitle>
                  <CardDescription>
                    Get AI-powered analytics and personalized health recommendations based on your medical data.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">85</div>
                      <div className="text-sm text-muted-foreground">Health Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">4</div>
                      <div className="text-sm text-muted-foreground">Improving Trends</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">4</div>
                      <div className="text-sm text-muted-foreground">AI Recommendations</div>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => {
                    // Switch to insights tab
                    const insightsTab = document.querySelector('[value="insights"]') as HTMLElement;
                    if (insightsTab) insightsTab.click();
                  }}>
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Detailed Health Insights
                  </Button>
                </CardContent>
              </Card>

              {/* Audit Trail Preview */}
              <Card className="border-2 border-dashed border-purple-200 bg-purple-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-purple-800">
                    <Shield className="h-5 w-5" />
                    Audit Trail & Compliance
                  </CardTitle>
                  <CardDescription>
                    Complete access log and compliance monitoring for your medical data security.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">150</div>
                      <div className="text-sm text-muted-foreground">Access Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">98%</div>
                      <div className="text-sm text-muted-foreground">Success Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">95%</div>
                      <div className="text-sm text-muted-foreground">Compliance Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">2</div>
                      <div className="text-sm text-muted-foreground">Security Events</div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-3">Recent Access Activity</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <Eye className="h-3 w-3 text-blue-600" />
                          <span>Dr. Emily Smith viewed Blood Test Results</span>
                        </div>
                        <span className="text-muted-foreground">2h ago</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <Share2 className="h-3 w-3 text-green-600" />
                          <span>Data shared with Research Institute</span>
                        </div>
                        <span className="text-muted-foreground">1d ago</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 bg-white rounded border">
                        <div className="flex items-center gap-2">
                          <Download className="h-3 w-3 text-purple-600" />
                          <span>You downloaded Medical Records</span>
                        </div>
                        <span className="text-muted-foreground">3d ago</span>
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => {
                    // Switch to audit tab
                    const auditTab = document.querySelector('[value="audit"]') as HTMLElement;
                    if (auditTab) auditTab.click();
                  }}>
                    <Shield className="h-4 w-4 mr-2" />
                    View Complete Audit Trail
                  </Button>
                </CardContent>
              </Card>

              {/* Security & Compliance Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Security & Compliance Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">HIPAA Compliance</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">98.5%</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">GDPR Compliance</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">96.2%</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Data Encryption</span>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm">Security Incidents</span>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">2 Resolved</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="records" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">My Medical Records</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {patient.medicalHistory.length} total records
                  </Badge>
                  <Dialog open={isRecordModalOpen} onOpenChange={setIsRecordModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Add Record
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Add Medical Record</DialogTitle>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="type" className="text-right">Type</Label>
                          <Select
                            value={recordForm.type}
                            onValueChange={(value) => setRecordForm({ ...recordForm, type: value })}
                          >
                            <SelectTrigger className="col-span-3">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="visit">Visit</SelectItem>
                              <SelectItem value="lab">Lab Results</SelectItem>
                              <SelectItem value="imaging">Imaging</SelectItem>
                              <SelectItem value="prescription">Prescription</SelectItem>
                              <SelectItem value="vital">Vital Signs</SelectItem>
                              <SelectItem value="allergy">Allergy</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="title" className="text-right">Title</Label>
                          <Input
                            id="title"
                            placeholder="Leave empty for auto-fill"
                            value={recordForm.title}
                            onChange={(e) => setRecordForm({ ...recordForm, title: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="provider" className="text-right">Provider</Label>
                          <Input
                            id="provider"
                            placeholder="Dr. Sample (auto-fill)"
                            value={recordForm.provider}
                            onChange={(e) => setRecordForm({ ...recordForm, provider: e.target.value })}
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="description" className="text-right">Notes</Label>
                          <Textarea
                            id="description"
                            placeholder="Optional - will auto-fill if empty"
                            value={recordForm.description}
                            onChange={(e) => setRecordForm({ ...recordForm, description: e.target.value })}
                            className="col-span-3"
                            rows={3}
                          />
                        </div>

                        {/* Attachment Preview */}
                        <div className="grid grid-cols-4 items-start gap-4">
                          <Label className="text-right">Attachments</Label>
                          <div className="col-span-3">
                            <div className="p-3 bg-muted/50 rounded-lg border-2 border-dashed">
                              <div className="flex items-center gap-2 mb-2">
                                <Paperclip className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Mock attachments will be generated</span>
                              </div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Based on record type, realistic attachments will be automatically created:
                              </p>
                              <div className="text-xs text-muted-foreground space-y-1">
                                {recordForm.type === 'lab' && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Lab results PDF</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Reference values PDF</span>
                                    </div>
                                  </>
                                )}
                                {recordForm.type === 'imaging' && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <Image className="h-3 w-3 text-blue-600" />
                                      <span>Medical image (DICOM)</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Radiology report PDF</span>
                                    </div>
                                  </>
                                )}
                                {recordForm.type === 'prescription' && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Prescription PDF</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Medication guide PDF</span>
                                    </div>
                                  </>
                                )}
                                {recordForm.type === 'visit' && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Visit summary PDF</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Music className="h-3 w-3 text-green-600" />
                                      <span>Clinical notes audio</span>
                                    </div>
                                  </>
                                )}
                                {recordForm.type === 'vital' && (
                                  <div className="flex items-center gap-1">
                                    <FileText className="h-3 w-3 text-red-600" />
                                    <span>Vital signs chart PDF</span>
                                  </div>
                                )}
                                {recordForm.type === 'allergy' && (
                                  <>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Allergy test results PDF</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-3 w-3 text-red-600" />
                                      <span>Emergency action plan PDF</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Video className="h-3 w-3 text-purple-600" />
                                      <span>Management instruction video</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRecordModalOpen(false)}>Cancel</Button>
                        <Button onClick={addMedicalRecord}>Add Record</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {patient.medicalHistory.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Medical Records</h3>
                  <p className="text-muted-foreground mb-4">
                    Your medical records will appear here. Add your first record or populate with sample data.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => setIsRecordModalOpen(true)}>
                      <FileText className="h-4 w-4 mr-2" />
                      Add First Record
                    </Button>
                    <Button variant="outline" onClick={toggleEmptyState}>
                      {isEmptyState ? "Load Sample Data" : "Show Empty State"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {patient.medicalHistory.map((record) => (
                    <MedicalRecordCard
                      key={record.id}
                      record={record}
                      canView={true}
                      showActions={true}
                      isPatientView={true}
                      onShareRecord={handleShareRecord}
                      onMonetizeRecord={handleMonetizeRecord}
                      onUpdateRecord={handleUpdateRecord}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="providers" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Connected Healthcare Providers</h3>
                <Dialog open={isProviderModalOpen} onOpenChange={setIsProviderModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Users className="h-4 w-4 mr-2" />
                      Connect New Provider
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Connect Healthcare Provider</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="providerName" className="text-right">Name</Label>
                        <Input
                          id="providerName"
                          placeholder="Dr. Sample Provider (auto-fill)"
                          value={providerForm.name}
                          onChange={(e) => setProviderForm({ ...providerForm, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="specialty" className="text-right">Specialty</Label>
                        <Select
                          value={providerForm.specialty}
                          onValueChange={(value) => setProviderForm({ ...providerForm, specialty: value })}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Practice">General Practice</SelectItem>
                            <SelectItem value="Internal Medicine">Internal Medicine</SelectItem>
                            <SelectItem value="Cardiology">Cardiology</SelectItem>
                            <SelectItem value="Dermatology">Dermatology</SelectItem>
                            <SelectItem value="Orthopedics">Orthopedics</SelectItem>
                            <SelectItem value="Psychiatry">Psychiatry</SelectItem>
                            <SelectItem value="Radiology">Radiology</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="organization" className="text-right">Organization</Label>
                        <Input
                          id="organization"
                          placeholder="Sample Medical Center (auto-fill)"
                          value={providerForm.organization}
                          onChange={(e) => setProviderForm({ ...providerForm, organization: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="providerEmail" className="text-right">Email</Label>
                        <Input
                          id="providerEmail"
                          type="email"
                          placeholder="doctor@example.com (auto-fill)"
                          value={providerForm.email}
                          onChange={(e) => setProviderForm({ ...providerForm, email: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="providerPhone" className="text-right">Phone</Label>
                        <Input
                          id="providerPhone"
                          placeholder="(555) 123-0000 (auto-fill)"
                          value={providerForm.phone}
                          onChange={(e) => setProviderForm({ ...providerForm, phone: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsProviderModalOpen(false)}>Cancel</Button>
                      <Button onClick={addProvider}>Connect Provider</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {connectedProviders.length === 0 ? (
                <Card className="p-8 text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Connected Providers</h3>
                  <p className="text-muted-foreground mb-4">
                    Connect with healthcare providers to manage permissions and share your medical information securely.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => setIsProviderModalOpen(true)}>
                      <Users className="h-4 w-4 mr-2" />
                      Connect First Provider
                    </Button>
                    <Button variant="outline" onClick={toggleEmptyState}>
                      {isEmptyState ? "Load Sample Data" : "Show Empty State"}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connectedProviders.map((provider) => (
                    <Card key={provider.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-gradient-to-br from-medical-accent/20 to-medical-warning/20">
                              {provider.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-base">{provider.name}</CardTitle>
                            <CardDescription>{provider.specialty}</CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm">
                          <p><strong>Organization:</strong> {provider.organization}</p>
                          <p><strong>Email:</strong> {provider.email}</p>
                          <p><strong>Phone:</strong> {provider.phone}</p>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full mt-4"
                          onClick={() => setIsRequestsManagerOpen(true)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Permissions
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="upload" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Upload Medical Files</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload your medical documents securely to 0G decentralized storage
                  </p>
                </div>

                <FileUpload
                  onUploadComplete={(fileId) => {
                    console.log('File uploaded:', fileId);
                  }}
                />

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Uploads</CardTitle>
                    <CardDescription>
                      Your recently uploaded medical files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-500">
                      No files uploaded yet. Use the upload area above to add your first medical document.
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="space-y-6">
              <AuditTrail patientId={patient.id} />
            </TabsContent>

            <TabsContent value="monetization" className="space-y-6">
              <MonetizationDashboard
                patientId={patient.id}
                medicalRecords={patient.medicalHistory}
                onToggleMonetization={(recordId, enabled) => {
                  console.log(`Toggled monetization for record ${recordId}: ${enabled}`);
                  // In a real app, this would update the patient's monetization settings
                }}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Provider Requests Manager */}
      <ProviderRequestsManager
        patientId={patient.id}
        isOpen={isRequestsManagerOpen}
        onClose={() => setIsRequestsManagerOpen(false)}
        onRequestUpdate={handleProviderRequestUpdate}
      />

      {/* Profile Settings Dialog */}
      <Dialog open={showProfileSettingsDialog} onOpenChange={setShowProfileSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-first-name">First Name</Label>
                <Input
                  id="profile-first-name"
                  defaultValue={patient.name.split(' ')[0]}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="profile-last-name">Last Name</Label>
                <Input
                  id="profile-last-name"
                  defaultValue={patient.name.split(' ').slice(1).join(' ')}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="profile-email">Email Address</Label>
              <Input
                id="profile-email"
                type="email"
                defaultValue={patient.email}
                placeholder="Email address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input
                  id="profile-phone"
                  defaultValue={patient.phone}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <Label htmlFor="profile-dob">Date of Birth</Label>
                <Input
                  id="profile-dob"
                  type="date"
                  defaultValue={patient.dateOfBirth}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="profile-address">Address</Label>
              <Input
                id="profile-address"
                defaultValue={patient.address}
                placeholder="Full address"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="emergency-name">Emergency Contact Name</Label>
                <Input
                  id="emergency-name"
                  defaultValue={patient.emergencyContact?.name || ''}
                  placeholder="Emergency contact name"
                />
              </div>
              <div>
                <Label htmlFor="emergency-phone">Emergency Contact Phone</Label>
                <Input
                  id="emergency-phone"
                  defaultValue={patient.emergencyContact?.phone || ''}
                  placeholder="Emergency contact phone"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowProfileSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock save functionality
                setTimeout(() => {
                  setShowProfileSettingsDialog(false);
                }, 500);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Settings Dialog */}
      <Dialog open={showPrivacySettingsDialog} onOpenChange={setShowPrivacySettingsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Privacy Settings
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6 py-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Data Sharing Preferences</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Allow Family Access</div>
                      <p className="text-xs text-muted-foreground">Let designated family members view your health records</p>
                    </div>
                    <Switch
                      checked={patient.privacySettings?.allowFamilyAccess || false}
                      onCheckedChange={(checked) => updatePrivacySetting('allowFamilyAccess', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Anonymous Research</div>
                      <p className="text-xs text-muted-foreground">Contribute anonymized data to medical research</p>
                    </div>
                    <Switch
                      checked={patient.privacySettings?.allowAnonymousResearch || false}
                      onCheckedChange={(checked) => updatePrivacySetting('allowAnonymousResearch', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-sm">Emergency Override</div>
                      <p className="text-xs text-muted-foreground">Allow emergency access to critical health data</p>
                    </div>
                    <Switch
                      checked={patient.privacySettings?.allowEmergencyOverride || false}
                      onCheckedChange={(checked) => updatePrivacySetting('allowEmergencyOverride', checked)}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-3">Default Provider Permissions</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  These settings apply to new healthcare providers when they connect to your account.
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'demographics', title: 'Basic Demographics' },
                    { id: 'medical-history', title: 'Medical History' },
                    { id: 'medications', title: 'Current Medications' },
                    { id: 'lab-results', title: 'Lab Results' },
                    { id: 'imaging', title: 'Medical Imaging' },
                    { id: 'mental-health', title: 'Mental Health Records' },
                    { id: 'genetic', title: 'Genetic Information' },
                    { id: 'insurance', title: 'Insurance Information' }
                  ].map((category) => (
                    <div key={category.id} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{category.title}</span>
                      <select
                        className="text-xs border rounded px-2 py-1"
                        value={patient.privacySettings?.defaultPermissions?.[category.id] || 'none'}
                        onChange={(e) => updateDefaultPermission(category.id, e.target.value)}
                      >
                        <option value="none">No Access</option>
                        <option value="view">View Only</option>
                        <option value="comment">View & Comment</option>
                        <option value="full">Full Access</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPrivacySettingsDialog(false)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Account Settings Dialog */}
      <Dialog open={showAccountSettingsDialog} onOpenChange={setShowAccountSettingsDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Account Settings
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <h4 className="text-sm font-medium mb-3">Security Settings</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Two-Factor Authentication</div>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Login Notifications</div>
                    <p className="text-xs text-muted-foreground">Get notified when someone logs into your account</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Session Timeout</div>
                    <p className="text-xs text-muted-foreground">Automatically log out after inactivity</p>
                  </div>
                  <select className="text-sm border rounded px-2 py-1">
                    <option value="15">15 minutes</option>
                    <option value="30" selected>30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Notification Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Email Notifications</div>
                    <p className="text-xs text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">SMS Notifications</div>
                    <p className="text-xs text-muted-foreground">Receive updates via text message</p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium text-sm">Push Notifications</div>
                    <p className="text-xs text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Data Export</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export All Medical Records
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Export Account Data
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAccountSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock save functionality
                setTimeout(() => {
                  setShowAccountSettingsDialog(false);
                }, 500);
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Export Overview Dialog */}
      <Dialog open={showExportOverviewDialog} onOpenChange={setShowExportOverviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Health Overview
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="text-sm font-medium">Export Format</Label>
              <select className="w-full p-2 border rounded-md mt-1">
                <option value="pdf">PDF Report</option>
                <option value="csv">CSV Data</option>
                <option value="json">JSON Data</option>
                <option value="xlsx">Excel Spreadsheet</option>
              </select>
            </div>
            <div>
              <Label className="text-sm font-medium">Include Sections</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-personal-info" defaultChecked />
                  <Label htmlFor="overview-personal-info" className="text-sm">Personal Information</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-health-stats" defaultChecked />
                  <Label htmlFor="overview-health-stats" className="text-sm">Health Statistics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-recent-records" defaultChecked />
                  <Label htmlFor="overview-recent-records" className="text-sm">Recent Medical Records</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-providers" defaultChecked />
                  <Label htmlFor="overview-providers" className="text-sm">Connected Providers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-compliance" />
                  <Label htmlFor="overview-compliance" className="text-sm">Security & Compliance Status</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-monetization" />
                  <Label htmlFor="overview-monetization" className="text-sm">Monetization Summary</Label>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Report Options</Label>
              <div className="space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-include-charts" defaultChecked />
                  <Label htmlFor="overview-include-charts" className="text-sm">Include Charts and Graphs</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-include-trends" defaultChecked />
                  <Label htmlFor="overview-include-trends" className="text-sm">Include Health Trends</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="overview-include-recommendations" />
                  <Label htmlFor="overview-include-recommendations" className="text-sm">Include AI Recommendations</Label>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Comprehensive Report</p>
                  <p className="text-xs text-green-700 mt-1">
                    This export will create a complete health overview suitable for sharing with new healthcare providers
                    or for your personal records.
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowExportOverviewDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Mock export functionality
                setTimeout(() => {
                  setShowExportOverviewDialog(false);
                }, 1000);
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export Overview
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};