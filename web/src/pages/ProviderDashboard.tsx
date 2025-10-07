import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProviderRecordsQuery, useViewRecordMutation, useProviderPatientRelationship } from '@/hooks/useProviderRecords';
import { useAuthStore } from '@/stores/authStore';
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
  Coins
} from 'lucide-react';
import ComputeDashboard from '@/components/ComputeDashboard';

export default function ProviderDashboard() {
  const { currentUser } = useAuthStore();
  const { data: recordsData, isLoading } = useProviderRecordsQuery();
  const viewRecordMutation = useViewRecordMutation();

  const handleViewRecord = (recordId: string, patientId: string) => {
    viewRecordMutation.mutate({ recordId, patientId });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const sharedRecords = recordsData?.permissions || [];

  // Mock data for quick stats
  const mockStats = {
    sharedRecords: sharedRecords.length,
    aiAnalyses: 5, // mock data
    computeBalance: '0.00',
    activePatients: 8 // mock data
  };

  // Mock recent activity data
  const mockRecentActivity = [
    { id: 1, action: 'Viewed patient record', patient: 'John Doe', time: '2 min ago', type: 'view' },
    { id: 2, action: 'Submitted AI analysis', patient: 'Jane Smith', time: '15 min ago', type: 'compute' },
    { id: 3, action: 'Received new record share', patient: 'Robert Johnson', time: '1 hour ago', type: 'share' },
    { id: 4, action: 'Updated patient profile', patient: 'Emily Davis', time: '3 hours ago', type: 'update' }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="h-8 w-8 text-medical-primary" />
              Provider Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage patient records and AI analysis tools
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <User className="h-4 w-4 mr-2" />
              My Profile
            </Button>
            <Button size="sm">
              <Shield className="h-4 w-4 mr-2" />
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
              <div className="text-2xl font-bold text-blue-600">{mockStats.sharedRecords}</div>
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
              <div className="text-2xl font-bold text-purple-600">{mockStats.aiAnalyses}</div>
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
              <div className="text-2xl font-bold text-green-600">{mockStats.computeBalance} OG</div>
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
              <div className="text-2xl font-bold text-indigo-600">{mockStats.activePatients}</div>
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
                    {mockRecentActivity.map((activity) => (
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
        </Tabs>
      </div>
    </div>
  )
}
