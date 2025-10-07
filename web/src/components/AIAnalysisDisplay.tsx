import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brain, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Zap } from 'lucide-react';

interface AIAnalysisResult {
  analysis: string;
  confidence: number;
  timestamp: string;
  provider?: string;
  isValid?: boolean;
  jobId?: string;
}

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResult;
  compact?: boolean;
}

const AIAnalysisDisplay = ({ analysis, compact = false }: AIAnalysisDisplayProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  if (compact) {
    return (
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">AI Analysis Available</span>
            {analysis.isValid && <Zap className="h-3 w-3 text-blue-600" />}
          </div>
          <Badge variant="outline" className={getConfidenceColor(analysis.confidence)}>
            {getConfidenceLabel(analysis.confidence)}
          </Badge>
        </div>
        <p className="text-xs text-blue-700 mt-1 truncate">
          {analysis.analysis.substring(0, 100)}...
        </p>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/50">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-3 cursor-pointer hover:bg-blue-100/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-base">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="text-blue-800">AI Analysis</span>
                {analysis.isValid && (
                  <div className="flex items-center gap-1">
                    <Zap className="h-4 w-4 text-blue-600" />
                    <span className="text-xs text-blue-600">0G Compute</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getConfidenceColor(analysis.confidence)}>
                  {Math.round(analysis.confidence * 100)}% confidence
                </Badge>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-blue-600" />
                )}
              </div>
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="bg-white p-3 rounded border">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {analysis.analysis}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>
                    Generated: {new Date(analysis.timestamp).toLocaleString()}
                  </span>
                  {analysis.provider && (
                    <span>
                      Provider: {analysis.provider.substring(0, 8)}...
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  {analysis.isValid ? (
                    <>
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                      <span className="text-yellow-600">Unverified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AIAnalysisDisplay;
