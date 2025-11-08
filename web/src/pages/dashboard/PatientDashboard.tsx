import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { getUserRecords } from '@/lib/api';
import { useClientUpload } from '@/hooks/useClientUpload';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Upload, Users, FileText, Settings, LogOut, User, Heart, Plus, Download, DollarSign, Activity, Wallet, Shield, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://medivet.paymebro.xyz/api';

export default function PatientDashboard() {
  const { address, disconnect } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const { uploading, uploadStatus, error: uploadError, uploadFile, resetState } = useClientUpload();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const patient = {
    name: currentUser?.fullName || address?.slice(0, 8) || 'Patient',
    walletAddress: address || 'Not connected'
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadRecords();
    }
  }, [currentUser]);

  const loadRecords = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);
      const response = await getUserRecords(currentUser.id);
      setRecords(response.records || []);
    } catch (error) {
      console.warn('Failed to load records from API, using empty state:', error);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await disconnect();
    logout();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser?.id) return;

    try {
      console.log('📤 Starting client-side 0G Storage upload:', selectedFile.name);

      // Upload directly to 0G Storage using client-side SDK
      const result = await uploadFile(selectedFile, 'turbo');

      if (result.success) {
        console.log('✅ Client upload successful:', result);

        // Save record to backend with 0G Storage hash
        const recordData = {
          user_id: currentUser.id,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          storage_hash: result.rootHash,
          tx_hash: result.txHash,
          upload_date: new Date().toISOString()
        };

        const response = await fetch(`${API_BASE_URL}/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(recordData)
        });

        if (response.ok) {
          toast.success(`File "${selectedFile.name}" uploaded to 0G Storage successfully!`);
          setSelectedFile(null);
          setShowUpload(false);
          resetState();
          loadRecords();
        } else {
          console.warn('File uploaded to 0G but failed to save record to backend');
          toast.success(`File uploaded to 0G Storage, but record saving failed`);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }

    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDownload = async (record: any) => {
    try {
      setDownloading(record.id);

      console.log('📥 Starting frontend 0G Storage download:', {
        fileName: record.file_name,
        storageHash: record.storage_hash || record.zero_g_hash,
        recordId: record.id
      });

      // Check if we have a valid storage hash
      const storageHash = record.storage_hash || record.zero_g_hash;
      if (!storageHash || storageHash.startsWith('temp-hash-') || storageHash === 'unknown') {
        console.warn('⚠️ Record has invalid hash, cannot download from 0G Storage');
        toast.error('This file cannot be downloaded - invalid storage hash.');
        return;
      }

      // Use frontend 0G download
      const { downloadFromStorage } = await import('@/lib/0g/downloader');
      const [fileData, downloadError] = await downloadFromStorage(storageHash, 'turbo');

      if (downloadError || !fileData) {
        console.error('❌ Frontend download failed:', downloadError);
        toast.error(`Download failed: ${downloadError?.message || 'Unknown error'}`);
        return;
      }

      // Create blob and trigger download
      const blob = new Blob([fileData], { type: record.file_type || 'application/octet-stream' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.file_name || 'medical-record';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      console.log('✅ File downloaded successfully from 0G Storage');
      toast.success(`File "${record.file_name}" downloaded successfully!`);

    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error(`Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDownloading(null);
    }
  };

  const stats = [
    { label: 'Medical Records', value: records.length, icon: FileText, color: 'text-blue-600' },
    { label: 'Shared Records', value: '2', icon: Users, color: 'text-green-600' },
    { label: 'Total Size', value: `${(records.reduce((sum, record) => sum + (record.file_size || 0), 0) / (1024*1024)).toFixed(2)} MB`, icon: Download, color: 'text-amber-600' },
    { label: 'Active Providers', value: '3', icon: Heart, color: 'text-red-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 gap-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Welcome, {patient.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active Patient
                  </Badge>
                  <div className="flex items-center text-xs text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    <span>Secure records</span>
                  </div>
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
            <TabsTrigger value="records">My Records</TabsTrigger>
            <TabsTrigger value="access">Provider Access</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Heart className="h-5 w-5 mr-2 text-red-500" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Manage your medical records and provider access
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        onClick={() => setShowUpload(!showUpload)}
                        className="h-20 flex flex-col items-center justify-center"
                      >
                        <Upload className="h-6 w-6 mb-2" />
                        Upload Record
                      </Button>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center justify-center"
                        onClick={() => setActiveTab('records')}
                      >
                        <FileText className="h-6 w-6 mb-2" />
                        View All Records
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Security Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-blue-500" />
                        <span>Security Status</span>
                      </div>
                      <Badge variant="default" className="bg-green-500">
                        Secure
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Your medical records are securely stored on 0G Storage
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-full mr-3">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-green-900">Secure Storage</h4>
                          <p className="text-sm text-green-700">Your records are encrypted and stored on 0G Storage</p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Decentralized</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Encrypted</span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Immutable</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>Accessible</span>
                          </div>
                        </div>
                      </div>
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
                      <Badge variant="outline">Patient</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Storage</p>
                      <Badge variant="outline">0G Storage</Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Security</p>
                      <Badge className="bg-green-500">Secure</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Provider Access */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Provider Access
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4">
                      Manage which healthcare providers can access your records
                    </p>
                    <Button variant="outline" size="sm" className="w-full mb-3">
                      View Active Providers (3)
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Provider
                    </Button>
                  </CardContent>
                </Card>

                {/* 0G Storage Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-sm">
                      <FileText className="h-4 w-4 mr-2" />
                      0G Storage Benefits
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-xs text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Decentralized and secure</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Immutable records</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>Direct from browser</span>
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1 mt-0.5 flex-shrink-0" />
                        <span>No third-party servers</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="records" className="space-y-6">
            {/* File Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Medical Records
                  </span>
                </CardTitle>
                <CardDescription>
                  Upload files directly to 0G Storage from your browser
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                />
                {selectedFile && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                    </p>
                  </div>
                )}
                {uploading && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Uploading to 0G Storage... {uploadStatus}
                    </p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                  >
                    {uploading ? (uploadStatus || 'Uploading to 0G Storage...') : 'Upload to 0G Storage'}
                  </Button>
                  {selectedFile && (
                    <Button variant="outline" onClick={() => setSelectedFile(null)}>
                      Clear
                    </Button>
                  )}
                </div>
                {uploadError && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Error: {uploadError}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Medical Records */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    My Medical Records
                  </span>
                  <Badge variant="secondary">{records.length} files</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Loading records...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No medical records uploaded yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Upload your first medical record to get started
                    </p>
                    <Button
                      onClick={() => setShowUpload(true)}
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Upload Your First Record
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{record.title || record.file_name || 'Medical Record'}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span>{new Date(record.created_at || record.upload_date).toLocaleDateString()}</span>
                              <span>{Math.round((record.file_size || 0) / 1024)} KB</span>
                              {record.zero_g_hash && (
                                <span className="font-mono text-xs">
                                  0G: {record.zero_g_hash.slice(0, 8)}...{record.zero_g_hash.slice(-4)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(record)}
                            disabled={downloading === record.id}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            {downloading === record.id ? 'Downloading...' : 'Download'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setActiveTab('access')}
                          >
                            <Users className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="access" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Provider Access Management
                </CardTitle>
                <CardDescription>
                  Control which healthcare providers can access your medical records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-blue-600 mr-3" />
                      <div>
                        <h4 className="font-medium text-blue-900">Provider Access Control</h4>
                        <p className="text-sm text-blue-700">Only authorized providers can access your records</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="hover:border-blue-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Active Access</h4>
                            <p className="text-sm text-gray-600">3 providers have access</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="hover:border-red-300 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-yellow-100 p-2 rounded-full">
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">Pending Requests</h4>
                            <p className="text-sm text-gray-600">0 pending requests</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Authorized Providers</h4>
                    <div className="space-y-3">
                      {[{name: "Dr. Smith", specialty: "Cardiology", status: "Active"}, {name: "Dr. Johnson", specialty: "Internal Medicine", status: "Active"}, {name: "Dr. Williams", specialty: "Dermatology", status: "Active"}].map((provider, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{provider.name}</p>
                            <p className="text-sm text-gray-600">{provider.specialty}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={provider.status === "Active" ? "default" : "secondary"}>
                              {provider.status}
                            </Badge>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Add Provider Access</h4>
                    <div className="flex space-x-2">
                      <Input placeholder="Provider wallet address or ID" />
                      <Button>Add Provider</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}