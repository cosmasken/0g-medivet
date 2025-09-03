import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from '@/components/FileUpload';
import { AddProviderModal } from '@/components/AddProviderModal';
import { ProviderSearch } from '@/components/ProviderSearch';
import { useProviderStore } from '@/stores/providerStore';
import { useWallet } from '@/hooks/useWallet';
import { useAuthStore } from '@/stores/authStore';
import { Upload, Users, UserPlus, FileText, DollarSign, Brain, Shield } from 'lucide-react';

export default function PatientDashboard() {
  const { address } = useWallet();
  const { currentUser } = useAuthStore();
  const { providers } = useProviderStore();
  const [showAddProvider, setShowAddProvider] = useState(false);

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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {currentUser.name || 'Patient'}</p>
        </div>
      </div>

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Medical records uploaded</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Connected Providers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{providers.length}</div>
                <p className="text-xs text-muted-foreground">Healthcare providers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4 GB</div>
                <p className="text-xs text-muted-foreground">On 0G Network</p>
              </CardContent>
            </Card>
          </div>

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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Medical Files</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>No medical records found.</p>
                <p className="text-sm">Upload your first medical file to get started.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="providers" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Healthcare Providers</h3>
            <Button onClick={() => setShowAddProvider(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Provider
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Provider Management</CardTitle>
            </CardHeader>
            <CardContent>
              <ProviderSearch />
            </CardContent>
          </Card>

          {providers.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">View Only</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4" />
                <p>Monetization features coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4" />
                <p>AI insights will appear here after uploading medical files.</p>
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
  );
}
