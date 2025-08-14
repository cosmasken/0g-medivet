import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRecordStore } from '@/stores/recordStore';
import { useMarketStore } from '@/stores/marketStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  DollarSign, 
  Share2, 
  Eye, 
  Calendar,
  TrendingUp,
  Activity
} from 'lucide-react';
import { PatientProfile } from '@/types';
import { formatDistance } from 'date-fns';
import UploadModal from '@/components/patient/UploadModal';
import ShareModal from '@/components/patient/ShareModal';
import toast from 'react-hot-toast';

const PatientDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { records, getRecordsByOwner } = useRecordStore();
  const { listings, bids } = useMarketStore();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
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
        <Button 
          onClick={() => setUploadModalOpen(true)}
          className="medical-gradient medical-shadow"
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Record
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              {userRecords.filter(r => r.status === 'Monetizable').length} monetizable
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

      {/* Recent Records */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Your Health Records</span>
          </CardTitle>
          <CardDescription>
            Manage and share your medical data securely
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {userRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No health records yet</p>
                <p className="text-sm">Upload your first record to get started</p>
              </div>
            ) : (
              userRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg medical-transition hover:shadow-md">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium">{record.title}</h4>
                      <Badge variant={getStatusColor(record.status) as any}>
                        {record.status}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDistance(new Date(record.createdAt), new Date(), { addSuffix: true })}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Eye className="h-3 w-3" />
                        <span>{record.accessCount} views</span>
                      </span>
                      <span className="capitalize text-primary">{record.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleShare(record.id)}
                    >
                      <Share2 className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <UploadModal 
        open={uploadModalOpen} 
        onOpenChange={setUploadModalOpen} 
      />
      <ShareModal 
        open={shareModalOpen} 
        onOpenChange={setShareModalOpen}
        recordId={selectedRecordId}
      />
    </div>
  );
};

export default PatientDashboard;