import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Heart,
  Activity,
  Zap,
  Target,
  AlertTriangle,
  CheckCircle,
  Brain,
  Calendar,
  Award,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart as PieChartIcon,
  Download,
  Share2,
  RefreshCw,
  Lightbulb,
  Shield,
  Clock
} from "lucide-react";
import {
  mockHealthMetrics,
  mockHealthTrends,
  mockAIRecommendations,
  mockRiskAssessments,
  mockHealthInsights,
  calculateHealthScore,
  getHealthScoreColor,
  getHealthScoreLabel,
  type HealthMetric,
  type AIRecommendation,
  type RiskAssessment,
  type HealthInsight
} from "@/lib/health-analytics-data";

interface HealthInsightsProps {
  patientId?: string;
}

export default function HealthInsights({ patientId = '1' }: HealthInsightsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('6m');
  const [selectedMetricCategory, setSelectedMetricCategory] = useState('all');
  const [selectedChartType, setSelectedChartType] = useState('line');

  const healthScore = calculateHealthScore(mockHealthMetrics);
  const scoreColor = getHealthScoreColor(healthScore);
  const scoreLabel = getHealthScoreLabel(healthScore);

  // Filter metrics by category
  const filteredMetrics = selectedMetricCategory === 'all' 
    ? mockHealthMetrics 
    : mockHealthMetrics.filter(metric => metric.category === selectedMetricCategory);

  // Filter trends by time range
  const getFilteredTrends = () => {
    const now = new Date();
    const monthsBack = selectedTimeRange === '3m' ? 3 : selectedTimeRange === '6m' ? 6 : 12;
    const cutoffDate = new Date(now.setMonth(now.getMonth() - monthsBack));
    
    return mockHealthTrends.filter(trend => new Date(trend.date) >= cutoffDate);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'borderline': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'high':
      case 'low': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600';
      case 'moderate': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'very-high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatTrendData = (metricName: string) => {
    return getFilteredTrends()
      .filter(trend => trend.metric === metricName)
      .map(trend => ({
        date: new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: trend.value,
        fullDate: trend.date
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Health Insights</h1>
            <p className="text-muted-foreground">
              AI-powered analytics and personalized health recommendations
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Health Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Health Score</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray={`${healthScore}, 100`}
                    className={scoreColor}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${scoreColor}`}>{healthScore}</div>
                    <div className="text-xs text-muted-foreground">out of 100</div>
                  </div>
                </div>
              </div>
              <Badge className={`${scoreColor.replace('text-', 'bg-').replace('-600', '-100')} ${scoreColor.replace('-600', '-800')}`}>
                {scoreLabel}
              </Badge>
            </CardContent>
          </Card>

          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Metrics in Normal Range</p>
                    <p className="text-2xl font-bold text-green-600">
                      {mockHealthMetrics.filter(m => m.status === 'normal').length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Improving Trends</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {mockHealthMetrics.filter(m => m.trend === 'improving').length}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">AI Recommendations</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {mockAIRecommendations.length}
                    </p>
                  </div>
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
            <TabsTrigger value="recommendations">AI Recommendations</TabsTrigger>
            <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Health Metrics Grid */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Current Health Metrics</h2>
              <Select value={selectedMetricCategory} onValueChange={setSelectedMetricCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="vitals">Vital Signs</SelectItem>
                  <SelectItem value="labs">Lab Results</SelectItem>
                  <SelectItem value="biometrics">Biometrics</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMetrics.map((metric) => (
                <Card key={metric.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{metric.name}</CardTitle>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(metric.status)}
                        {getTrendIcon(metric.trend)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold">{metric.value}</span>
                        <span className="text-sm text-muted-foreground">{metric.unit}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Normal Range</span>
                          <span>{metric.normalRange.min} - {metric.normalRange.max}</span>
                        </div>
                        <Progress 
                          value={Math.min(100, Math.max(0, 
                            ((metric.value - metric.normalRange.min) / 
                            (metric.normalRange.max - metric.normalRange.min)) * 100
                          ))} 
                          className="h-2"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className={
                          metric.status === 'normal' ? 'border-green-200 text-green-800' :
                          metric.status === 'borderline' ? 'border-yellow-200 text-yellow-800' :
                          'border-red-200 text-red-800'
                        }>
                          {metric.status.toUpperCase()}
                        </Badge>
                        <span className="text-muted-foreground">
                          {new Date(metric.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Health Insights */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Health Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockHealthInsights.map((insight) => (
                  <Card key={insight.id} className={`border-l-4 ${
                    insight.impact === 'positive' ? 'border-l-green-500' :
                    insight.impact === 'negative' ? 'border-l-red-500' :
                    'border-l-blue-500'
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{insight.title}</CardTitle>
                        <Badge variant="outline" className={
                          insight.type === 'achievement' ? 'border-green-200 text-green-800' :
                          insight.type === 'concern' ? 'border-red-200 text-red-800' :
                          insight.type === 'trend' ? 'border-blue-200 text-blue-800' :
                          'border-purple-200 text-purple-800'
                        }>
                          {insight.type}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          Confidence: {insight.confidence}%
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(insight.generatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Health Trends Analysis</h2>
              <div className="flex items-center gap-2">
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3m">3 Months</SelectItem>
                    <SelectItem value="6m">6 Months</SelectItem>
                    <SelectItem value="12m">12 Months</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedChartType} onValueChange={setSelectedChartType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Blood Pressure Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Blood Pressure Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    {selectedChartType === 'area' ? (
                      <AreaChart data={formatTrendData('bp-systolic')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                      </AreaChart>
                    ) : selectedChartType === 'bar' ? (
                      <BarChart data={formatTrendData('bp-systolic')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#3B82F6" />
                      </BarChart>
                    ) : (
                      <LineChart data={formatTrendData('bp-systolic')}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Cholesterol Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Cholesterol Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={formatTrendData('cholesterol-total')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Weight/BMI Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weight & BMI Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={formatTrendData('weight')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#F59E0B" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Glucose Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Glucose Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={formatTrendData('glucose')}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#8B5CF6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">AI-Powered Health Recommendations</h2>
              <Badge className="bg-purple-100 text-purple-800">
                <Brain className="h-3 w-3 mr-1" />
                AI Generated
              </Badge>
            </div>

            <div className="space-y-4">
              {mockAIRecommendations.map((recommendation) => (
                <Card key={recommendation.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{recommendation.title}</CardTitle>
                          <Badge className={getPriorityColor(recommendation.priority)}>
                            {recommendation.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Lightbulb className="h-4 w-4" />
                        {recommendation.confidence}% confidence
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Action Items:</h4>
                      <ul className="space-y-1">
                        {recommendation.actionItems.map((item, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Expected Impact:</span>
                        <p>{recommendation.expectedImpact}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Timeframe:</span>
                        <p>{recommendation.timeframe}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Category:</span>
                        <p>{recommendation.category}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-muted-foreground text-sm">Based on:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {recommendation.basedOn.map((factor, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {factor}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="risks" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Health Risk Assessments</h2>
              <Badge className="bg-orange-100 text-orange-800">
                <Shield className="h-3 w-3 mr-1" />
                Risk Analysis
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockRiskAssessments.map((assessment) => (
                <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{assessment.condition}</CardTitle>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getRiskColor(assessment.riskLevel)}`}>
                          {assessment.riskScore}%
                        </div>
                        <Badge className={`${getRiskColor(assessment.riskLevel).replace('text-', 'bg-').replace('-600', '-100')} ${getRiskColor(assessment.riskLevel).replace('-600', '-800')}`}>
                          {assessment.riskLevel.replace('-', ' ').toUpperCase()} RISK
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-3">Risk Factors:</h4>
                      <div className="space-y-2">
                        {assessment.factors.map((factor, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              {factor.impact === 'positive' ? (
                                <ArrowDown className="h-3 w-3 text-green-600" />
                              ) : (
                                <ArrowUp className="h-3 w-3 text-red-600" />
                              )}
                              {factor.factor}
                            </span>
                            <span className={factor.impact === 'positive' ? 'text-green-600' : 'text-red-600'}>
                              {factor.impact === 'positive' ? '-' : '+'}{Math.abs(factor.weight)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Recommendations:</h4>
                      <ul className="space-y-1">
                        {assessment.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm">
                            <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {assessment.nextScreening && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Next screening: {new Date(assessment.nextScreening).toLocaleDateString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
