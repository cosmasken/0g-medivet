import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProviderRecordsQuery, useViewRecordMutation, useProviderPatientRelationship } from '@/hooks/useProviderRecords';
import { useAuthStore } from '@/stores/authStore';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { getProviderPatientRelationships } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
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
  Coins,
  Plus,
  Download,
  Upload,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import ComputeDashboard from '@/components/ComputeDashboard';
import AIAnalysisDisplay from '@/components/AIAnalysisDisplay';

export default function ProviderDashboard() {
  const { currentUser } = useAuthStore();
  const { data: recordsData, isLoading: recordsLoading } = useProviderRecordsQuery();
  const { data: relationshipsData, isLoading: relationshipsLoading } = useQuery({
    queryKey: ['provider-patient-relationships', currentUser?.id],
    queryFn: () => getProviderPatientRelationships(currentUser?.id || ''),
    enabled: !!currentUser?.id && currentUser?.role === 'provider',
  });
  const viewRecordMutation = useViewRecordMutation();

  const handleViewRecord = (recordId: string, patientId: string) => {
    viewRecordMutation.mutate({ recordId, patientId });
  };

  if (recordsLoading || relationshipsLoading) {
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
    activePatients: relationshipsData?.relationships?.length || 0 // Use real relationship count
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
          
          {/* Patient Records Tab */}
          <TabsContent value="shared-records" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Patient Records</h2>
                <p className="text-muted-foreground">
                  Medical records shared with you by your patients
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Shared Records</CardTitle>
                <CardDescription>
                  Records that patients have granted you access to view
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sharedRecords.length > 0 ? (
                  <div className="space-y-4">
                    {sharedRecords.map((permission) => (
                      <div 
                        key={permission.id} 
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{permission.record?.title || 'Medical Record'}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Patient: {permission.patient?.name || 'Unknown'}</span>
                              <span>•</span>
                              <span>{new Date(permission.created_at || Date.now()).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="capitalize">{permission.permission_level || 'view'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => handleViewRecord(permission.record_id, permission.patient_id)}
                            variant="outline" 
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Shared Records</h3>
                    <p className="text-muted-foreground mb-4">
                      You currently don't have access to any patient records.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Patients need to grant you permission to access their medical records.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* AI Analysis Tab */}
          <TabsContent value="ai-compute" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">AI Analysis</h2>
                <p className="text-muted-foreground">
                  AI-powered analysis of patient medical data
                </p>
              </div>
              <Button>
                <Brain className="h-4 w-4 mr-2" />
                New Analysis
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Analyses</CardTitle>
                  <CardDescription>
                    Latest AI-powered medical insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {mockRecentActivity.filter(a => a.type === 'compute').length > 0 ? (
                    <div className="space-y-4">
                      {mockRecentActivity.filter(a => a.type === 'compute').map((analysis) => (
                        <div key={analysis.id} className="p-4 border rounded-lg">
                          <div className="flex items-start gap-3">
                            <Brain className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium">AI Analysis for {analysis.patient}</h4>
                              <p className="text-sm text-muted-foreground">{analysis.time}</p>
                              <div className="mt-2">
                                <Badge variant="secondary">Medical Report</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No Recent Analyses</h3>
                      <p className="text-muted-foreground">
                        Run AI analysis on patient records to get medical insights.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Run New Analysis</CardTitle>
                  <CardDescription>
                    Select a patient record to analyze with AI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Patient Record</label>
                      <select className="w-full p-2 border border-input rounded-md bg-background">
                        <option>Select a record...</option>
                        {sharedRecords.map((permission) => (
                          <option key={permission.id} value={permission.record_id}>
                            {permission.record?.title || 'Medical Record'} - {permission.patient?.name || 'Unknown Patient'}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Analysis Type</label>
                      <select className="w-full p-2 border border-input rounded-md bg-background">
                        <option value="general">General Medical Analysis</option>
                        <option value="radiology">Radiology Analysis</option>
                        <option value="lab">Lab Results Interpretation</option>
                        <option value="cardiology">Cardiology Analysis</option>
                      </select>
                    </div>
                    
                    <Button className="w-full">
                      <Brain className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* If there's an analysis result available, show it */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Analysis Result</CardTitle>
                <CardDescription>
                  AI-generated insights from patient records
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AIAnalysisDisplay 
                  analysis={{
                    analysis: "Based on the provided medical data, the patient shows signs of improved health markers following the prescribed treatment. Key observations include normalized blood pressure readings, improved cholesterol levels, and stable glucose levels. No concerning abnormalities were detected in the recent lab results. Continue monitoring and following the current treatment plan.",
                    confidence: 0.92,
                    timestamp: new Date().toISOString(),
                    isValid: true,
                    jobId: "ai-job-12345",
                    computeTime: 2450
                  }} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* My Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">My Patients</h2>
                <p className="text-muted-foreground">
                  Patients under your care and treatment plans
                </p>
              </div>
              <Button>
                <User className="h-4 w-4 mr-2" />
                Add Patient
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Patients</CardTitle>
                <CardDescription>
                  Patients currently under your care
                </CardDescription>
              </CardHeader>
              <CardContent>
                {relationshipsData?.relationships && relationshipsData.relationships.length > 0 ? (
                  <div className="space-y-4">
                    {relationshipsData.relationships.map((relationship, index) => (
                      <div key={relationship.id || index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">{relationship.patient_name || `Patient ${index + 1}`}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>Patient ID: {relationship.patient_id?.substring(0, 8) || `PT-${1000 + index}`}</span>
                              <span>•</span>
                              <span>Relationship: {relationship.relationship_type || 'Treated'}</span>
                              <span>•</span>
                              <Badge variant="secondary">
                                {relationship.specialty || 'General'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            Records
                          </Button>
                          <Button variant="outline" size="sm">
                            <Heart className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Patients</h3>
                    <p className="text-muted-foreground mb-4">
                      You don't have any patients assigned to you yet.
                    </p>
                    <Button>
                      <User className="h-4 w-4 mr-2" />
                      Add First Patient
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Patient Status</CardTitle>
                  <CardDescription>
                    Distribution of patient conditions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Treatment</span>
                      <span className="text-sm font-medium">4</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 w-2/3"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Follow-up Required</span>
                      <span className="text-sm font-medium">3</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 w-1/2"></div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Stable Monitoring</span>
                      <span className="text-sm font-medium">2</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-1/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Patient Activity</CardTitle>
                  <CardDescription>
                    Latest interactions with your patients
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { patient: 'John Doe', action: 'New record updated', time: '10 min ago' },
                      { patient: 'Jane Smith', action: 'Lab results received', time: '45 min ago' },
                      { patient: 'Robert Johnson', action: 'Appointment scheduled', time: '2 hours ago' },
                      { patient: 'Emily Davis', action: 'Medication updated', time: '1 day ago' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 bg-green-100 rounded-full">
                          <User className="h-3 w-3 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm">{activity.patient}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
