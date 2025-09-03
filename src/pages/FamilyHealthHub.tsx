import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  UserPlus,
  Heart,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  Edit,
  Trash2,
  Share2,
  Download,
  Bell,
  Activity,
  Pill,
  Stethoscope,
  Baby,
  User,
  Crown,
  Star,
  Plus,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Info,
  Warning,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";
import {
  mockFamilyMembers,
  mockFamilyHealthHistory,
  mockEmergencyContacts,
  mockCareCoordination,
  mockFamilyHealthAlerts,
  getDependents,
  getEmergencyContacts,
  getUpcomingAppointments,
  getUnreadAlerts,
  getFamilyHealthRisks,
  type FamilyMember,
  type FamilyHealthHistory,
  type EmergencyContact,
  type CareCoordination,
  type FamilyHealthAlert
} from "@/lib/family-health-data";

interface FamilyHealthHubProps {
  patientId?: string;
}

export default function FamilyHealthHub({ patientId = '1' }: FamilyHealthHubProps) {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<FamilyHealthHistory | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddMember, setShowAddMember] = useState(false);
  const [addMemberStep, setAddMemberStep] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Add member form state
  const [memberForm, setMemberForm] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    relationship: '',
    gender: '',
    dateOfBirth: '',
    bloodType: '',
    
    // Contact Information
    email: '',
    phone: '',
    address: '',
    
    // Permissions
    isDependent: false,
    isEmergencyContact: false,
    canMakeDecisions: false,
    shareHealthData: true,
    
    // Insurance
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    memberNumber: '',
    
    // Medical Information
    conditions: '',
    allergies: '',
    medications: '',
    primaryCare: '',
    notes: ''
  });

  const dependents = getDependents();
  const emergencyContacts = getEmergencyContacts();
  const upcomingAppointments = getUpcomingAppointments();
  const unreadAlerts = getUnreadAlerts();
  const familyHealthRisks = getFamilyHealthRisks();

  const getRelationshipIcon = (relationship: string) => {
    switch (relationship) {
      case 'spouse': return <Heart className="h-5 w-5 text-pink-600" />;
      case 'child': return <Baby className="h-5 w-5 text-blue-600" />;
      case 'parent': return <Crown className="h-5 w-5 text-purple-600" />;
      case 'sibling': return <Users className="h-5 w-5 text-green-600" />;
      case 'grandparent': return <Star className="h-5 w-5 text-yellow-600" />;
      default: return <User className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAccountStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
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
              <Users className="h-8 w-8 text-medical-primary" />
              Family Health Hub
            </h1>
            <p className="text-muted-foreground">
              Manage family member accounts, shared health history, and coordinate care
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Family Data
            </Button>
            <Button size="sm" onClick={() => setShowAddMember(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add Family Member
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Family Members</p>
                  <p className="text-2xl font-bold">{mockFamilyMembers.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dependents</p>
                  <p className="text-2xl font-bold">{dependents.length}</p>
                </div>
                <Baby className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Upcoming Appointments</p>
                  <p className="text-2xl font-bold">{upcomingAppointments.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
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
                <Bell className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Family Alerts */}
        {unreadAlerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <Bell className="h-5 w-5" />
                Family Health Alerts ({unreadAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {unreadAlerts.slice(0, 3).map((alert) => {
                  const member = mockFamilyMembers.find(m => m.id === alert.familyMemberId);
                  return (
                    <div key={alert.id} className="flex items-start justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={member?.avatar} />
                          <AvatarFallback>
                            {member?.firstName.charAt(0)}{member?.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={
                              alert.severity === 'urgent' ? 'bg-red-100 text-red-800' :
                              alert.severity === 'warning' ? 'bg-orange-100 text-orange-800' :
                              'bg-blue-100 text-blue-800'
                            }>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <h4 className="font-medium">{alert.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{alert.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {member?.firstName} {member?.lastName} • {formatDateTime(alert.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.actionRequired && (
                          <Button size="sm" variant="outline">
                            Take Action
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {unreadAlerts.length > 3 && (
                  <Button variant="outline" className="w-full">
                    View All {unreadAlerts.length} Alerts
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Family Members</TabsTrigger>
            <TabsTrigger value="history">Health History</TabsTrigger>
            <TabsTrigger value="emergency">Emergency Contacts</TabsTrigger>
            <TabsTrigger value="coordination">Care Coordination</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Family Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Family Members Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockFamilyMembers.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.firstName} {member.lastName}</p>
                            <div className="flex items-center gap-2">
                              {getRelationshipIcon(member.relationship)}
                              <span className="text-sm text-muted-foreground capitalize">
                                {member.relationship} • Age {calculateAge(member.dateOfBirth)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getAccountStatusColor(member.accountStatus)}>
                            {member.accountStatus.toUpperCase()}
                          </Badge>
                          {member.isDependent && (
                            <Badge variant="outline" className="text-xs">
                              Dependent
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Appointments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {upcomingAppointments.map((appointment) => {
                      const member = mockFamilyMembers.find(m => m.id === appointment.dependentId);
                      return (
                        <div key={appointment.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{member?.firstName} {member?.lastName}</p>
                              <p className="text-sm text-muted-foreground">{appointment.provider}</p>
                            </div>
                            <Badge className="bg-blue-100 text-blue-800">
                              {appointment.careType.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(appointment.nextAppointment!)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Family Health Risks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Family Health History & Genetic Risks
                </CardTitle>
                <CardDescription>
                  Hereditary conditions and health risks that may affect family members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {familyHealthRisks.map((risk) => (
                    <Card key={risk.id} className="border-l-4 border-l-red-500">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold">{risk.condition}</h3>
                          <Badge className={getSeverityColor(risk.severity)}>
                            {risk.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {risk.relationship} • Age of onset: {risk.ageOfOnset || 'Unknown'}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium text-red-700">Risk Factors:</p>
                            <p className="text-xs text-red-600">{risk.riskFactors.slice(0, 2).join(', ')}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-green-700">Prevention:</p>
                            <p className="text-xs text-green-600">{risk.preventiveMeasures.slice(0, 2).join(', ')}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Search and Filter */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search family members..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Family Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockFamilyMembers
                .filter(member => 
                  searchQuery === '' || 
                  `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  member.relationship.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={member.avatar} />
                            <AvatarFallback>
                              {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <CardTitle className="text-lg">{member.firstName} {member.lastName}</CardTitle>
                            <div className="flex items-center gap-2">
                              {getRelationshipIcon(member.relationship)}
                              <CardDescription className="capitalize">
                                {member.relationship} • Age {calculateAge(member.dateOfBirth)}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                        <Badge className={getAccountStatusColor(member.accountStatus)}>
                          {member.accountStatus.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Gender:</span>
                            <p className="font-medium capitalize">{member.gender}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Blood Type:</span>
                            <p className="font-medium">{member.bloodType || 'Unknown'}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Insurance:</span>
                            <p className="font-medium">{member.insurance.provider}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Status:</span>
                            <div className="flex items-center gap-1">
                              {member.isDependent && (
                                <Badge variant="outline" className="text-xs">Dependent</Badge>
                              )}
                              {member.isEmergencyContact && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">Emergency</Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Medical Conditions */}
                        {member.medicalInfo.conditions.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Medical Conditions:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.medicalInfo.conditions.slice(0, 2).map((condition) => (
                                <Badge key={condition} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                              {member.medicalInfo.conditions.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{member.medicalInfo.conditions.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Allergies */}
                        {member.medicalInfo.allergies.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Allergies:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.medicalInfo.allergies.slice(0, 2).map((allergy) => (
                                <Badge key={allergy} variant="outline" className="text-xs bg-red-50 text-red-700">
                                  {allergy}
                                </Badge>
                              ))}
                              {member.medicalInfo.allergies.length > 2 && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700">
                                  +{member.medicalInfo.allergies.length - 2} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2">
                          <div className="text-sm text-muted-foreground">
                            {member.lastActive && (
                              <span>Last active: {formatDate(member.lastActive)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => setSelectedMember(member)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
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

          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Shared Family Health History
                </CardTitle>
                <CardDescription>
                  Hereditary conditions and health patterns across family members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockFamilyHealthHistory.map((history) => (
                    <Card key={history.id} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedHistory(history)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{history.condition}</h3>
                            <p className="text-sm text-muted-foreground">
                              {history.relationship} • Age of onset: {history.ageOfOnset || 'Unknown'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={getSeverityColor(history.severity)}>
                              {history.severity.toUpperCase()}
                            </Badge>
                            {history.isHereditary && (
                              <Badge className="bg-purple-100 text-purple-800">
                                Hereditary
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Risk Factors:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {history.riskFactors.slice(0, 2).map((factor, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-orange-600">•</span>
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-1">Prevention:</h4>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {history.preventiveMeasures.slice(0, 2).map((measure, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <span className="text-green-600">•</span>
                                  {measure}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {history.notes && (
                          <div className="p-2 bg-muted rounded text-xs">
                            <strong>Notes:</strong> {history.notes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emergency" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Emergency Contact Management
                </CardTitle>
                <CardDescription>
                  Manage emergency contacts and medical decision makers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEmergencyContacts.map((contact) => (
                    <Card key={contact.id} className={`${contact.isPrimary ? 'border-red-200 bg-red-50' : ''}`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                              <Phone className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{contact.name}</h3>
                              <p className="text-sm text-muted-foreground">{contact.relationship}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {contact.isPrimary && (
                              <Badge className="bg-red-100 text-red-800">Primary</Badge>
                            )}
                            {contact.canMakeMedicalDecisions && (
                              <Badge className="bg-blue-100 text-blue-800">Medical Decisions</Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{contact.phone}</span>
                            </div>
                            {contact.alternatePhone && (
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span>{contact.alternatePhone} (Alt)</span>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span>{contact.email}</span>
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <span>{contact.address}</span>
                            </div>
                          </div>
                        </div>
                        
                        {contact.notes && (
                          <div className="p-2 bg-muted rounded text-xs">
                            <strong>Notes:</strong> {contact.notes}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 mt-3">
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4 mr-1" />
                            Call
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="coordination" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Dependent Care Coordination
                </CardTitle>
                <CardDescription>
                  Manage healthcare coordination for family dependents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCareCoordination.map((care) => {
                    const member = mockFamilyMembers.find(m => m.id === care.dependentId);
                    return (
                      <Card key={care.id}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={member?.avatar} />
                                <AvatarFallback>
                                  {member?.firstName.charAt(0)}{member?.lastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold">{member?.firstName} {member?.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{care.provider}</p>
                              </div>
                            </div>
                            <Badge className={
                              care.careType === 'medical' ? 'bg-blue-100 text-blue-800' :
                              care.careType === 'dental' ? 'bg-green-100 text-green-800' :
                              care.careType === 'vision' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {care.careType.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              {care.nextAppointment && (
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  <Calendar className="h-4 w-4 text-green-600" />
                                  <span>Next: {formatDateTime(care.nextAppointment)}</span>
                                </div>
                              )}
                              {care.lastVisit && (
                                <div className="flex items-center gap-2 text-sm">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <span>Last: {formatDate(care.lastVisit)}</span>
                                </div>
                              )}
                            </div>
                            <div>
                              {care.medications && care.medications.length > 0 && (
                                <div>
                                  <p className="text-sm font-medium mb-1">Medications:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {care.medications.slice(0, 2).map((med, index) => (
                                      <Badge key={index} variant="outline" className="text-xs">
                                        {med}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          {care.specialInstructions && (
                            <div className="p-2 bg-blue-50 rounded text-xs mb-2">
                              <strong>Special Instructions:</strong> {care.specialInstructions}
                            </div>
                          )}
                          
                          {care.emergencyProtocol && (
                            <div className="p-2 bg-red-50 rounded text-xs mb-2">
                              <strong>Emergency Protocol:</strong> {care.emergencyProtocol}
                            </div>
                          )}
                          
                          {care.notes && (
                            <div className="p-2 bg-muted rounded text-xs">
                              <strong>Notes:</strong> {care.notes}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Family Member Modal */}
      <Dialog
        open={showAddMember}
        onOpenChange={(open) => {
          setShowAddMember(open);
          if (!open) setAddMemberStep(1);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-[640px] p-0">
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-medical-primary" />
              Add Family Member
            </DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Step {addMemberStep} of 6</span>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5,6].map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 w-6 rounded-full ${addMemberStep >= s ? 'bg-medical-primary' : 'bg-muted'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <Separator />

          <ScrollArea className="max-h-[70vh]">
            <div className="p-4 space-y-6">
              {addMemberStep === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input id="firstName" placeholder="John" value={memberForm.firstName} onChange={(e)=>setMemberForm({...memberForm, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input id="lastName" placeholder="Doe" value={memberForm.lastName} onChange={(e)=>setMemberForm({...memberForm, lastName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="relationship">Relationship *</Label>
                      <select value={memberForm.relationship} onChange={(e)=>setMemberForm({...memberForm, relationship: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                        <option value="grandparent">Grandparent</option>
                        <option value="grandchild">Grandchild</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender</Label>
                      <select value={memberForm.gender} onChange={(e)=>setMemberForm({...memberForm, gender: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                        <option value="prefer_not_to_say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth">Date of Birth</Label>
                      <Input id="dateOfBirth" type="date" value={memberForm.dateOfBirth} onChange={(e)=>setMemberForm({...memberForm, dateOfBirth: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodType">Blood Type</Label>
                      <select value={memberForm.bloodType} onChange={(e)=>setMemberForm({...memberForm, bloodType: e.target.value})} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <option value="">Select blood type</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="unknown">Unknown</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {addMemberStep === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="john.doe@email.com" value={memberForm.email} onChange={(e)=>setMemberForm({...memberForm, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="(555) 123-4567" value={memberForm.phone} onChange={(e)=>setMemberForm({...memberForm, phone: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" placeholder="123 Main St, City, State 12345" rows={3} value={memberForm.address} onChange={(e)=>setMemberForm({...memberForm, address: e.target.value})} />
                  </div>
                </div>
              )}

              {addMemberStep === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account & Permissions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isDependent" className="text-base font-medium">Mark as Dependent</Label>
                        <p className="text-sm text-muted-foreground">You can manage healthcare decisions for this person</p>
                      </div>
                      <Switch id="isDependent" checked={memberForm.isDependent} onCheckedChange={(v)=>setMemberForm({...memberForm, isDependent: v})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="isEmergencyContact" className="text-base font-medium">Emergency Contact</Label>
                        <p className="text-sm text-muted-foreground">This person can access your health information in emergencies</p>
                      </div>
                      <Switch id="isEmergencyContact" checked={memberForm.isEmergencyContact} onCheckedChange={(v)=>setMemberForm({...memberForm, isEmergencyContact: v})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="canMakeDecisions" className="text-base font-medium">Medical Decision Authority</Label>
                        <p className="text-sm text-muted-foreground">Allow this person to make medical decisions on your behalf</p>
                      </div>
                      <Switch id="canMakeDecisions" checked={memberForm.canMakeDecisions} onCheckedChange={(v)=>setMemberForm({...memberForm, canMakeDecisions: v})} />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="shareHealthData" className="text-base font-medium">Share Health Data</Label>
                        <p className="text-sm text-muted-foreground">Allow access to medical records and health information</p>
                      </div>
                      <Switch id="shareHealthData" checked={memberForm.shareHealthData} onCheckedChange={(v)=>setMemberForm({...memberForm, shareHealthData: v})} />
                    </div>
                  </div>
                </div>
              )}

              {addMemberStep === 4 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Insurance Information (Optional)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                      <Input id="insuranceProvider" placeholder="Blue Cross Blue Shield" value={memberForm.insuranceProvider} onChange={(e)=>setMemberForm({...memberForm, insuranceProvider: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="policyNumber">Policy Number</Label>
                      <Input id="policyNumber" placeholder="Policy #123456789" value={memberForm.policyNumber} onChange={(e)=>setMemberForm({...memberForm, policyNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="groupNumber">Group Number</Label>
                      <Input id="groupNumber" placeholder="Group #ABC123" value={memberForm.groupNumber} onChange={(e)=>setMemberForm({...memberForm, groupNumber: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="memberNumber">Member ID</Label>
                      <Input id="memberNumber" placeholder="Member #987654321" value={memberForm.memberNumber} onChange={(e)=>setMemberForm({...memberForm, memberNumber: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {addMemberStep === 5 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Stethoscope className="h-4 w-4" />
                    Medical Information (Optional)
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="conditions">Known Conditions</Label>
                      <Textarea id="conditions" placeholder="Diabetes, Hypertension, Asthma (separate with commas)" rows={2} value={memberForm.conditions} onChange={(e)=>setMemberForm({...memberForm, conditions: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Allergies</Label>
                      <Textarea id="allergies" placeholder="Penicillin, Peanuts, Latex (separate with commas)" rows={2} value={memberForm.allergies} onChange={(e)=>setMemberForm({...memberForm, allergies: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="medications">Current Medications</Label>
                      <Textarea id="medications" placeholder="Lisinopril 10mg daily, Metformin 500mg twice daily" rows={2} value={memberForm.medications} onChange={(e)=>setMemberForm({...memberForm, medications: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="primaryCare">Primary Care Provider</Label>
                      <Input id="primaryCare" placeholder="Dr. Sarah Johnson, MD" value={memberForm.primaryCare} onChange={(e)=>setMemberForm({...memberForm, primaryCare: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea id="notes" placeholder="Any additional medical information or special instructions" rows={3} value={memberForm.notes} onChange={(e)=>setMemberForm({...memberForm, notes: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {addMemberStep === 6 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Review & Confirm
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 border rounded">
                      <div className="font-medium mb-1">Personal</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>First name: {memberForm.firstName || '-'}</div>
                        <div>Last name: {memberForm.lastName || '-'}</div>
                        <div>Relationship: {memberForm.relationship || '-'}</div>
                        <div>Gender: {memberForm.gender || '-'}</div>
                        <div>DOB: {memberForm.dateOfBirth || '-'}</div>
                        <div>Blood: {memberForm.bloodType || '-'}</div>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium mb-1">Contact</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Email: {memberForm.email || '-'}</div>
                        <div>Phone: {memberForm.phone || '-'}</div>
                        <div className="col-span-2">Address: {memberForm.address || '-'}</div>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium mb-1">Permissions</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Dependent: {memberForm.isDependent ? 'Yes' : 'No'}</div>
                        <div>Emergency Contact: {memberForm.isEmergencyContact ? 'Yes' : 'No'}</div>
                        <div>Decision Authority: {memberForm.canMakeDecisions ? 'Yes' : 'No'}</div>
                        <div>Share Health Data: {memberForm.shareHealthData ? 'Yes' : 'No'}</div>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium mb-1">Insurance</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>Provider: {memberForm.insuranceProvider || '-'}</div>
                        <div>Policy #: {memberForm.policyNumber || '-'}</div>
                        <div>Group #: {memberForm.groupNumber || '-'}</div>
                        <div>Member ID: {memberForm.memberNumber || '-'}</div>
                      </div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-medium mb-1">Medical</div>
                      <div className="space-y-1">
                        <div>Conditions: {memberForm.conditions || '-'}</div>
                        <div>Allergies: {memberForm.allergies || '-'}</div>
                        <div>Medications: {memberForm.medications || '-'}</div>
                        <div>Primary Care: {memberForm.primaryCare || '-'}</div>
                        <div>Notes: {memberForm.notes || '-'}</div>
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800">
                      This is a mocked flow for demo purposes. No information will be saved.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <Separator />

          {/* Navigation controls */}
          <div className="px-4 py-3 flex items-center justify-between gap-2">
            <Button variant="outline" onClick={() => setShowAddMember(false)} className="sm:hidden">
              Close
            </Button>
            <div className="flex items-center gap-2 ml-auto">
              <Button variant="outline" disabled={addMemberStep === 1} onClick={() => setAddMemberStep((s)=>Math.max(1, s-1))}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              {addMemberStep < 6 ? (
                <Button
                  onClick={() => {
                    if (addMemberStep === 1) {
                      // simple required validation
                      if (!memberForm.firstName || !memberForm.lastName || !memberForm.relationship) {
                        // Just prevent moving forward if required fields empty
                        return;
                      }
                    }
                    setAddMemberStep((s)=>Math.min(6, s+1));
                  }}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    console.log('Family member added (mock):', memberForm);
                    setShowAddMember(false);
                    setAddMemberStep(1);
                  }}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Confirm
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
