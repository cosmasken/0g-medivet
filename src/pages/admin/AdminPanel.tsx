import React, { useState } from 'react';
import { useAdminStore } from '@/stores/adminStore';
import { useRecordStore } from '@/stores/recordStore';
import { useMarketStore } from '@/stores/marketStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Users, 
  FileText, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmationDialog from '@/components/ui/ConfirmationDialog';

const AdminPanel: React.FC = () => {
  const { providers, whitelistProvider, updateProviderReputation } = useAdminStore();
  const { records, flagRecord } = useRecordStore();
  const { listings } = useMarketStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogConfig, setDialogConfig] = useState({ title: '', description: '', onConfirm: () => {} });

  const pendingProviders = providers.filter(p => !p.whitelisted);
  const whitelistedProviders = providers.filter(p => p.whitelisted);
  const flaggedRecords = records.filter(r => r.status === 'Flagged');
  const monetizableRecords = records.filter(r => r.status === 'Monetizable');

  const handleWhitelistProvider = (license: string, whitelisted: boolean) => {
    whitelistProvider(license, whitelisted);
    toast.success(`Provider ${whitelisted ? 'approved' : 'removed from whitelist'}`);
  };

  const handleFlagRecord = (recordId: number, flagged: boolean) => {
    flagRecord(recordId, flagged ? 'Flagged' : 'Monetizable');
    toast.success(`Record ${flagged ? 'flagged' : 'unflagged'}`);
  };

  const openConfirmationDialog = (title: string, description: string, onConfirm: () => void) => {
    setDialogConfig({ title, description, onConfirm });
    setDialogOpen(true);
  };

  const handleRejectProvider = (providerName: string) => {
    openConfirmationDialog(
      'Reject Provider?',
      `Are you sure you want to reject ${providerName}? This action cannot be undone.`,
      () => toast.error('Provider rejection feature not implemented yet.')
    );
  };

  const handleRevokeProvider = (license: string, providerName: string) => {
    openConfirmationDialog(
      'Revoke Provider?',
      `Are you sure you want to revoke access for ${providerName}?`,
      () => handleWhitelistProvider(license, false)
    );
  };

  const handleRemoveRecord = (recordId: number, recordTitle: string) => {
    openConfirmationDialog(
      'Remove Record?',
      `Are you sure you want to permanently remove the record "${recordTitle}"?`,
      () => toast.error('Record removal feature not implemented yet.')
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-1">
            Platform management and governance controls
          </p>
        </div>
        <Badge variant="destructive" className="flex items-center space-x-1">
          <Shield className="h-3 w-3" />
          <span>Administrator Access</span>
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{pendingProviders.length}</div>
            <p className="text-xs text-muted-foreground">Providers awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Providers</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{whitelistedProviders.length}</div>
            <p className="text-xs text-muted-foreground">Active verified providers</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Records</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{flaggedRecords.length}</div>
            <p className="text-xs text-muted-foreground">Records requiring review</p>
          </CardContent>
        </Card>

        <Card className="medical-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {listings.filter(l => l.status === 'sold').reduce((sum, l) => sum + (l.currentHighestBid || 0), 0)} MT
            </div>
            <p className="text-xs text-muted-foreground">Total marketplace volume</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
                <CardDescription>Key metrics and system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>System Status</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Active Users</span>
                  <span className="font-medium">{providers.length + 1} users</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Data Integrity</span>
                  <Badge variant="default">100%</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Marketplace Activity</span>
                  <Badge variant="default">High</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="medical-card">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform events</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">New provider registration</p>
                  <p className="text-muted-foreground">Dr. James Wilson - Neurology</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Record flagged for review</p>
                  <p className="text-muted-foreground">Mental Health Assessment</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Marketplace bid accepted</p>
                  <p className="text-muted-foreground">150 MT - Diabetes data</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Provider whitelist updated</p>
                  <p className="text-muted-foreground">Dr. Sarah Kim approved</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          {/* Pending Providers */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-warning" />
                <span>Pending Provider Approvals</span>
              </CardTitle>
              <CardDescription>
                Healthcare providers awaiting verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingProviders.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No pending approvals
                  </p>
                ) : (
                  pendingProviders.map((provider) => (
                    <div key={provider.license} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{provider.name}</h4>
                          <Badge variant="outline">{provider.specialty}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          License: {provider.license} • Reputation: {provider.reputation}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Contact: {provider.contact}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRejectProvider(provider.name)}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => handleWhitelistProvider(provider.license, true)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Verified Providers */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <span>Verified Providers</span>
              </CardTitle>
              <CardDescription>
                Currently approved healthcare providers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {whitelistedProviders.map((provider) => (
                  <div key={provider.license} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{provider.name}</h4>
                        <Badge variant="default">{provider.specialty}</Badge>
                        <Badge variant="outline">Verified</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        License: {provider.license} • Reputation: {provider.reputation}%
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleRevokeProvider(provider.license, provider.name)}
                      >
                        Revoke
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          {/* Flagged Records */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span>Flagged Records</span>
              </CardTitle>
              <CardDescription>
                Health records requiring administrative review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {flaggedRecords.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No flagged records
                  </p>
                ) : (
                  flaggedRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium">{record.title}</h4>
                          <Badge variant="destructive">Flagged</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Category: {record.category} • Created: {new Date(record.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleFlagRecord(record.id, false)}
                        >
                          Unflag
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => handleRemoveRecord(record.id, record.title)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Monetization Control */}
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-success" />
                <span>Monetization Control</span>
              </CardTitle>
              <CardDescription>
                Manage which records can be monetized
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monetizableRecords.slice(0, 5).map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{record.title}</h4>
                        <Badge variant="default">Monetizable</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Category: {record.category} • Access count: {record.accessCount}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={record.status === 'Monetizable'}
                        onCheckedChange={(checked) => handleFlagRecord(record.id, !checked)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <ConfirmationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={dialogConfig.title}
        description={dialogConfig.description}
        onConfirm={dialogConfig.onConfirm}
      />
    </div>
  );
};

export default AdminPanel;