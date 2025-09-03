import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  DollarSign,
  Filter,
  Search,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Brain,
  Shield,
  Zap,
  Stethoscope,
  TestTube,
  Camera,
  Pill,
  Syringe,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus,
  Star,
  Award,
  Target,
  Eye,
  FileText,
  BarChart3,
  Plus
} from "lucide-react";
import {
  mockHealthEvents,
  mockHealthMilestones,
  getEventsByDateRange,
  getEventsByType,
  getTotalHealthcareCosts,
  getUniqueProviders,
  getUniqueTags,
  type HealthEvent,
  type HealthMilestone,
  type TimelineFilter
} from "@/lib/health-timeline-data";

interface HealthTimelineProps {
  patientId?: string;
}

export default function HealthTimeline({ patientId = '1' }: HealthTimelineProps) {
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<HealthMilestone | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<TimelineFilter>({
    dateRange: {
      start: '2020-01-01',
      end: '2024-12-31'
    },
    eventTypes: [],
    categories: [],
    providers: [],
    severity: [],
    outcome: [],
    tags: []
  });
  
  // Dev toggle for empty states
  const [isEmptyState, setIsEmptyState] = useState(false);
  const [healthEvents, setHealthEvents] = useState(mockHealthEvents);
  const [healthMilestones, setHealthMilestones] = useState(mockHealthMilestones);

  /**
   * Dev function to toggle between empty and populated states
   */
  const toggleEmptyState = () => {
    if (isEmptyState) {
      // Load populated data
      setHealthEvents(mockHealthEvents);
      setHealthMilestones(mockHealthMilestones);
      setIsEmptyState(false);
    } else {
      // Reset to empty state
      setHealthEvents([]);
      setHealthMilestones([]);
      setIsEmptyState(true);
    }
  };

  const filteredEvents = useMemo(() => {
    let events = healthEvents;

    // Apply date range filter
    events = getEventsByDateRange(events, filters.dateRange.start, filters.dateRange.end);

    // Apply search query
    if (searchQuery) {
      events = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.provider.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply type filters
    if (filters.eventTypes.length > 0) {
      events = events.filter(event => filters.eventTypes.includes(event.type));
    }

    // Apply category filters
    if (filters.categories.length > 0) {
      events = events.filter(event => filters.categories.includes(event.category));
    }

    // Apply provider filters
    if (filters.providers.length > 0) {
      events = events.filter(event => filters.providers.includes(event.provider));
    }

    // Apply severity filters
    if (filters.severity.length > 0) {
      events = events.filter(event => filters.severity.includes(event.severity));
    }

    // Apply outcome filters
    if (filters.outcome.length > 0) {
      events = events.filter(event => filters.outcome.includes(event.outcome));
    }

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [searchQuery, filters]);

  const totalCosts = getTotalHealthcareCosts(filteredEvents);
  const uniqueProviders = getUniqueProviders(mockHealthEvents);
  const uniqueTags = getUniqueTags(mockHealthEvents);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'visit': return <Stethoscope className="h-5 w-5 text-blue-600" />;
      case 'lab': return <TestTube className="h-5 w-5 text-green-600" />;
      case 'imaging': return <Camera className="h-5 w-5 text-purple-600" />;
      case 'prescription': return <Pill className="h-5 w-5 text-orange-600" />;
      case 'procedure': return <Activity className="h-5 w-5 text-red-600" />;
      case 'vaccination': return <Syringe className="h-5 w-5 text-teal-600" />;
      case 'emergency': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'milestone': return <Award className="h-5 w-5 text-yellow-600" />;
      case 'symptom': return <Heart className="h-5 w-5 text-pink-600" />;
      case 'vital': return <Activity className="h-5 w-5 text-indigo-600" />;
      default: return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'positive': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'negative': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'ongoing': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const groupEventsByYear = (events: HealthEvent[]) => {
    return events.reduce((acc, event) => {
      const year = new Date(event.date).getFullYear().toString();
      if (!acc[year]) acc[year] = [];
      acc[year].push(event);
      return acc;
    }, {} as Record<string, HealthEvent[]>);
  };

  const groupedEvents = groupEventsByYear(filteredEvents);

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="h-8 w-8 text-medical-primary" />
              Health Timeline
            </h1>
            <p className="text-muted-foreground">
              Chronological view of your complete medical history and health milestones
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
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Timeline
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share with Provider
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Events</p>
                  <p className="text-2xl font-bold">{filteredEvents.length}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Healthcare Providers</p>
                  <p className="text-2xl font-bold">{uniqueProviders.length}</p>
                </div>
                <User className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Healthcare Costs</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalCosts.total)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Health Milestones</p>
                  <p className="text-2xl font-bold">{mockHealthMilestones.length}</p>
                </div>
                <Award className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events, providers, or conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="visit">Visits</SelectItem>
                    <SelectItem value="lab">Lab Results</SelectItem>
                    <SelectItem value="imaging">Imaging</SelectItem>
                    <SelectItem value="prescription">Prescriptions</SelectItem>
                    <SelectItem value="procedure">Procedures</SelectItem>
                    <SelectItem value="vaccination">Vaccinations</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="year">Last Year</SelectItem>
                    <SelectItem value="6months">Last 6 Months</SelectItem>
                    <SelectItem value="3months">Last 3 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="timeline">Timeline View</TabsTrigger>
            <TabsTrigger value="milestones">Health Milestones</TabsTrigger>
            <TabsTrigger value="analytics">Health Analytics</TabsTrigger>
            <TabsTrigger value="family">Family History</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-6">
            <ScrollArea className="h-[800px]">
              <div className="space-y-8">
                {Object.keys(groupedEvents).length === 0 ? (
                  <div className="text-center py-16">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Health Events</h3>
                    <p className="text-muted-foreground mb-6">
                      Your health timeline is empty. Start by adding your first health event or medical record.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Health Event
                      </Button>
                      <Button variant="outline" onClick={toggleEmptyState}>
                        {isEmptyState ? "Load Sample Data" : "Show Empty State"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  Object.entries(groupedEvents).map(([year, events]) => (
                  <div key={year} className="relative">
                    <div className="sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10 py-2">
                      <h2 className="text-2xl font-bold text-medical-primary">{year}</h2>
                      <Separator className="mt-2" />
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      {events.map((event, index) => (
                        <div key={event.id} className="relative">
                          {/* Timeline line */}
                          <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                          
                          <Card className="ml-16 hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setSelectedEvent(event)}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-4">
                                {/* Event icon */}
                                <div className="absolute -left-10 top-4 w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center">
                                  {getEventIcon(event.type)}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-2">
                                    <div>
                                      <h3 className="font-semibold text-lg">{event.title}</h3>
                                      <p className="text-sm text-muted-foreground">{event.description}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge className={getSeverityColor(event.severity)}>
                                        {event.severity.toUpperCase()}
                                      </Badge>
                                      {getOutcomeIcon(event.outcome)}
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      {formatDate(event.date)}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="h-3 w-3" />
                                      {event.provider}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {event.location}
                                    </div>
                                    {event.cost && (
                                      <div className="flex items-center gap-1">
                                        <DollarSign className="h-3 w-3" />
                                        {formatCurrency(event.cost.outOfPocket)}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {event.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {event.tags.length > 3 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{event.tags.length - 3} more
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="milestones" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Health Milestones & Achievements
                </CardTitle>
                <CardDescription>
                  Significant health events, achievements, and important medical milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockHealthMilestones.map((milestone) => (
                    <Card key={milestone.id} className="hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedMilestone(milestone)}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                            <Award className="h-6 w-6 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg">{milestone.title}</h3>
                                <p className="text-sm text-muted-foreground">{milestone.description}</p>
                              </div>
                              <Badge className={
                                milestone.significance === 'major' ? 'bg-red-100 text-red-800' :
                                milestone.significance === 'moderate' ? 'bg-orange-100 text-orange-800' :
                                'bg-green-100 text-green-800'
                              }>
                                {milestone.significance.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(milestone.date)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {milestone.ageAtEvent}
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {milestone.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Event Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      filteredEvents.reduce((acc, event) => {
                        acc[event.type] = (acc[event.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => {
                      const percentage = (count / filteredEvents.length) * 100;
                      return (
                        <div key={type}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getEventIcon(type)}
                              <span className="text-sm font-medium capitalize">{type}</span>
                            </div>
                            <span className="text-sm text-muted-foreground">{count} events</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Healthcare Costs Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Healthcare Costs Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium">Total Healthcare Costs</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(totalCosts.total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <span className="font-medium">Insurance Covered</span>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(totalCosts.insurance)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium">Out of Pocket</span>
                      <span className="text-lg font-bold text-orange-600">
                        {formatCurrency(totalCosts.outOfPocket)}
                      </span>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Insurance Coverage</span>
                        <span className="text-sm font-medium">
                          {Math.round((totalCosts.insurance / totalCosts.total) * 100)}%
                        </span>
                      </div>
                      <Progress 
                        value={(totalCosts.insurance / totalCosts.total) * 100} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Provider Network */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Healthcare Provider Network
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uniqueProviders.map((provider) => {
                      const providerEvents = filteredEvents.filter(e => e.provider === provider);
                      return (
                        <div key={provider} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{provider}</p>
                            <p className="text-sm text-muted-foreground">
                              {providerEvents.length} visit{providerEvents.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {providerEvents[0]?.category || 'General'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Health Trends */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Health Trends & Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-green-800">Positive Trends</span>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• Consistent preventive care visits</li>
                        <li>• Successful smoking cessation</li>
                        <li>• Regular health screenings</li>
                      </ul>
                    </div>
                    
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-800">Areas for Attention</span>
                      </div>
                      <ul className="text-sm text-orange-700 space-y-1">
                        <li>• Emergency visits for allergic reactions</li>
                        <li>• Blood pressure management needed</li>
                        <li>• Mental health support ongoing</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Family Health History Integration
                </CardTitle>
                <CardDescription>
                  Health events and conditions that may be relevant to family members
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredEvents
                    .filter(event => event.familyRelevant)
                    .map((event) => (
                      <Card key={event.id} className="border-l-4 border-l-purple-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              {getEventIcon(event.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold">{event.title}</h3>
                                  <p className="text-sm text-muted-foreground">{event.description}</p>
                                </div>
                                <Badge className="bg-purple-100 text-purple-800">
                                  Family Relevant
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(event.date)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {event.provider}
                                </div>
                              </div>
                              <div className="mt-2 p-2 bg-purple-50 rounded text-xs text-purple-700">
                                <strong>Family Relevance:</strong> This condition or event may have genetic 
                                or hereditary implications for family members. Consider sharing with 
                                healthcare providers during family medical history discussions.
                              </div>
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

        {/* Event Details Modal */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getEventIcon(selectedEvent.type)}
                  {selectedEvent.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <p className="text-sm">{formatDate(selectedEvent.date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Provider</Label>
                    <p className="text-sm">{selectedEvent.provider}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Location</Label>
                    <p className="text-sm">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Category</Label>
                    <p className="text-sm capitalize">{selectedEvent.category}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm mt-1">{selectedEvent.description}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Severity:</Label>
                    <Badge className={getSeverityColor(selectedEvent.severity)}>
                      {selectedEvent.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Outcome:</Label>
                    <div className="flex items-center gap-1">
                      {getOutcomeIcon(selectedEvent.outcome)}
                      <span className="text-sm capitalize">{selectedEvent.outcome}</span>
                    </div>
                  </div>
                </div>

                {selectedEvent.cost && (
                  <div>
                    <Label className="text-sm font-medium">Cost Information</Label>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                      <div className="text-center p-3 bg-blue-50 rounded">
                        <p className="text-sm text-muted-foreground">Total Cost</p>
                        <p className="font-semibold">{formatCurrency(selectedEvent.cost.total)}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded">
                        <p className="text-sm text-muted-foreground">Insurance</p>
                        <p className="font-semibold">{formatCurrency(selectedEvent.cost.insurance)}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded">
                        <p className="text-sm text-muted-foreground">Out of Pocket</p>
                        <p className="font-semibold">{formatCurrency(selectedEvent.cost.outOfPocket)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedEvent.vitals && (
                  <div>
                    <Label className="text-sm font-medium">Vital Signs</Label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                      {selectedEvent.vitals.bloodPressure && (
                        <div className="text-center p-2 bg-red-50 rounded">
                          <p className="text-xs text-muted-foreground">Blood Pressure</p>
                          <p className="font-medium">{selectedEvent.vitals.bloodPressure}</p>
                        </div>
                      )}
                      {selectedEvent.vitals.heartRate && (
                        <div className="text-center p-2 bg-pink-50 rounded">
                          <p className="text-xs text-muted-foreground">Heart Rate</p>
                          <p className="font-medium">{selectedEvent.vitals.heartRate} bpm</p>
                        </div>
                      )}
                      {selectedEvent.vitals.temperature && (
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <p className="text-xs text-muted-foreground">Temperature</p>
                          <p className="font-medium">{selectedEvent.vitals.temperature}°F</p>
                        </div>
                      )}
                      {selectedEvent.vitals.weight && (
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <p className="text-xs text-muted-foreground">Weight</p>
                          <p className="font-medium">{selectedEvent.vitals.weight} lbs</p>
                        </div>
                      )}
                      {selectedEvent.vitals.height && (
                        <div className="text-center p-2 bg-green-50 rounded">
                          <p className="text-xs text-muted-foreground">Height</p>
                          <p className="font-medium">{selectedEvent.vitals.height} in</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {selectedEvent.labResults && (
                  <div>
                    <Label className="text-sm font-medium">Lab Results</Label>
                    <div className="mt-2 space-y-2">
                      {Object.entries(selectedEvent.labResults).map(([test, result]) => (
                        <div key={test} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <p className="font-medium">{test}</p>
                            <p className="text-sm text-muted-foreground">Normal: {result.normalRange}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{result.value} {result.unit}</p>
                            <Badge className={
                              result.status === 'normal' ? 'bg-green-100 text-green-800' :
                              result.status === 'abnormal' ? 'bg-orange-100 text-orange-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {result.status.toUpperCase()}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedEvent.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Milestone Details Modal */}
        {selectedMilestone && (
          <Dialog open={!!selectedMilestone} onOpenChange={() => setSelectedMilestone(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  {selectedMilestone.title}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Date</Label>
                    <p className="text-sm">{formatDate(selectedMilestone.date)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Age at Event</Label>
                    <p className="text-sm">{selectedMilestone.ageAtEvent}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Type</Label>
                    <p className="text-sm capitalize">{selectedMilestone.type}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Significance</Label>
                    <Badge className={
                      selectedMilestone.significance === 'major' ? 'bg-red-100 text-red-800' :
                      selectedMilestone.significance === 'moderate' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }>
                      {selectedMilestone.significance.toUpperCase()}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm mt-1">{selectedMilestone.description}</p>
                </div>

                {selectedMilestone.familyHistory && (
                  <div className="p-3 bg-purple-50 rounded">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="h-4 w-4 text-purple-600" />
                      <span className="font-medium text-purple-800">Family Health Relevance</span>
                    </div>
                    <p className="text-sm text-purple-700">
                      This milestone may be relevant to family health history and genetic predispositions.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
