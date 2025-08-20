import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRecordStore } from '@/stores/recordStore';
import { useMarketStore } from '@/stores/marketStore';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  FileText,
  DollarSign,
  Share2,
  Eye,
  Calendar,
  TrendingUp,
  Activity,
  Database,
  Plus,
  CloudUpload
} from 'lucide-react';
import { PatientProfile } from '@/types';
import { formatDistance } from 'date-fns';
import MedicalFileUpload from '@/components/medical/MedicalFileUpload';
import MedicalTextUpload from '@/components/medical/MedicalTextUpload';
import MedicalFilesList from '@/components/medical/MedicalFilesList';
import MedicalFileDownload from '@/components/medical/MedicalFileDownload';
import MedicalMarketplace from '@/components/medical/MedicalMarketplace';
import ShareModal from '@/components/patient/ShareModal';
import AiInsightConsentModal from '@/components/patient/AiInsightConsentModal';
import AiInsightResultModal from '@/components/patient/AiInsightResultModal';
import WithdrawalModal from '@/components/patient/WithdrawalModal';
import toast from 'react-hot-toast';

const PatientDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { records, getRecordsByOwner } = useRecordStore();
  const { listings, bids } = useMarketStore();
  const { getFilesByWallet, addFile } = useMedicalFilesStore();
  const { address } = useWallet();
  const [showUploadSection, setShowUploadSection] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [aiConsentModalOpen, setAiConsentModalOpen] = useState(false);
  const [aiResultModalOpen, setAiResultModalOpen] = useState(false);
  const [aiInsightData, setAiInsightData] = useState<any>(null);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  if (!currentUser || currentUser.role !== 'Patient') {
    return <div>Access denied</div>;
  }

  const profile = currentUser.profile as PatientProfile;
  const userRecords = getRecordsByOwner(currentUser.principal);
  const userListings = listings.filter(l => l.patient === currentUser.principal);
  const totalEarnings = userListings
    .filter(l => l.status === 'sold')
    .reduce((sum, l) => sum + (l.currentHighestBid || 0), 0);
  
  // Get 0G Storage files
  const userFiles = address ? getFilesByWallet(address) : [];
  const documentFiles = userFiles.filter(f => !f.isTextRecord);
  const textRecords = userFiles.filter(f => f.isTextRecord);

  const handleShare = (recordId: number) => {
    setSelectedRecordId(recordId);
    setShareModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Monetizable': return 'success';
      case 'NonMonetizable': return 'secondary';
      case 'Flagged': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile.fullName.split(' ')[0]}
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your health records and data monetization
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => setShowUploadSection(!showUploadSection)}
            className="ai-gradient zero-g-glow"
          >
            <CloudUpload className="mr-2 h-4 w-4" />
            {showUploadSection ? 'Hide Upload' : 'Upload to 0G'}
          </Button>
          <Button
            onClick={() => setWithdrawalModalOpen(true)}
            variant="outline"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">0G Storage Files</CardTitle>
            <Database className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{userFiles.length}</div>
            <p className="text-xs text-muted-foreground">
              {documentFiles.length} documents • {textRecords.length} records
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{totalEarnings} MT</div>
            <p className="text-xs text-muted-foreground">
              From {userListings.filter(l => l.status === 'sold').length} sales
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            <TrendingUp className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userListings.filter(l => l.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              {userListings.reduce((sum, l) => sum + l.bidCount, 0)} total bids
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Privacy</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">Secure</div>
            <p className="text-xs text-muted-foreground">
              End-to-end encrypted
            </p>
          </CardContent>
        </Card>
      </div>

      {/* AI Health Insights Card */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>AI Health Insights (Preview)</span>
          </CardTitle>
          <CardDescription>
            100% opt-in, encrypted on-device demo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => setAiConsentModalOpen(true)}
            className="medical-gradient medical-shadow"
          >
            Try Demo
          </Button>
        </CardContent>
      </Card>

      {/* Monetization Status */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-success" />
            <span>Data Monetization</span>
            <Badge variant={profile.monetizeEnabled ? "default" : "secondary"}>
              {profile.monetizeEnabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Control how your health data can be used for research and compensation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Monetization Status</p>
                <p className="text-sm text-muted-foreground">
                  {profile.monetizeEnabled
                    ? 'Your data can be listed on the marketplace'
                    : 'Data monetization is currently disabled'
                  }
                </p>
              </div>
              <Button
                variant={profile.monetizeEnabled ? "destructive" : "default"}
                onClick={() => toast.success('Monetization setting updated')}
              >
                {profile.monetizeEnabled ? 'Disable' : 'Enable'}
              </Button>
            </div>
            <Progress value={profile.monetizeEnabled ? 100 : 0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Upload Section */}
      {showUploadSection && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <div className="w-6 h-6 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
                <CloudUpload className="h-3 w-3 text-white" />
              </div>
              <span>Upload to 0G Storage</span>
            </CardTitle>
            <CardDescription>
              Upload medical files and records to decentralized storage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="files" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="files">Medical Files</TabsTrigger>
                <TabsTrigger value="records">Text Records</TabsTrigger>
              </TabsList>
              <TabsContent value="files" className="mt-6">
                <MedicalFileUpload
                  onUploadComplete={(files) => {
                    files.forEach(f => {
                      if (f.txHash && f.rootHash && address) {
                        addFile({
                          id: f.id,
                          name: f.file.name,
                          type: f.file.type,
                          size: f.file.size,
                          category: f.category,
                          description: f.description,
                          uploadDate: new Date().toISOString(),
                          walletAddress: address,
                          txHash: f.txHash,
                          rootHash: f.rootHash,
                          isTextRecord: false,
                          shared: false,
                          tags: f.category ? [f.category] : []
                        });
                      }
                    });
                    toast.success(`${files.length} file(s) uploaded and indexed!`);
                  }}
                  onError={(error) => {
                    toast.error(`Upload error: ${error}`);
                  }}
                />
              </TabsContent>
              <TabsContent value="records" className="mt-6">
                <MedicalTextUpload
                  onUploadComplete={(record) => {
                    if (record.txHash && record.rootHash && address) {
                      addFile({
                        id: record.id,
                        name: `${record.title}.json`,
                        type: 'application/json',
                        size: JSON.stringify(record).length,
                        category: record.category,
                        description: record.description,
                        uploadDate: new Date().toISOString(),
                        walletAddress: address,
                        txHash: record.txHash,
                        rootHash: record.rootHash,
                        isTextRecord: true,
                        recordType: record.type,
                        shared: false,
                        tags: record.category ? [record.category, record.type] : [record.type]
                      });
                    }
                    toast.success(`${record.title} uploaded and indexed!`);
                  }}
                  onError={(error) => {
                    toast.error(`Upload error: ${error}`);
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Medical Files and Marketplace Tabs */}
      <Card className="medical-card">
        <CardContent className="pt-6">
          <Tabs defaultValue="files" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="files" className="flex items-center space-x-2">
                <Database className="h-4 w-4" />
                <span>My Files</span>
              </TabsTrigger>
              <TabsTrigger value="download" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>Download</span>
              </TabsTrigger>
              <TabsTrigger value="marketplace" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Marketplace</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="files" className="mt-6">
              <MedicalFilesList className="" />
            </TabsContent>
            
            <TabsContent value="download" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Download Medical Files</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Download files from 0G Storage using their root hash
                  </p>
                </div>
                <MedicalFileDownload />
              </div>
            </TabsContent>
            
            <TabsContent value="marketplace" className="mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Medical Data Marketplace</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Browse and trade medical datasets (Demo)
                  </p>
                </div>
                <MedicalMarketplace />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modals */}
      <ShareModal
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
        recordId={selectedRecordId}
      />
      <AiInsightConsentModal
        open={aiConsentModalOpen}
        onOpenChange={setAiConsentModalOpen}
        userRecords={userRecords}
        onInsightGenerated={(insight) => {
          setAiInsightData(insight);
          setAiResultModalOpen(true);
        }}
      />
      {aiInsightData && (
        <AiInsightResultModal
          open={aiResultModalOpen}
          onOpenChange={setAiResultModalOpen}
          insightData={aiInsightData}
        />
      )}
      <WithdrawalModal
        open={withdrawalModalOpen}
        onOpenChange={setWithdrawalModalOpen}
      />
    </div>
  );
};

export default PatientDashboard;