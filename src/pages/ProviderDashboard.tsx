import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MedicalRecordCard } from "@/components/MedicalRecordCard";
import { PermissionControl } from "@/components/PermissionControl";
import { useToast } from "@/components/ui/use-toast";
import {
  Stethoscope,
  Users,
  Calendar,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Phone,
  Mail,
  MapPin,
  Search,
  Filter,
  Eye,
  Edit,
  MessageSquare,
  FileText,
  Pill,
  TestTube,
  Camera,
  Heart,
  Brain,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Star,
  Target,
  BarChart3,
  PieChart,
  Download,
  Share2,
  Settings,
  Bell,
  Video,
  UserPlus,
  Calendar as CalendarIcon,
  Zap,
  RefreshCw,
  LogOut,
  User,
  ChevronDown,
  Copy,
  Check,
  Loader2,
  Plus,
  Trash2,
  ArrowLeft
} from "lucide-react";
import {
  mockProviderPatients,
  mockProviderAppointments,
  mockDataAccessRequests,
  mockClinicalAlerts,
  mockRevenueMetrics,
  mockPopulationHealthMetrics,
  mockDataQualityMetrics,
  getTodaysAppointments,
  getPendingRequests,
  getUnreadAlerts,
  getCriticalPatients,
  getHighValuePatients,
  calculateTotalMonthlyRevenue,
  type ProviderPatient,
  type ProviderAppointment,
  type DataAccessRequest,
  type ClinicalAlert
} from "@/lib/provider-dashboard-data";
import { mockPatients, mockProviders, Patient } from "@/lib/mock-data";
import { mockProviderSpending } from "@/lib/monetization-data";

interface ProviderDashboardProps {
  providerId?: string;
}

export default function ProviderDashboard({ providerId = 'p1' }: ProviderDashboardProps) {
  const [selectedPatient, setSelectedPatient] = useState<ProviderPatient | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ClinicalAlert | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock interaction states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [patients, setPatients] = useState(mockProviderPatients);
  const [appointments, setAppointments] = useState(mockProviderAppointments);
  const [alerts, setAlerts] = useState(mockClinicalAlerts);
  const [requests, setRequests] = useState(mockDataAccessRequests);

  // Dev toggle for empty states
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAllAlertsDialog, setShowAllAlertsDialog] = useState(false);
  const [showRequestDetailsDialog, setShowRequestDetailsDialog] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<DataAccessRequest | null>(null);
  const [newPatientForm, setNewPatientForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  });

  const { toast } = useToast();

  // Mock interaction handlers
  const handleLoading = (key: string, duration = 1500) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, duration);
  };

  const mockAddPatient = () => {
    if (!newPatientForm.firstName || !newPatientForm.lastName || !newPatientForm.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    handleLoading('addPatient');
    setTimeout(() => {
      const newPatient: ProviderPatient = {
        id: `patient-${Date.now()}`,
        firstName: newPatientForm.firstName,
        lastName: newPatientForm.lastName,
        dateOfBirth: newPatientForm.dateOfBirth,
        gender: 'other',
        contactInfo: {
          phone: newPatientForm.phone,
          email: newPatientForm.email,
          address: '123 New Patient St, City, ST 12345'
        },
        insurance: {
          provider: 'New Insurance Co',
          policyNumber: 'NEW-123456789',
          isPrimary: true
        },
        medicalInfo: {
          conditions: [],
          allergies: [],
          medications: [],
          lastVisit: new Date().toISOString().split('T')[0],
          riskLevel: 'low',
          chronicConditions: 0,
          emergencyContact: 'Emergency Contact'
        },
        dataSharing: {
          permissionsGranted: ['basic_info'],
          monetizationEnabled: false,
          dataQualityScore: 85,
          lastDataUpdate: new Date().toISOString(),
          totalRecords: 0,
          sharedRecords: 0
        },
        financials: {
          totalRevenue: 0,
          monthlyRevenue: 0,
          dataValue: 0,
          lastPayout: new Date().toISOString().split('T')[0]
        },
        engagement: {
          lastLogin: new Date().toISOString(),
          appUsageScore: 75,
          complianceRate: 90,
          responseRate: 85
        }
      };

      setPatients(prev => [...prev, newPatient]);
      setNewPatientForm({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '' });
      setShowAddPatientDialog(false);
      toast({
        title: "Patient Added",
        description: `${newPatient.firstName} ${newPatient.lastName} has been added to your roster`
      });
    }, 1500);
  };

  const mockMessagePatient = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId);
    handleLoading(`message-${patientId}`);
    setTimeout(() => {
      toast({
        title: "Message Sent",
        description: `Secure message sent to ${patient?.firstName} ${patient?.lastName}`
      });
    }, 1000);
  };

  const mockApproveRequest = (requestId: string) => {
    handleLoading(`approve-${requestId}`);
    setTimeout(() => {
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'approved' as const } : req
      ));
      const request = requests.find(r => r.id === requestId);
      toast({
        title: "Request Approved",
        description: `Data access approved for ${request?.patientName}`
      });
    }, 1200);
  };

  const mockDenyRequest = (requestId: string) => {
    handleLoading(`deny-${requestId}`);
    setTimeout(() => {
      setRequests(prev => prev.map(req =>
        req.id === requestId ? { ...req, status: 'denied' as const } : req
      ));
      const request = requests.find(r => r.id === requestId);
      toast({
        title: "Request Denied",
        description: `Data access denied for ${request?.patientName}`
      });
    }, 1200);
  };

  const mockMarkAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    toast({
      title: "Alert Marked as Read",
      description: "Alert has been acknowledged"
    });
  };

  const mockTakeAction = (alertId: string) => {
    handleLoading(`action-${alertId}`);
    setTimeout(() => {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? {
          ...alert,
          isRead: true,
          actionTaken: 'Provider action completed',
          resolvedAt: new Date().toISOString()
        } : alert
      ));
      const alert = alerts.find(a => a.id === alertId);
      toast({
        title: "Action Completed",
        description: `Action taken for ${alert?.patientName}`
      });
    }, 2000);
  };

  const mockEditAppointment = (appointmentId: string) => {
    handleLoading(`edit-${appointmentId}`);
    setTimeout(() => {
      const appointment = appointments.find(a => a.id === appointmentId);
      toast({
        title: "Appointment Updated",
        description: `Appointment for ${appointment?.patientName} has been updated`
      });
    }, 1000);
  };

  const mockStartTelehealth = (appointmentId: string) => {
    handleLoading(`telehealth-${appointmentId}`);
    setTimeout(() => {
      setAppointments(prev => prev.map(apt =>
        apt.id === appointmentId ? { ...apt, status: 'in-progress' as const } : apt
      ));
      const appointment = appointments.find(a => a.id === appointmentId);
      toast({
        title: "Telehealth Started",
        description: `Video consultation started with ${appointment?.patientName}`
      });
    }, 1500);
  };

  const mockExportReport = () => {
    handleLoading('export');
    setTimeout(() => {
      toast({
        title: "Report Exported",
        description: "Provider dashboard report has been downloaded"
      });
    }, 2000);
  };

  const mockRefreshData = () => {
    handleLoading('refresh');
    setTimeout(() => {
      // Simulate data refresh by updating timestamps
      setPatients(prev => prev.map(p => ({
        ...p,
        dataSharing: {
          ...p.dataSharing,
          lastDataUpdate: new Date().toISOString()
        }
      })));
      toast({
        title: "Data Refreshed",
        description: "All patient data has been synchronized"
      });
    }, 2500);
  };

  const mockCallPatient = (phone: string, patientName: string) => {
    handleLoading(`call-${phone}`);
    setTimeout(() => {
      toast({
        title: "Call Initiated",
        description: `Calling ${patientName} at ${phone}`
      });
    }, 800);
  };

  /**
   * Dev function to toggle between empty and populated states
   */
  const toggleEmptyState = () => {
    if (isEmptyState) {
      // Load populated data
      setPatients(mockProviderPatients);
      setAppointments(mockProviderAppointments);
      setAlerts(mockClinicalAlerts);
      setRequests(mockDataAccessRequests);
      setIsEmptyState(false);
    } else {
      // Reset to empty state
      setPatients([]);
      setAppointments([]);
      setAlerts([]);
      setRequests([]);
      setIsEmptyState(true);
    }
  };

  /**
   * Opens the filter dialog for patient/appointment filtering
   */
  const mockOpenFilterDialog = () => {
    setShowFilterDialog(true);
    toast({
      title: "Filter Options",
      description: "Advanced filtering options are now available"
    });
  };

  /**
   * Opens the all alerts dialog to view complete alert list
   */
  const mockViewAllAlerts = () => {
    setShowAllAlertsDialog(true);
    toast({
      title: "All Alerts",
      description: `Viewing all ${unreadAlerts.length} clinical alerts`
    });
  };

  /**
   * Opens request details dialog for a specific data access request
   */
  const mockViewRequestDetails = (request: DataAccessRequest) => {
    setSelectedRequestDetails(request);
    setShowRequestDetailsDialog(true);
    toast({
      title: "Request Details",
      description: `Viewing details for ${request.patientName}'s data request`
    });
  };

  /**
   * Opens appointment details dialog for a specific appointment
   */
  const mockViewAppointmentDetails = (appointment: ProviderAppointment) => {
    setSelectedAppointmentDetails(appointment);
    setShowAppointmentDetailsDialog(true);
    toast({
      title: "Appointment Details",
      description: `Viewing details for ${appointment.patientName}'s appointment`
    });
  };

  const todaysAppointments = getTodaysAppointments();
  const pendingRequests = getPendingRequests();
  const unreadAlerts = getUnreadAlerts();
  const criticalPatients = getCriticalPatients();
  const highValuePatients = getHighValuePatients();
  const monthlyRevenue = calculateTotalMonthlyRevenue();

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Stethoscope className="h-8 w-8 text-medical-primary" />
              Provider Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your patient roster, clinical workflows, and data monetization
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isEmptyState ? "default" : "secondary"}
              size="sm"
              onClick={toggleEmptyState}
            >
              {isEmptyState ? "Load Sample Data" : "Show Empty State"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={mockExportReport}
              disabled={loadingStates.export}
            >
              {loadingStates.export ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Export Report
            </Button>
            <Button
              size="sm"
              onClick={() => setShowAddPatientDialog(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Patient
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={mockRefreshData}
              disabled={loadingStates.refresh}
            >
              {loadingStates.refresh ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-bold">{mockProviderPatients.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Today's Appointments</p>
                  <p className="text-2xl font-bold">{todaysAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(monthlyRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{unreadAlerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                  <p className="text-2xl font-bold text-green-600">{mockDataQualityMetrics.overallScore}%</p>
                </div>
                <Target className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patient Roster</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="requests">Access Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Data Storage & AI Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Data Storage & AI Insights
                  </CardTitle>
                  <CardDescription>
                    Patient data storage and AI inference capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">
                          {mockProviderPatients.reduce((sum, p) => sum + p.dataSharing.totalRecords, 0)}
                        </div>
                        <div className="text-sm text-muted-foreground">Total Records Stored</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {mockProviderPatients.filter(p => p.dataSharing.dataQualityScore > 85).length}
                        </div>
                        <div className="text-sm text-muted-foreground">AI-Ready Datasets</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm p-2 bg-green-50 rounded">
                        <span>✓ Data encryption active</span>
                        <Badge className="bg-green-100 text-green-800">Secure</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 bg-blue-50 rounded">
                        <span>🤖 AI inference engine ready</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm p-2 bg-purple-50 rounded">
                        <span>📊 Patient consent tracking</span>
                        <Badge className="bg-purple-100 text-purple-800">Monitored</Badge>
                      </div>
                    </div>

                    <Button className="w-full" variant="outline">
                      <Target className="h-4 w-4 mr-2" />
                      Run AI Analysis
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications & Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications & Alerts
                  </CardTitle>
                  <CardDescription>
                    Monitor critical alerts and system notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-xl font-bold text-red-600">{unreadAlerts.length}</div>
                        <div className="text-sm text-muted-foreground">Unread Alerts</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-xl font-bold text-orange-600">{criticalPatients.length}</div>
                        <div className="text-sm text-muted-foreground">Critical Patients</div>
                      </div>
                    </div>

                    {unreadAlerts.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Recent Alerts</h4>
                        {unreadAlerts.slice(0, 2).map((alert) => (
                          <div key={alert.id} className="flex items-center justify-between text-xs p-2 bg-red-50 rounded border">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-red-600" />
                              <span className="truncate">{alert.title}</span>
                            </div>
                            <Badge className="bg-red-100 text-red-800 text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => window.location.href = '/notifications'}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      View All Notifications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Revenue Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Total Revenue</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(mockRevenueMetrics.totalRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Data Monetization</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(mockRevenueMetrics.dataMonetizationRevenue)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium">Clinical Services</span>
                      <span className="text-lg font-bold text-purple-600">
                        {formatCurrency(mockRevenueMetrics.clinicalServiceRevenue)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Population Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Risk Distribution</span>
                      </div>
                      <div className="space-y-2">
                        {Object.entries(mockPopulationHealthMetrics.riskDistribution).map(([level, count]) => {
                          const percentage = (count / mockPopulationHealthMetrics.totalPatients) * 100;
                          return (
                            <div key={level}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs capitalize">{level} Risk</span>
                                <span className="text-xs">{count} patients</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Quality Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Data Quality Score</span>
                        <span className="text-sm font-bold text-green-600">
                          {mockDataQualityMetrics.overallScore}%
                        </span>
                      </div>
                      <Progress value={mockDataQualityMetrics.overallScore} className="h-2" />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Completeness</span>
                        <span className="text-xs">{mockDataQualityMetrics.completenessScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Accuracy</span>
                        <span className="text-xs">{mockDataQualityMetrics.accuracyScore}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Timeliness</span>
                        <span className="text-xs">{mockDataQualityMetrics.timelinessScore}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline" onClick={mockOpenFilterDialog}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Patient Roster - Compact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockProviderPatients
                .filter(patient =>
                  searchQuery === '' ||
                  `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  patient.medicalInfo.conditions.some(condition =>
                    condition.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                )
                .map((patient) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={patient.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold truncate">{patient.firstName} {patient.lastName}</h3>
                              <p className="text-sm text-muted-foreground">
                                Age {calculateAge(patient.dateOfBirth)} • {patient.gender}
                              </p>
                            </div>
                            <Badge className={getRiskLevelColor(patient.medicalInfo.riskLevel)} size="sm">
                              {patient.medicalInfo.riskLevel.charAt(0).toUpperCase()}
                            </Badge>
                          </div>

                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Records:</span>
                              <span className="font-medium">{patient.dataSharing.totalRecords}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Quality:</span>
                              <span className="font-medium text-green-600">{patient.dataSharing.dataQualityScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Revenue:</span>
                              <span className="font-medium text-green-600">
                                {formatCurrency(patient.financials.monthlyRevenue)}
                              </span>
                            </div>
                          </div>

                          {/* Quick indicators */}
                          <div className="flex items-center gap-1 mt-2">
                            {patient.dataSharing.monetizationEnabled && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                Monetized
                              </Badge>
                            )}
                            {patient.medicalInfo.chronicConditions > 0 && (
                              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                                {patient.medicalInfo.chronicConditions} Chronic
                              </Badge>
                            )}
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1 mt-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                mockMessagePatient(patient.id);
                              }}
                              disabled={loadingStates[`message-${patient.id}`]}
                            >
                              {loadingStates[`message-${patient.id}`] ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <MessageSquare className="h-3 w-3 mr-1" />
                              )}
                              Message
                            </Button>
                            <Button
                              size="sm"
                              className="flex-1 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedPatient(patient);
                              }}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Population Health Analytics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Population Health Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Chronic Condition Prevalence</h4>
                      {mockPopulationHealthMetrics.chronicConditionPrevalence.map((condition) => (
                        <div key={condition.condition} className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm">{condition.condition}</span>
                            <span className="text-sm font-medium">{condition.percentage}%</span>
                          </div>
                          <Progress value={condition.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Outcome Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Clinical Outcomes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPopulationHealthMetrics.outcomeMetrics.map((metric) => (
                      <div key={metric.metric} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{metric.metric}</h4>
                          <div className="flex items-center gap-2">
                            {metric.trend === 'improving' ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : metric.trend === 'declining' ? (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            ) : (
                              <Activity className="h-4 w-4 text-gray-600" />
                            )}
                            <span className={`text-sm font-medium ${metric.trend === 'improving' ? 'text-green-600' :
                              metric.trend === 'declining' ? 'text-red-600' :
                                'text-gray-600'
                              }`}>
                              {metric.trend}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Current</span>
                          <span className="text-sm font-medium">{metric.value}%</span>
                        </div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-muted-foreground">Benchmark</span>
                          <span className="text-sm">{metric.benchmark}%</span>
                        </div>
                        <Progress value={metric.value} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Rates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Patient Compliance Rates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {mockPopulationHealthMetrics.complianceRates.medication}%
                    </div>
                    <div className="text-sm text-muted-foreground">Medication Adherence</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {mockPopulationHealthMetrics.complianceRates.appointments}%
                    </div>
                    <div className="text-sm text-muted-foreground">Appointment Attendance</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 mb-1">
                      {mockPopulationHealthMetrics.complianceRates.screenings}%
                    </div>
                    <div className="text-sm text-muted-foreground">Preventive Screenings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Access Requests
                </CardTitle>
                <CardDescription>
                  Manage patient data access requests and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDataAccessRequests.map((request) => (
                    <Card key={request.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold">{request.patientName}</h3>
                            <p className="text-sm text-muted-foreground capitalize">
                              {request.requestType.replace('_', ' ')} • {request.urgency} priority
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Requested: {formatDateTime(request.requestDate)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={
                              request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                request.status === 'denied' ? 'bg-red-100 text-red-800' :
                                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                            }>
                              {request.status.toUpperCase()}
                            </Badge>
                            <Badge className={
                              request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                                request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                  request.urgency === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                            }>
                              {request.urgency.toUpperCase()}
                            </Badge>
                          </div>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Reason:</p>
                          <p className="text-sm text-muted-foreground">{request.reason}</p>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm font-medium mb-1">Requested Data:</p>
                          <div className="flex flex-wrap gap-1">
                            {request.requestedData.map((data) => (
                              <Badge key={data} variant="outline" className="text-xs">
                                {data.replace('_', ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            {request.monetizationImpact > 0 && (
                              <>
                                <span className="text-muted-foreground">Revenue Impact: </span>
                                <span className="font-medium text-green-600">
                                  {formatCurrency(request.monetizationImpact)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => mockDenyRequest(request.id)}
                                  disabled={loadingStates[`deny-${request.id}`]}
                                >
                                  {loadingStates[`deny-${request.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Deny'
                                  )}
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => mockApproveRequest(request.id)}
                                  disabled={loadingStates[`approve-${request.id}`]}
                                >
                                  {loadingStates[`approve-${request.id}`] ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    'Approve'
                                  )}
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => mockViewRequestDetails(request)}>
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient Details Full Page */}
        {selectedPatient && (
          <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
            <div className="min-h-screen">
              {/* Header with Back Button */}
              <div className="sticky top-0 z-10 bg-background border-b">
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedPatient(null)}
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Patient Roster
                    </Button>
                    <div className="h-6 w-px bg-border" />
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={selectedPatient.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                          {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-lg font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                        <p className="text-sm text-muted-foreground">
                          Age {calculateAge(selectedPatient.dateOfBirth)} • {selectedPatient.gender} • ID: {selectedPatient.id}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getRiskLevelColor(selectedPatient.medicalInfo.riskLevel)}>
                      {selectedPatient.medicalInfo.riskLevel.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mockCallPatient(selectedPatient.contactInfo.phone, `${selectedPatient.firstName} ${selectedPatient.lastName}`)}
                      disabled={loadingStates[`call-${selectedPatient.contactInfo.phone}`]}
                    >
                      {loadingStates[`call-${selectedPatient.contactInfo.phone}`] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mockMessagePatient(selectedPatient.id)}
                      disabled={loadingStates[`message-${selectedPatient.id}`]}
                    >
                      {loadingStates[`message-${selectedPatient.id}`] ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-1" />
                      )}
                      Message
                    </Button>
                  </div>
                </div>
              </div>

              {/* Patient Details Content */}
              <div className="p-6 max-w-7xl mx-auto">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="medical">Medical History</TabsTrigger>
                    <TabsTrigger value="data">Data & Analytics</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date of Birth:</span>
                              <p className="font-medium">{selectedPatient.dateOfBirth}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gender:</span>
                              <p className="font-medium capitalize">{selectedPatient.gender}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <p className="font-medium">{selectedPatient.contactInfo.phone}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <p className="font-medium">{selectedPatient.contactInfo.email}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Address:</span>
                            <p className="font-medium">{selectedPatient.contactInfo.address}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Insurance Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Insurance Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <p className="font-medium">{selectedPatient.insurance.provider}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Policy Number:</span>
                              <p className="font-medium">{selectedPatient.insurance.policyNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Primary:</span>
                              <p className="font-medium">{selectedPatient.insurance.isPrimary ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{selectedPatient.dataSharing.totalRecords}</div>
                          <div className="text-sm text-muted-foreground">Total Records</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{selectedPatient.dataSharing.dataQualityScore}%</div>
                          <div className="text-sm text-muted-foreground">Data Quality</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{selectedPatient.medicalInfo.chronicConditions}</div>
                          <div className="text-sm text-muted-foreground">Chronic Conditions</div>
                        </div>
                      </Card>
                      <Card className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{selectedPatient.engagement.complianceRate}%</div>
                          <div className="text-sm text-muted-foreground">Compliance Rate</div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Medical Conditions */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Medical Conditions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.medicalInfo.conditions.map((condition) => (
                              <Badge key={condition} variant="outline">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Allergies */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Allergies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.medicalInfo.allergies.map((allergy) => (
                              <Badge key={allergy} variant="outline" className="bg-red-50 text-red-700">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Current Medications */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Current Medications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {selectedPatient.medicalInfo.medications.map((medication) => (
                              <Badge key={medication} variant="outline" className="bg-blue-50 text-blue-700">
                                {medication}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Emergency Contact */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium">{selectedPatient.medicalInfo.emergencyContact}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Data Quality Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600 mb-2">
                            {selectedPatient.dataSharing.dataQualityScore}%
                          </div>
                          <Progress value={selectedPatient.dataSharing.dataQualityScore} className="h-2" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Data Sharing</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Records:</span>
                              <span className="font-medium">{selectedPatient.dataSharing.totalRecords}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shared Records:</span>
                              <span className="font-medium">{selectedPatient.dataSharing.sharedRecords}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monetization:</span>
                              <Badge className={selectedPatient.dataSharing.monetizationEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {selectedPatient.dataSharing.monetizationEnabled ? 'Enabled' : 'Disabled'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Engagement Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>App Usage:</span>
                              <span className="font-medium">{selectedPatient.engagement.appUsageScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Compliance:</span>
                              <span className="font-medium">{selectedPatient.engagement.complianceRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Response Rate:</span>
                              <span className="font-medium">{selectedPatient.engagement.responseRate}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="permissions" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Data Access Permissions</CardTitle>
                        <CardDescription>
                          Permissions granted by this patient for data access
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedPatient.dataSharing.permissionsGranted.map((permission) => (
                            <div key={permission} className="flex items-center justify-between p-3 border rounded-lg">
                              <span className="capitalize">{permission.replace('_', ' ')}</span>
                              <Badge className="bg-green-100 text-green-800">Granted</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="revenue" className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle>Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(selectedPatient.financials.monthlyRevenue)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(selectedPatient.financials.totalRevenue)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>Data Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-blue-600">
                            {formatCurrency(selectedPatient.financials.dataValue)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Patient Details Modal */}
        {selectedPatient && (
          <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={selectedPatient.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                      {selectedPatient.firstName.charAt(0)}{selectedPatient.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</h2>
                    <p className="text-sm text-muted-foreground">
                      Age {calculateAge(selectedPatient.dateOfBirth)} • {selectedPatient.gender} • ID: {selectedPatient.id}
                    </p>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Badge className={getRiskLevelColor(selectedPatient.medicalInfo.riskLevel)}>
                      {selectedPatient.medicalInfo.riskLevel.toUpperCase()}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mockCallPatient(selectedPatient.contactInfo.phone, `${selectedPatient.firstName} ${selectedPatient.lastName}`)}
                      disabled={loadingStates[`call-${selectedPatient.contactInfo.phone}`]}
                    >
                      {loadingStates[`call-${selectedPatient.contactInfo.phone}`] ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Phone className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => mockMessagePatient(selectedPatient.id)}
                      disabled={loadingStates[`message-${selectedPatient.id}`]}
                    >
                      {loadingStates[`message-${selectedPatient.id}`] ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-1" />
                      )}
                      Message
                    </Button>
                  </div>
                </DialogTitle>
              </DialogHeader>
              
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                <Tabs defaultValue="overview" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="medical">Medical</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                    <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    <TabsTrigger value="revenue">Revenue</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Personal Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Personal Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Date of Birth:</span>
                              <p className="font-medium">{selectedPatient.dateOfBirth}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gender:</span>
                              <p className="font-medium capitalize">{selectedPatient.gender}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone:</span>
                              <p className="font-medium">{selectedPatient.contactInfo.phone}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <p className="font-medium text-xs">{selectedPatient.contactInfo.email}</p>
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground text-sm">Address:</span>
                            <p className="font-medium text-sm">{selectedPatient.contactInfo.address}</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Insurance Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Insurance</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-muted-foreground">Provider:</span>
                              <p className="font-medium">{selectedPatient.insurance.provider}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Policy:</span>
                              <p className="font-medium text-xs">{selectedPatient.insurance.policyNumber}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Primary:</span>
                              <p className="font-medium">{selectedPatient.insurance.isPrimary ? 'Yes' : 'No'}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Card className="p-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-blue-600">{selectedPatient.dataSharing.totalRecords}</div>
                          <div className="text-xs text-muted-foreground">Total Records</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-600">{selectedPatient.dataSharing.dataQualityScore}%</div>
                          <div className="text-xs text-muted-foreground">Data Quality</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-600">{selectedPatient.medicalInfo.chronicConditions}</div>
                          <div className="text-xs text-muted-foreground">Chronic Conditions</div>
                        </div>
                      </Card>
                      <Card className="p-3">
                        <div className="text-center">
                          <div className="text-xl font-bold text-orange-600">{selectedPatient.engagement.complianceRate}%</div>
                          <div className="text-xs text-muted-foreground">Compliance</div>
                        </div>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="medical" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Medical Conditions */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Medical Conditions</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedPatient.medicalInfo.conditions.map((condition) => (
                              <Badge key={condition} variant="outline" className="text-xs">
                                {condition}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Allergies */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Allergies</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedPatient.medicalInfo.allergies.map((allergy) => (
                              <Badge key={allergy} variant="outline" className="text-xs bg-red-50 text-red-700">
                                {allergy}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Current Medications */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Current Medications</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-1">
                            {selectedPatient.medicalInfo.medications.map((medication) => (
                              <Badge key={medication} variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                {medication}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Emergency Contact */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Emergency Contact</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-medium text-sm">{selectedPatient.medicalInfo.emergencyContact}</p>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="data" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Data Quality</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600 mb-2">
                            {selectedPatient.dataSharing.dataQualityScore}%
                          </div>
                          <Progress value={selectedPatient.dataSharing.dataQualityScore} className="h-2" />
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Data Sharing</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total Records:</span>
                              <span className="font-medium">{selectedPatient.dataSharing.totalRecords}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Shared:</span>
                              <span className="font-medium">{selectedPatient.dataSharing.sharedRecords}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monetization:</span>
                              <Badge className={selectedPatient.dataSharing.monetizationEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'} size="sm">
                                {selectedPatient.dataSharing.monetizationEnabled ? 'On' : 'Off'}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Engagement</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>App Usage:</span>
                              <span className="font-medium">{selectedPatient.engagement.appUsageScore}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Compliance:</span>
                              <span className="font-medium">{selectedPatient.engagement.complianceRate}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Response Rate:</span>
                              <span className="font-medium">{selectedPatient.engagement.responseRate}%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="permissions" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Data Access Permissions</CardTitle>
                        <CardDescription>
                          Permissions granted by this patient
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedPatient.dataSharing.permissionsGranted.map((permission) => (
                            <div key={permission} className="flex items-center justify-between p-2 border rounded text-sm">
                              <span className="capitalize">{permission.replace('_', ' ')}</span>
                              <Badge className="bg-green-100 text-green-800" size="sm">Granted</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="revenue" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Monthly Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedPatient.financials.monthlyRevenue)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-green-600">
                            {formatCurrency(selectedPatient.financials.totalRevenue)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Data Value</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-blue-600">
                            {formatCurrency(selectedPatient.financials.dataValue)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Add Patient Dialog */}
        <Dialog open={showAddPatientDialog} onOpenChange={setShowAddPatientDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Invite New Patient</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newPatientForm.firstName}
                    onChange={(e) => setNewPatientForm(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newPatientForm.lastName}
                    onChange={(e) => setNewPatientForm(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newPatientForm.email}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john.doe@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newPatientForm.phone}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={newPatientForm.dateOfBirth}
                  onChange={(e) => setNewPatientForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddPatientDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={mockAddPatient}
                  disabled={loadingStates.addPatient}
                >
                  {loadingStates.addPatient ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4 mr-2" />
                  )}
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Filter Dialog */}
        <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter-specialty">Specialty</Label>
                  <select id="filter-specialty" className="w-full p-2 border rounded-md">
                    <option value="">All Specialties</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="psychiatry">Psychiatry</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-risk">Risk Level</Label>
                  <select id="filter-risk" className="w-full p-2 border rounded-md">
                    <option value="">All Risk Levels</option>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter-status">Status</Label>
                  <select id="filter-status" className="w-full p-2 border rounded-md">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-date">Date Range</Label>
                  <select id="filter-date" className="w-full p-2 border rounded-md">
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Filters Applied",
                    description: "Patient list has been filtered based on your criteria"
                  });
                  setShowFilterDialog(false);
                }}>
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* All Alerts Dialog */}
        <Dialog open={showAllAlertsDialog} onOpenChange={setShowAllAlertsDialog}>
          <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                All Clinical Alerts ({unreadAlerts.length})
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`p-4 ${alert.isRead ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={
                            alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-blue-100 text-blue-800'
                          }>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">{alert.category}</Badge>
                          {!alert.isRead && <Badge className="bg-blue-100 text-blue-800">NEW</Badge>}
                        </div>
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Patient: {alert.patientName}</span>
                          <span>Time: {alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {alert.actionRequired && !alert.actionTaken && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => mockTakeAction(alert.id)}
                            disabled={loadingStates[`action-${alert.id}`]}
                          >
                            {loadingStates[`action-${alert.id}`] ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              'Take Action'
                            )}
                          </Button>
                        )}
                        {!alert.isRead && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => mockMarkAlertRead(alert.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setShowAllAlertsDialog(false)}>
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Request Details Dialog */}
        <Dialog open={showRequestDetailsDialog} onOpenChange={setShowRequestDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Access Request Details
              </DialogTitle>
            </DialogHeader>
            {selectedRequestDetails && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Patient Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.patientName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Request Type</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.requestType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={
                      selectedRequestDetails.status === 'approved' ? 'bg-green-100 text-green-800' :
                        selectedRequestDetails.status === 'denied' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                    }>
                      {selectedRequestDetails.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Priority</Label>
                    <Badge className={
                      selectedRequestDetails.priority === 'high' ? 'bg-red-100 text-red-800' :
                        selectedRequestDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                    }>
                      {selectedRequestDetails.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Requested Data</Label>
                  <div className="mt-2 space-y-1">
                    {selectedRequestDetails.requestedData.map((data, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>{data}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedRequestDetails.purpose}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Requested Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.requestDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expiry Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedRequestDetails.expiryDate}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowRequestDetailsDialog(false)}>
                    Close
                  </Button>
                  {selectedRequestDetails.status === 'pending' && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          mockDenyRequest(selectedRequestDetails.id);
                          setShowRequestDetailsDialog(false);
                        }}
                        disabled={loadingStates[`deny-${selectedRequestDetails.id}`]}
                      >
                        {loadingStates[`deny-${selectedRequestDetails.id}`] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          'Deny'
                        )}
                      </Button>
                      <Button
                        onClick={() => {
                          mockApproveRequest(selectedRequestDetails.id);
                          setShowRequestDetailsDialog(false);
                        }}
                        disabled={loadingStates[`approve-${selectedRequestDetails.id}`]}
                      >
                        {loadingStates[`approve-${selectedRequestDetails.id}`] ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          'Approve'
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>


      </div>
    </div>
  );
}
