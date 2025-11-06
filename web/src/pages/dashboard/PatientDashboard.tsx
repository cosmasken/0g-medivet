import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { getUserRecords } from '@/lib/api';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Upload, Users, FileText, Settings, LogOut, User, Heart, Plus, Download, DollarSign } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://medivet.paymebro.xyz/api';

export default function PatientDashboard() {
  const { address, disconnect } = useWallet();
  const { currentUser, logout } = useAuthStore();
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      setUploading(true);
      
      console.log('📤 Starting server-side 0G Storage upload:', selectedFile.name);
      
      // Create FormData for server upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('user_id', currentUser.id);
      
      console.log('📋 Uploading via server API...');
      
      // Upload via server API (avoids CORS issues)
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server upload failed:', { status: response.status, error: errorText });
        throw new Error(`Server upload failed: ${errorText || response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ Server upload successful:', result);
      
      toast.success(`File "${selectedFile.name}" uploaded to 0G Storage successfully!`);
      setSelectedFile(null);
      setShowUpload(false);
      loadRecords();
      
    } catch (error) {
      console.error('❌ Upload failed:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (record: any) => {
    try {
      setDownloading(record.id);
      
      console.log('📥 Starting server-side 0G Storage download:', {
        fileName: record.file_name,
        storageHash: record.storage_hash,
        recordId: record.id
      });
      
      // Check if we have a valid storage hash
      if (!record.storage_hash || record.storage_hash.startsWith('temp-hash-')) {
        console.warn('⚠️ Record has temporary hash, cannot download from 0G Storage');
        toast.error('This file was uploaded before 0G Storage integration and cannot be downloaded.');
        return;
      }
      
      // Download via server API
      const response = await fetch(`${API_BASE_URL}/download/stream/${record.storage_hash}?networkType=turbo&filename=${encodeURIComponent(record.file_name)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server download failed:', { status: response.status, error: errorText });
        toast.error(`Download failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      // Create blob from response and trigger download
      const blob = await response.blob();
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
    { label: 'Shared Records', value: 0, icon: Users, color: 'text-green-600' },
    { label: 'Balance Earned', value: '$0.00', icon: DollarSign, color: 'text-purple-600' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {patient.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {patient.name}</h1>
                <p className="text-sm text-gray-500">Patient Dashboard</p>
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
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-500" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setShowUpload(!showUpload)}
                    className="h-20 flex flex-col items-center justify-center"
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    Upload via Server
                  </Button>
                  <Button 
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center"
                    onClick={() => loadRecords()}
                  >
                    <Download className="h-6 w-6 mb-2" />
                    Refresh Records
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            {showUpload && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload Medical Records</CardTitle>
                  <CardDescription>
                    Upload files via MediVet server to 0G Storage
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
                        Uploading to 0G Storage...
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleUpload} 
                      disabled={!selectedFile || uploading}
                    >
                      {uploading ? 'Uploading to 0G Storage...' : 'Upload to 0G Storage'}
                    </Button>
                    <Button variant="outline" onClick={() => setShowUpload(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

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
                    {records.slice(0, 5).map((record: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{record.title || 'Medical Record'}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(record.created_at).toLocaleDateString()}
                          </p>
                          {record.zero_g_hash && (
                            <p className="text-xs text-gray-400 font-mono">
                              0G Hash: {record.zero_g_hash.slice(0, 10)}...{record.zero_g_hash.slice(-6)}
                            </p>
                          )}
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownload(record)}
                          disabled={downloading === record.id}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          {downloading === record.id ? 'Downloading...' : 'Download'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
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
                  <Badge>Patient</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Storage</p>
                  <Badge variant="outline">Server → 0G Storage</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Server Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  MediVet Server
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Files uploaded via secure server to 0G Storage
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <p>✅ Server-side 0G integration</p>
                  <p>✅ No CORS issues</p>
                  <p>✅ Secure file handling</p>
                  <p>✅ Blockchain verified</p>
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
                {records.length > 0 ? (
                  <Button variant="outline" size="sm" className="w-full">
                    Manage Access
                  </Button>
                ) : (
                  <p className="text-sm text-gray-500">Upload records first to manage access</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
