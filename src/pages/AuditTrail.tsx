import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  Shield,
  Eye,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Building,
  FileText,
  Activity,
  Search,
  Filter,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  RefreshCw,
  ExternalLink,
  Info
} from "lucide-react";
import {
  mockAuditLogs,
  mockProviderInteractions,
  mockDataSharingEvents,
  mockComplianceMetrics,
  mockSecurityEvents,
  getComplianceScore,
  getAuditSummary,
  type AuditLogEntry,
  type ProviderInteraction,
  type DataSharingEvent,
  type ComplianceMetric,
  type SecurityEvent
} from "@/lib/audit-trail-data";

interface AuditTrailProps {
  patientId?: string;
}

export default function AuditTrail({ patientId = '1' }: AuditTrailProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');

  const complianceScore = getComplianceScore();
  const auditSummary = getAuditSummary();

  // Filter functions
  const getFilteredLogs = () => {
    let filtered = mockAuditLogs;
    
    // Time range filter
    const now = new Date();
    const daysBack = selectedTimeRange === '7d' ? 7 : selectedTimeRange === '30d' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));
    filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);
    
    // Log type filter
    if (selectedLogType !== 'all') {
      filtered = filtered.filter(log => log.action === selectedLogType);
    }
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(log => 
        log.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'view': return <Eye className="h-4 w-4" />;
      case 'download': return <Download className="h-4 w-4" />;
      case 'share': return <Share2 className="h-4 w-4" />;
      case 'modify': return <FileText className="h-4 w-4" />;
      case 'export': return <ExternalLink className="h-4 w-4" />;
      case 'access_granted': return <Unlock className="h-4 w-4" />;
      case 'access_denied': return <Lock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'failure': return 'text-red-600 bg-red-100';
      case 'blocked': return 'text-orange-600 bg-orange-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Audit Trail</h1>
            <p className="text-muted-foreground">
              Complete access log and compliance monitoring for your medical data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Logs
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Access Events</p>
                  <p className="text-2xl font-bold">{auditSummary.totalLogs}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{auditSummary.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                  <p className="text-2xl font-bold text-blue-600">{complianceScore}%</p>
                </div>
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Risk Events</p>
                  <p className="text-2xl font-bold text-red-600">{auditSummary.highRiskEvents}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="access-logs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="access-logs">Access Logs</TabsTrigger>
            <TabsTrigger value="provider-interactions">Provider Interactions</TabsTrigger>
            <TabsTrigger value="data-sharing">Data Sharing</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="access-logs" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Access Log Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Time Range</label>
                    <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7d">Last 7 days</SelectItem>
                        <SelectItem value="30d">Last 30 days</SelectItem>
                        <SelectItem value="90d">Last 90 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Action Type</label>
                    <Select value={selectedLogType} onValueChange={setSelectedLogType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Actions</SelectItem>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="download">Download</SelectItem>
                        <SelectItem value="share">Share</SelectItem>
                        <SelectItem value="modify">Modify</SelectItem>
                        <SelectItem value="export">Export</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search logs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-end">
                    <Button variant="outline" className="w-full">
                      <Filter className="h-4 w-4 mr-2" />
                      Advanced Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Access Logs List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Access Log Entries ({getFilteredLogs().length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {getFilteredLogs().map((log) => (
                      <div key={log.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="flex items-center gap-2">
                              {getActionIcon(log.action)}
                              <Badge className={getOutcomeColor(log.outcome)}>
                                {log.outcome}
                              </Badge>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{log.details.description}</h4>
                                {log.riskScore > 70 && (
                                  <Badge variant="destructive" className="text-xs">
                                    High Risk
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{log.actor.name} ({log.actor.type})</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  <span>{log.target.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Globe className="h-3 w-3" />
                                  <span>{log.actor.ipAddress}</span>
                                </div>
                              </div>
                              
                              {log.actor.organization && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                  <Building className="h-3 w-3" />
                                  <span>{log.actor.organization}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatTimeAgo(log.timestamp)}</div>
                            <div className={`text-xs font-medium ${getRiskScoreColor(log.riskScore)}`}>
                              Risk: {log.riskScore}%
                            </div>
                            {log.details.duration && (
                              <div className="text-xs text-muted-foreground">
                                {log.details.duration}s duration
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {log.complianceFlags.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium text-red-600">Compliance Issues:</span>
                              <div className="flex gap-1">
                                {log.complianceFlags.map((flag, index) => (
                                  <Badge key={index} variant="destructive" className="text-xs">
                                    {flag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="provider-interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Provider Interaction History
                </CardTitle>
                <CardDescription>
                  Detailed log of all healthcare provider interactions with your medical data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockProviderInteractions.map((interaction) => (
                    <div key={interaction.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-medical-primary to-medical-secondary rounded-full flex items-center justify-center text-white font-medium">
                            {interaction.providerName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-medium">{interaction.providerName}</h4>
                            <p className="text-sm text-muted-foreground">{interaction.providerOrganization}</p>
                            <Badge className={
                              interaction.complianceStatus === 'compliant' ? 'bg-green-100 text-green-800' :
                              interaction.complianceStatus === 'non_compliant' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {interaction.complianceStatus.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatTimeAgo(interaction.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">{interaction.duration} minutes</div>
                          <Badge className={
                            interaction.outcome === 'completed' ? 'bg-green-100 text-green-800' :
                            interaction.outcome === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                            interaction.outcome === 'cancelled' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {interaction.outcome.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Interaction Type</h5>
                          <p className="text-sm text-muted-foreground capitalize">
                            {interaction.interactionType.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Purpose</h5>
                          <p className="text-sm text-muted-foreground">{interaction.purpose}</p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Records Accessed ({interaction.recordsAccessed.length})</h5>
                        <div className="flex flex-wrap gap-1">
                          {interaction.recordsAccessed.map((record, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {record}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Permissions Used</h5>
                        <div className="flex flex-wrap gap-1">
                          {interaction.permissionsUsed.map((permission, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <CheckCircle className={`h-3 w-3 ${interaction.patientConsent ? 'text-green-600' : 'text-red-600'}`} />
                            Patient Consent: {interaction.patientConsent ? 'Given' : 'Not Given'}
                          </span>
                        </div>
                      </div>

                      {interaction.notes && (
                        <div className="mt-3 pt-3 border-t">
                          <h5 className="text-sm font-medium mb-1">Notes</h5>
                          <p className="text-sm text-muted-foreground">{interaction.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data-sharing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Data Sharing Audit Trail
                </CardTitle>
                <CardDescription>
                  Complete history of data sharing events, permissions, and monetization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDataSharingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                            event.sharingType === 'research_participation' ? 'bg-purple-600' :
                            event.sharingType === 'provider_access' ? 'bg-blue-600' :
                            event.sharingType === 'marketplace_sale' ? 'bg-green-600' :
                            'bg-gray-600'
                          }`}>
                            {event.recipient.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <h4 className="font-medium">{event.recipient.name}</h4>
                            <p className="text-sm text-muted-foreground">{event.recipient.organization}</p>
                            <Badge className={
                              event.sharingType === 'research_participation' ? 'bg-purple-100 text-purple-800' :
                              event.sharingType === 'provider_access' ? 'bg-blue-100 text-blue-800' :
                              event.sharingType === 'marketplace_sale' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }>
                              {event.sharingType.replace('_', ' ').toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatTimeAgo(event.timestamp)}</div>
                          {event.monetization && (
                            <div className="text-sm font-medium text-green-600">
                              +${event.monetization.amount.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h5 className="text-sm font-medium mb-2">Purpose</h5>
                          <p className="text-sm text-muted-foreground">{event.recipient.purpose}</p>
                        </div>
                        <div>
                          <h5 className="text-sm font-medium mb-2">Data Sensitivity</h5>
                          <Badge className={
                            event.dataShared.sensitivity === 'critical' ? 'bg-red-100 text-red-800' :
                            event.dataShared.sensitivity === 'high' ? 'bg-orange-100 text-orange-800' :
                            event.dataShared.sensitivity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {event.dataShared.sensitivity.toUpperCase()}
                          </Badge>
                          {event.dataShared.anonymized && (
                            <Badge variant="outline" className="ml-2">ANONYMIZED</Badge>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h5 className="text-sm font-medium mb-2">Compliance Status</h5>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <CheckCircle className={`h-3 w-3 ${event.complianceChecks.hipaaCompliant ? 'text-green-600' : 'text-red-600'}`} />
                            <span>HIPAA: {event.complianceChecks.hipaaCompliant ? 'Compliant' : 'Non-Compliant'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className={`h-3 w-3 ${event.complianceChecks.gdprCompliant ? 'text-green-600' : 'text-red-600'}`} />
                            <span>GDPR: {event.complianceChecks.gdprCompliant ? 'Compliant' : 'Non-Compliant'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className={`h-3 w-3 ${event.complianceChecks.localRegulationsCompliant ? 'text-green-600' : 'text-red-600'}`} />
                            <span>Local: {event.complianceChecks.localRegulationsCompliant ? 'Compliant' : 'Non-Compliant'}</span>
                          </div>
                        </div>
                      </div>

                      {event.monetization && (
                        <div className="pt-3 border-t">
                          <h5 className="text-sm font-medium mb-2">Monetization Details</h5>
                          <div className="text-sm text-muted-foreground">
                            Transaction ID: {event.monetization.transactionId} • 
                            Amount: ${event.monetization.amount.toFixed(2)} {event.monetization.currency}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            {/* Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{complianceScore}%</div>
                    <div className="text-sm text-muted-foreground">Overall Compliance Score</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {mockComplianceMetrics.filter(m => m.status === 'compliant').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Compliant Metrics</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600">
                      {mockSecurityEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length}
                    </div>
                    <div className="text-sm text-muted-foreground">High Priority Security Events</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Compliance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockComplianceMetrics.map((metric) => (
                    <div key={metric.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{metric.metric}</h4>
                          <p className="text-sm text-muted-foreground">{metric.description}</p>
                          <Badge className={
                            metric.status === 'compliant' ? 'bg-green-100 text-green-800' :
                            metric.status === 'non_compliant' ? 'bg-red-100 text-red-800' :
                            metric.status === 'at_risk' ? 'bg-orange-100 text-orange-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {metric.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{metric.value}</div>
                          <div className="text-sm text-muted-foreground">{metric.unit}</div>
                        </div>
                      </div>

                      <div className="mb-3">
                        <h5 className="text-sm font-medium mb-2">Requirements</h5>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {metric.requirements.map((req, index) => (
                            <li key={index} className="flex items-start gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Last Assessed: {new Date(metric.lastAssessed).toLocaleDateString()}</span>
                        <span>Next Review: {new Date(metric.nextReview).toLocaleDateString()}</span>
                      </div>

                      {metric.violations && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <span className="font-medium text-red-600">
                              {metric.violations.count} violation(s) - Last: {metric.violations.lastViolation ? new Date(metric.violations.lastViolation).toLocaleDateString() : 'N/A'}
                            </span>
                            <Badge className={
                              metric.violations.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              metric.violations.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              metric.violations.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              {metric.violations.severity.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Security Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Recent Security Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockSecurityEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{event.eventType.replace('_', ' ').toUpperCase()}</h4>
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <Badge className={
                              event.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }>
                              {event.resolved ? 'RESOLVED' : 'ACTIVE'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          <div className="text-xs text-muted-foreground">
                            <div>Source: {event.source.ipAddress} • {event.source.location || 'Unknown Location'}</div>
                            <div>Action Taken: {event.actionTaken}</div>
                            <div>Investigation: {event.investigationStatus.replace('_', ' ').toUpperCase()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{formatTimeAgo(event.timestamp)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
