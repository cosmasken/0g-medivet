import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Brain, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Zap, Stethoscope } from 'lucide-react';
import EnhancedAnalysisModal from './EnhancedAnalysisModal';
import { useAuthStore } from '@/stores/authStore';

interface AIAnalysisResult {
  analysis: string;
  confidence?: number;
  timestamp: string;
  provider?: string;
  isValid?: boolean;
  jobId?: string;
  computeTime?: number;
}

interface AIAnalysisDisplayProps {
  analysis: AIAnalysisResult;
  compact?: boolean;
  fileData?: {
    id: string;
    name: string;
    type: string;
    category: string;
  };
}

const AIAnalysisDisplay = ({ analysis, compact = false, fileData }: AIAnalysisDisplayProps) => {
  const { currentUser } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);

  const confidence = analysis.confidence || 0.85; // Default confidence if not provided

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
          <Badge variant="outline" className={getConfidenceColor(confidence)}>
            {getConfidenceLabel(confidence)}
          </Badge>
        </div>
        <p className="text-xs text-blue-700 mt-1 truncate">
          {analysis.analysis.substring(0, 100)}...
        </p>
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-blue-600" />
            AI Analysis Results
            {analysis.isValid && <CheckCircle className="h-4 w-4 text-green-600" />}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={getConfidenceColor(confidence)}>
              {getConfidenceLabel(confidence)} Confidence
            </Badge>
            {currentUser?.role === 'provider' && fileData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEnhancedModal(true)}
                className="flex items-center gap-1"
              >
                <Stethoscope className="h-3 w-3" />
                Enhanced Analysis
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Generated: {new Date(analysis.timestamp).toLocaleString()}</span>
          {analysis.computeTime && (
            <span>Compute Time: {analysis.computeTime}ms</span>
          )}
          {analysis.provider && (
            <span>Provider: {analysis.provider.slice(0, 8)}...{analysis.provider.slice(-6)}</span>
          )}
        </div>

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <span className="text-left">
                {isExpanded ? 'Hide Analysis' : 'Show Full Analysis'}
              </span>
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {analysis.analysis}
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {!isExpanded && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 line-clamp-3">
              {analysis.analysis.substring(0, 200)}...
            </p>
          </div>
        )}

        {analysis.jobId && (
          <div className="text-xs text-muted-foreground">
            Job ID: {analysis.jobId}
          </div>
        )}
      </CardContent>

      {fileData && (
        <EnhancedAnalysisModal
          isOpen={showEnhancedModal}
          onClose={() => setShowEnhancedModal(false)}
          fileData={fileData}
          patientId={currentUser?.id || ''}
          onAnalysisComplete={(result) => {
            console.log('Enhanced analysis completed:', result);
            setShowEnhancedModal(false);
          }}
        />
      )}
    </Card>
  );
};

export default AIAnalysisDisplay;
