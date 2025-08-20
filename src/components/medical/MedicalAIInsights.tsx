import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Brain,
  Activity,
  TrendingUp,
  Shield,
  FileText,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Stethoscope,
  Target,
  RefreshCw,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MedicalInsight, MedicalAnalysisResult } from '@/lib/ai/medicalAI';
import { useMedicalAI } from '@/hooks/useMedicalAI';

interface MedicalAIInsightsProps {
  className?: string;
}

const MedicalAIInsights: React.FC<MedicalAIInsightsProps> = ({ className }) => {
  const {
    isLoading,
    isInitialized,
    error,
    insights,
    analysisResults,
    balance,
    initializeAI,
    getBalance,
    addFunds,
    clearError,
    clearResults
  } = useMedicalAI();

  const [showBalance, setShowBalance] = useState(false);

  // Get insight icon based on type
  const getInsightIcon = (type: MedicalInsight['type']) => {
    switch (type) {
      case 'risk_assessment':
        return AlertTriangle;
      case 'treatment_suggestion':
        return Stethoscope;
      case 'diagnostic_insight':
        return Activity;
      case 'preventive_care':
        return Shield;
      default:
        return FileText;
    }
  };

  // Get insight color based on type
  const getInsightColor = (type: MedicalInsight['type']) => {
    switch (type) {
      case 'risk_assessment':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'treatment_suggestion':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'diagnostic_insight':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'preventive_care':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Get confidence color
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  // Handle initialization
  const handleInitialize = async () => {
    try {
      await initializeAI();
      await getBalance();
    } catch (error) {
      console.error('Failed to initialize AI:', error);
    }
  };

  // Handle add funds
  const handleAddFunds = async (amount: number) => {
    try {
      await addFunds(amount);
    } catch (error) {
      console.error('Failed to add funds:', error);
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle>AI Medical Insights</CardTitle>
                <CardDescription>
                  Powered by 0G Compute Network - Advanced AI analysis for medical data
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isInitialized && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                >
                  <DollarSign className="h-4 w-4 mr-1" />
                  Balance
                </Button>
              )}
              {!isInitialized ? (
                <Button onClick={handleInitialize} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="h-4 w-4 mr-2" />
                  )}
                  Initialize AI
                </Button>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  AI Ready
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Error Display */}
        {error && (
          <CardContent>
            <Alert className="bg-destructive/10 border-destructive/20">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{error}</span>
                <Button variant="ghost" size="sm" onClick={clearError}>
                  <X className="h-4 w-4" />
                </Button>
              </AlertDescription>
            </Alert>
          </CardContent>
        )}

        {/* Balance Display */}
        {showBalance && balance && (
          <CardContent>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium">AI Account Balance</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Available Balance:</span>
                  <p className="font-semibold">
                    {balance.ledgerInfo ? 
                      `${parseFloat(balance.ledgerInfo[0] || '0') / 1e18} ETH` : 
                      'Loading...'
                    }
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => handleAddFunds(0.01)}>
                    Add 0.01 ETH
                  </Button>
                  <Button size="sm" onClick={() => handleAddFunds(0.1)}>
                    Add 0.1 ETH
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 ai-gradient rounded-full flex items-center justify-center zero-g-glow animate-pulse">
                <Brain className="h-6 w-6 text-white animate-pulse" />
              </div>
              <div className="text-center">
                <p className="font-medium">AI Analysis in Progress</p>
                <p className="text-sm text-muted-foreground">Processing medical data...</p>
              </div>
              <div className="w-full max-w-xs">
                <Progress value={60} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {analysisResults && insights.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Analysis Results</span>
                </CardTitle>
                <CardDescription>
                  AI-powered insights and recommendations
                </CardDescription>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  {analysisResults.processingTime}ms
                </div>
                <div className="text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  {analysisResults.cost} ETH
                </div>
                <Button variant="outline" size="sm" onClick={clearResults}>
                  Clear
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="insights" className="space-y-4">
              <TabsList>
                <TabsTrigger value="insights" className="flex items-center space-x-2">
                  <Brain className="h-4 w-4" />
                  <span>Insights</span>
                </TabsTrigger>
                <TabsTrigger value="summary" className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Summary</span>
                </TabsTrigger>
                <TabsTrigger value="recommendations" className="flex items-center space-x-2">
                  <Target className="h-4 w-4" />
                  <span>Recommendations</span>
                </TabsTrigger>
              </TabsList>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-4">
                {insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type);
                  const colorClass = getInsightColor(insight.type);
                  const confidenceClass = getConfidenceColor(insight.confidence);

                  return (
                    <div
                      key={index}
                      className={cn(
                        "border rounded-lg p-4 space-y-3",
                        colorClass
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div>
                            <h4 className="font-medium capitalize">
                              {insight.title}
                            </h4>
                            <Badge variant="outline" className="text-xs capitalize mt-1">
                              {insight.type.replace('_', ' ')}
                            </Badge>
                          </div>
                        </div>
                        <Badge className={cn("text-xs", confidenceClass)}>
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>

                      <p className="text-sm leading-relaxed pl-8">
                        {insight.content}
                      </p>

                      <div className="flex items-center justify-between pl-8 text-xs text-muted-foreground">
                        <span>Source: {insight.source}</span>
                        <span>{insight.timestamp.toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              {/* Summary Tab */}
              <TabsContent value="summary" className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Analysis Summary
                  </h4>
                  <p className="text-sm leading-relaxed">
                    {analysisResults.summary}
                  </p>
                </div>

                {analysisResults.riskFactors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium mb-2 flex items-center text-red-700">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Risk Factors
                    </h4>
                    <ul className="space-y-1">
                      {analysisResults.riskFactors.map((risk, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-center">
                          <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </TabsContent>

              {/* Recommendations Tab */}
              <TabsContent value="recommendations" className="space-y-4">
                {analysisResults.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {analysisResults.recommendations.map((recommendation, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start space-x-3"
                      >
                        <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm text-blue-700 leading-relaxed">
                            {recommendation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No specific recommendations available</p>
                    <p className="text-sm">Upload medical files to get personalized recommendations</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!isLoading && !analysisResults && isInitialized && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 ai-gradient rounded-full flex items-center justify-center zero-g-glow mx-auto">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-medium">AI Ready for Analysis</h3>
                <p className="text-muted-foreground">
                  Upload medical files or patient data to get AI-powered insights
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medical Disclaimer */}
      {(analysisResults || isInitialized) && (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Medical Disclaimer:</strong> AI insights are for educational purposes only and should not replace professional medical advice. 
            Always consult with qualified healthcare providers for diagnosis and treatment decisions.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MedicalAIInsights;
