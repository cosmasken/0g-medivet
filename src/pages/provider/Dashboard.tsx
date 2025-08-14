import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRecordStore } from '@/stores/recordStore';
import { useMarketStore } from '@/stores/marketStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  FileText, 
  DollarSign, 
  Clock, 
  Eye,
  Unlock,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { ProviderProfile } from '@/types';
import { formatDistance } from 'date-fns';
import toast from 'react-hot-toast';

const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { getSharedRecords, unlockRecord } = useRecordStore();
  const { getBidsForProvider } = useMarketStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [unlockingRecord, setUnlockingRecord] = useState<number | null>(null);

  if (!currentUser || currentUser.role !== 'Provider') {
    return <div>Access denied</div>;
  }

  const profile = currentUser.profile as ProviderProfile;
  const sharedRecords = getSharedRecords(currentUser.principal);
  const myBids = getBidsForProvider(currentUser.principal);
  
  const filteredRecords = sharedRecords.filter(record =>
    record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    record.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUnlockRecord = async (recordId: number) => {
    setUnlockingRecord(recordId);
    try {
      await unlockRecord(recordId, currentUser.principal);
      toast.success('Record decrypted successfully!');
    } catch (error) {
      toast.error('Failed to decrypt record');
    } finally {
      setUnlockingRecord(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Provider Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Access shared health records and research data
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={profile.whitelisted ? "default" : "secondary"}>
            {profile.whitelisted ? 'Verified Provider' : 'Pending Verification'}
          </Badge>
          <Badge variant="outline">
            Reputation: {profile.reputation}%
          </Badge>
        </div>
      </div>

      {/* Verification Warning */}
      {!profile.whitelisted && (
        <Card className="medical-card border-warning bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning">Verification Pending</p>
                <p className="text-sm text-muted-foreground">
                  Your provider account is pending admin verification. Some features may be limited.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessible Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sharedRecords.length}</div>
            <p className="text-xs text-muted-foreground">
              Shared with you
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <DollarSign className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myBids.filter(b => b.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{profile.reputation}%</div>
            <p className="text-xs text-muted-foreground">
              Provider rating
            </p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verification Status</CardTitle>
            <Eye className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profile.whitelisted ? 'text-success' : 'text-warning'}`}>
              {profile.whitelisted ? 'Verified' : 'Pending'}
            </div>
            <p className="text-xs text-muted-foreground">
              Account status
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Records */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Shared Health Records</span>
              </CardTitle>
              <CardDescription>
                Records that have been shared with you by patients
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search records..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No shared records found</p>
                <p className="text-sm">
                  {searchQuery ? 'Try adjusting your search terms' : 'Wait for patients to share records with you'}
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => {
                const sharedWith = record.sharedWith?.find(s => s.provider === currentUser.principal);
                const isExpired = sharedWith?.expiresAt && sharedWith.expiresAt < Date.now();
                
                return (
                  <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg medical-transition hover:shadow-md">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{record.title}</h4>
                        <Badge variant="outline">{record.category}</Badge>
                        {isExpired && (
                          <Badge variant="destructive">Expired</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {sharedWith?.expiresAt 
                              ? `Expires ${formatDistance(new Date(sharedWith.expiresAt), new Date(), { addSuffix: true })}`
                              : 'No expiration'
                            }
                          </span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-3 w-3" />
                          <span>{record.accessCount} accesses</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={isExpired || unlockingRecord === record.id}
                        onClick={() => handleUnlockRecord(record.id)}
                      >
                        {unlockingRecord === record.id ? (
                          <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin mr-1" />
                        ) : (
                          <Unlock className="h-3 w-3 mr-1" />
                        )}
                        {isExpired ? 'Expired' : 'Decrypt'}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderDashboard;