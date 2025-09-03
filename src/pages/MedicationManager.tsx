import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MapPin,
  Phone,
  Bell,
  Plus,
  Search,
  Filter,
  Download,
  Share2,
  Settings,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Zap,
  Heart,
  Brain,
  Thermometer,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  ExternalLink,
  Info,
  X,
  Check
} from "lucide-react";
import {
  mockMedications,
  mockMedicationReminders,
  mockDrugInteractions,
  mockPharmacies,
  mockAdherenceRecords,
  mockMedicationAlerts,
  calculateAdherenceRate,
  getOverallAdherenceRate,
  getUpcomingReminders,
  type Medication,
  type MedicationReminder,
  type DrugInteraction,
  type Pharmacy,
  type AdherenceRecord,
  type MedicationAlert
} from "@/lib/medication-data";

interface MedicationManagerProps {
  patientId?: string;
}

export default function MedicationManager({ patientId = '1' }: MedicationManagerProps) {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [showAddMedication, setShowAddMedication] = useState(false);
  const [showInteractionDetails, setShowInteractionDetails] = useState<DrugInteraction | null>(null);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showFilterDialog, setShowFilterDialog] = useState(false);
  const [showAllAlertsDialog, setShowAllAlertsDialog] = useState(false);
  const [showMedicationDetailsDialog, setShowMedicationDetailsDialog] = useState(false);
  const [showEditMedicationDialog, setShowEditMedicationDialog] = useState(false);
  const [showPharmacyDetailsDialog, setShowPharmacyDetailsDialog] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null);
  
  // Dev toggle for empty states
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [medications, setMedications] = useState(mockMedications);
  const [medicationAlerts, setMedicationAlerts] = useState(mockMedicationAlerts);

  const activeMedications = medications.filter(med => med.isActive);
  const overallAdherence = getOverallAdherenceRate();
  const upcomingReminders = getUpcomingReminders();
  const unreadAlerts = medicationAlerts.filter(alert => !alert.isRead);

  /**
   * Dev function to toggle between empty and populated states
   */
  const toggleEmptyState = () => {
    if (isEmptyState) {
      // Load populated data
      setMedications(mockMedications);
      setMedicationAlerts(mockMedicationAlerts);
      setIsEmptyState(false);
    } else {
      // Reset to empty state
      setMedications([]);
      setMedicationAlerts([]);
      setIsEmptyState(true);
    }
  };

  const getMedicationIcon = (category: string) => {
    switch (category) {
      case 'cardiovascular': return <Heart className="h-5 w-5 text-red-600" />;
      case 'diabetes': return <Activity className="h-5 w-5 text-blue-600" />;
      case 'pain': return <Zap className="h-5 w-5 text-orange-600" />;
      case 'mental_health': return <Brain className="h-5 w-5 text-purple-600" />;
      case 'allergy': return <Shield className="h-5 w-5 text-green-600" />;
      default: return <Pill className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'major': return 'text-red-600 bg-red-100 border-red-200';
      case 'moderate': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'minor': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  /**
   * Opens the export dialog for medication reports
   */
  const mockOpenExportDialog = () => {
    setShowExportDialog(true);
  };

  /**
   * Opens the filter dialog for medication filtering
   */
  const mockOpenFilterDialog = () => {
    setShowFilterDialog(true);
  };

  /**
   * Opens the all alerts dialog to view complete alert list
   */
  const mockViewAllAlerts = () => {
    setShowAllAlertsDialog(true);
  };

  /**
   * Opens medication details dialog for a specific medication
   */
  const mockViewMedicationDetails = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowMedicationDetailsDialog(true);
  };

  /**
   * Opens edit medication dialog for a specific medication
   */
  const mockEditMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowEditMedicationDialog(true);
  };

  /**
   * Opens pharmacy details dialog for a specific pharmacy
   */
  const mockViewPharmacyDetails = (pharmacy: Pharmacy) => {
    setSelectedPharmacy(pharmacy);
    setShowPharmacyDetailsDialog(true);
  };

  /**
   * Mock function to handle medication actions
   */
  const mockTakeAction = (alertId: string) => {
    console.log(`Taking action for alert: ${alertId}`);
  };

  /**
   * Mock function to mark medication as taken
   */
  const mockMarkAsTaken = (medicationId: string) => {
    console.log(`Marking medication as taken: ${medicationId}`);
  };

  /**
   * Mock function to call pharmacy
   */
  const mockCallPharmacy = (phone: string, name: string) => {
    console.log(`Calling ${name} at ${phone}`);
  };

  /**
   * Mock function to get directions to pharmacy
   */
  const mockGetDirections = (address: string, name: string) => {
    console.log(`Getting directions to ${name} at ${address}`);
  };

  /**
   * Mock function to set preferred pharmacy
   */
  const mockSetPreferredPharmacy = (pharmacyId: string) => {
    console.log(`Setting pharmacy as preferred: ${pharmacyId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Pill className="h-8 w-8 text-medical-primary" />
              Medication Manager
            </h1>
            <p className="text-muted-foreground">
              Manage prescriptions, track adherence, and monitor drug interactions
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
            <Button variant="outline" size="sm" onClick={mockOpenExportDialog}>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button size="sm" onClick={() => setShowAddMedication(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Medications</p>
                  <p className="text-2xl font-bold">{activeMedications.length}</p>
                </div>
                <Pill className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adherence Rate</p>
                  <p className="text-2xl font-bold text-green-600">{overallAdherence}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Reminders</p>
                  <p className="text-2xl font-bold">{upcomingReminders.length}</p>
                </div>
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{unreadAlerts.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="medications">My Medications</TabsTrigger>
            <TabsTrigger value="reminders">Reminders</TabsTrigger>
            <TabsTrigger value="interactions">Drug Interactions</TabsTrigger>
            <TabsTrigger value="pharmacy">Pharmacy</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Alerts Section */}
            {unreadAlerts.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-800">
                    <AlertTriangle className="h-5 w-5" />
                    Medication Alerts ({unreadAlerts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {unreadAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <h4 className="font-medium">{alert.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.actionRequired && (
                            <Button size="sm" variant="outline" onClick={() => mockTakeAction(alert.id)}>
                              Take Action
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {unreadAlerts.length > 3 && (
                      <Button variant="outline" className="w-full" onClick={mockViewAllAlerts}>
                        View All {unreadAlerts.length} Alerts
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Medications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Today's Medications
                </CardTitle>
                <CardDescription>
                  Medications scheduled for today with reminder times
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingReminders.map((reminder) => {
                    const medication = mockMedications.find(m => m.id === reminder.medicationId);
                    if (!medication) return null;
                    
                    return (
                      <div key={reminder.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMedicationIcon(medication.category)}
                          <div>
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {medication.dosage} • {medication.frequency}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatTime(reminder.time)}</span>
                          </div>
                          <Button size="sm" className="mt-2" onClick={() => mockMarkAsTaken(medication.id)}>
                            Mark as Taken
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  {upcomingReminders.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2" />
                      <p>All medications for today have been taken!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Adherence Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Adherence Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeMedications.map((medication) => {
                      const adherenceRate = calculateAdherenceRate(medication.id);
                      return (
                        <div key={medication.id}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{medication.name}</span>
                            <span className="text-sm text-muted-foreground">{adherenceRate}%</span>
                          </div>
                          <Progress value={adherenceRate} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Drug Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockDrugInteractions.map((interaction) => (
                      <div key={interaction.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getSeverityColor(interaction.severity)}>
                            {interaction.severity.toUpperCase()}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setShowInteractionDetails(interaction)}
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-sm font-medium">
                          {interaction.medication1} + {interaction.medication2}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {interaction.description.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search medications..."
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

            {/* Medications List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeMedications.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Pill className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No Active Medications</h3>
                  <p className="text-muted-foreground mb-6">
                    You don't have any active medications yet. Add your first medication to get started.
                  </p>
                  <div className="flex justify-center gap-2">
                    <Button onClick={() => setShowAddMedication(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add First Medication
                    </Button>
                    <Button variant="outline" onClick={toggleEmptyState}>
                      {isEmptyState ? "Load Sample Data" : "Show Empty State"}
                    </Button>
                  </div>
                </div>
              ) : (
                activeMedications
                  .filter(med => 
                    searchQuery === '' || 
                    med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    med.genericName.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((medication) => {
                  const adherenceRate = calculateAdherenceRate(medication.id);
                  return (
                    <Card key={medication.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            {getMedicationIcon(medication.category)}
                            <div>
                              <CardTitle className="text-lg">{medication.name}</CardTitle>
                              <CardDescription>{medication.genericName}</CardDescription>
                            </div>
                          </div>
                          <Badge className={
                            medication.priority === 'critical' ? 'bg-red-100 text-red-800' :
                            medication.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            medication.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {medication.priority.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Dosage:</span>
                              <p className="font-medium">{medication.dosage}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Frequency:</span>
                              <p className="font-medium">{medication.frequency}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Prescribed by:</span>
                              <p className="font-medium">{medication.prescribedBy}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Refills left:</span>
                              <p className="font-medium">{medication.refillsRemaining}</p>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Adherence Rate</span>
                              <span className="text-sm font-medium">{adherenceRate}%</span>
                            </div>
                            <Progress value={adherenceRate} className="h-2" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm">
                              <span className="text-muted-foreground">Cost: </span>
                              <span className="font-medium">{formatCurrency(medication.cost.copay)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => mockEditMedication(medication)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => setSelectedMedication(medication)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>

          <TabsContent value="reminders" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Medication Reminders
                </CardTitle>
                <CardDescription>
                  Manage your medication reminder schedule
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMedicationReminders.map((reminder) => {
                    const medication = mockMedications.find(m => m.id === reminder.medicationId);
                    if (!medication) return null;
                    
                    return (
                      <div key={reminder.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getMedicationIcon(medication.category)}
                          <div>
                            <h4 className="font-medium">{medication.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatTime(reminder.time)} • {reminder.days.length === 7 ? 'Daily' : `${reminder.days.length} days/week`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch checked={reminder.isActive} />
                          <Button size="sm" variant="outline" onClick={() => mockEditMedication(reminder)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Drug Interaction Checker
                </CardTitle>
                <CardDescription>
                  Monitor potential interactions between your medications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDrugInteractions.map((interaction) => (
                    <div key={interaction.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(interaction.severity)}>
                              {interaction.severity.toUpperCase()}
                            </Badge>
                            <h4 className="font-medium">
                              {interaction.medication1} + {interaction.medication2}
                            </h4>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">
                            {interaction.description}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setShowInteractionDetails(interaction)}
                        >
                          View Details
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Potential Effects:</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {interaction.effects.slice(0, 2).map((effect, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-orange-600">•</span>
                                {effect}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium mb-1">Recommendations:</h5>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {interaction.recommendations.slice(0, 2).map((rec, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-blue-600">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pharmacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Pharmacy Integration
                </CardTitle>
                <CardDescription>
                  Manage your preferred pharmacies and prescriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockPharmacies.map((pharmacy) => (
                    <div key={pharmacy.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <MapPin className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{pharmacy.name}</h4>
                              {pharmacy.isPreferred && (
                                <Badge className="bg-green-100 text-green-800">Preferred</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{pharmacy.address}</p>
                            <p className="text-sm text-muted-foreground">{pharmacy.city}, {pharmacy.state} {pharmacy.zipCode}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-sm font-medium">{pharmacy.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{pharmacy.distance} miles</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="text-sm font-medium mb-1">Contact</h5>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {pharmacy.phone}
                          </div>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-1">Services</h5>
                          <div className="flex flex-wrap gap-1">
                            {pharmacy.services.slice(0, 2).map((service, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                            {pharmacy.services.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{pharmacy.services.length - 2} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => mockCallPharmacy(pharmacy.phone, pharmacy.name)}>
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => mockGetDirections(pharmacy.address, pharmacy.name)}>
                          <MapPin className="h-4 w-4 mr-1" />
                          Directions
                        </Button>
                        {!pharmacy.isPreferred && (
                          <Button size="sm" onClick={() => mockSetPreferredPharmacy(pharmacy.id)}>
                            Set as Preferred
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Export Dialog */}
        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Medication Report
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-medium">Export Format</Label>
                <select className="w-full p-2 border rounded-md mt-1">
                  <option value="pdf">PDF Report</option>
                  <option value="csv">CSV Data</option>
                  <option value="json">JSON Data</option>
                  <option value="xlsx">Excel Spreadsheet</option>
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium">Include Data</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="active-meds" defaultChecked />
                    <Label htmlFor="active-meds" className="text-sm">Active Medications</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="med-history" defaultChecked />
                    <Label htmlFor="med-history" className="text-sm">Medication History</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="adherence" defaultChecked />
                    <Label htmlFor="adherence" className="text-sm">Adherence Records</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="interactions" />
                    <Label htmlFor="interactions" className="text-sm">Drug Interactions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="reminders" />
                    <Label htmlFor="reminders" className="text-sm">Reminder Settings</Label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowExportDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Mock export functionality
                  setTimeout(() => {
                    setShowExportDialog(false);
                  }, 1000);
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
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
                Filter Medications
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter-category">Category</Label>
                  <select id="filter-category" className="w-full p-2 border rounded-md">
                    <option value="">All Categories</option>
                    <option value="cardiovascular">Cardiovascular</option>
                    <option value="diabetes">Diabetes</option>
                    <option value="pain">Pain Management</option>
                    <option value="mental_health">Mental Health</option>
                    <option value="allergy">Allergy</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-status">Status</Label>
                  <select id="filter-status" className="w-full p-2 border rounded-md">
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="discontinued">Discontinued</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filter-frequency">Frequency</Label>
                  <select id="filter-frequency" className="w-full p-2 border rounded-md">
                    <option value="">All Frequencies</option>
                    <option value="daily">Daily</option>
                    <option value="twice_daily">Twice Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="as_needed">As Needed</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="filter-adherence">Adherence</Label>
                  <select id="filter-adherence" className="w-full p-2 border rounded-md">
                    <option value="">All Adherence Levels</option>
                    <option value="high">High (&gt;90%)</option>
                    <option value="medium">Medium (70-90%)</option>
                    <option value="low">Low (&lt;70%)</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  // Mock filter functionality
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
                All Medication Alerts ({unreadAlerts.length})
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-3">
                {mockMedicationAlerts.map((alert) => (
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
                          <Badge variant="outline">{alert.type}</Badge>
                          {!alert.isRead && <Badge className="bg-blue-100 text-blue-800">NEW</Badge>}
                        </div>
                        <h4 className="font-medium mb-1">{alert.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{alert.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Medication: {alert.medicationName}</span>
                          <span>Time: {alert.timestamp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {alert.actionRequired && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => mockTakeAction(alert.id)}
                          >
                            Take Action
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

        {/* Medication Details Dialog */}
        <Dialog open={showMedicationDetailsDialog} onOpenChange={setShowMedicationDetailsDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Medication Details
              </DialogTitle>
            </DialogHeader>
            {selectedMedication && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Medication Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedication.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Generic Name</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedication.genericName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Dosage</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedication.dosage}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Frequency</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedication.frequency}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <Badge>{selectedMedication.category}</Badge>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <Badge className={selectedMedication.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {selectedMedication.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Purpose</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedMedication.purpose}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Start Date</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedication.startDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Prescribing Doctor</Label>
                    <p className="text-sm text-muted-foreground">{selectedMedication.prescribedBy}</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowMedicationDetailsDialog(false)}>
                    Close
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowMedicationDetailsDialog(false);
                      mockEditMedication(selectedMedication);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Medication
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Interaction Details Modal */}
        {showInteractionDetails && (
          <Dialog open={!!showInteractionDetails} onOpenChange={() => setShowInteractionDetails(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Drug Interaction Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={getSeverityColor(showInteractionDetails.severity)}>
                    {showInteractionDetails.severity.toUpperCase()}
                  </Badge>
                  <h3 className="font-medium">
                    {showInteractionDetails.medication1} + {showInteractionDetails.medication2}
                  </h3>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{showInteractionDetails.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Clinical Significance</h4>
                  <p className="text-sm text-muted-foreground">{showInteractionDetails.clinicalSignificance}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Mechanism</h4>
                  <p className="text-sm text-muted-foreground">{showInteractionDetails.mechanism}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Potential Effects</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {showInteractionDetails.effects.map((effect, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-orange-600">•</span>
                          {effect}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {showInteractionDetails.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-1">
                          <span className="text-blue-600">•</span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
