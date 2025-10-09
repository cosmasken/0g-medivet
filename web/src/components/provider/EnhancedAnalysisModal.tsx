import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, FileText, Zap, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';

interface EnhancedAnalysisModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientRecords?: any[];
}

export function EnhancedAnalysisModal({ open, onOpenChange, patientRecords = [] }: EnhancedAnalysisModalProps) {
  const [selectedRecord, setSelectedRecord] = useState('');
  const [analysisType, setAnalysisType] = useState('general');
  const [clinicalContext, setClinicalContext] = useState('');
  const { analyzeFile, loading, error, result, progress } = useAIAnalysis();

  const analysisTypes = [
    { value: 'general', label: 'General Medical Analysis', description: 'Comprehensive medical review' },
    { value: 'radiology', label: 'Radiology Analysis', description: 'X-ray, CT, MRI interpretation' },
    { value: 'laboratory', label: 'Lab Results Analysis', description: 'Blood work and lab interpretation' },
    { value: 'cardiology', label: 'Cardiology Analysis', description: 'Heart and cardiovascular assessment' },
    { value: 'pathology', label: 'Pathology Review', description: 'Tissue and cellular analysis' },
    { value: 'differential', label: 'Differential Diagnosis', description: 'Multiple condition assessment' }
  ];

  const handleRunAnalysis = async () => {
    if (!selectedRecord) return;

    const record = patientRecords.find(r => r.id === selectedRecord);
    if (!record) return;

    try {
      // TODO: Implement enhanced provider analysis with clinical context
      await analyzeFile(
        {
          recordId: selectedRecord,
          analysisType,
          clinicalContext,
          providerSpecialty: 'general', // TODO: Get from provider profile
        },
        'enhanced-medical-analysis',
        record.patient_id,
        selectedRecord
      );
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Enhanced AI Analysis
          </DialogTitle>
          <DialogDescription>
            Run advanced AI analysis on patient records with clinical context
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Record Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Patient Record</label>
            <Select value={selectedRecord} onValueChange={setSelectedRecord}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a medical record to analyze" />
              </SelectTrigger>
              <SelectContent>
                {patientRecords.map((record) => (
                  <SelectItem key={record.id} value={record.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{record.title} - {record.patient?.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Analysis Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Analysis Type</label>
            <Select value={analysisType} onValueChange={setAnalysisType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {analysisTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-xs text-muted-foreground">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clinical Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Clinical Context (Optional)</label>
            <Textarea
              placeholder="Provide additional clinical context, symptoms, or specific questions for the AI analysis..."
              value={clinicalContext}
              onChange={(e) => setClinicalContext(e.target.value)}
              rows={3}
            />
          </div>

          {/* Analysis Progress */}
          {loading && (
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600 animate-pulse" />
                <span className="font-medium">Running AI Analysis...</span>
              </div>
              <Progress value={progress} className="w-full" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Processing medical data with 0G Compute Network</span>
              </div>
            </div>
          )}

          {/* Analysis Result */}
          {result && (
            <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Analysis Complete</span>
                <Badge variant="secondary">
                  {result.computeTime ? `${result.computeTime}ms` : 'Fast'}
                </Badge>
              </div>
              
              <div className="prose prose-sm max-w-none">
                <div className="bg-white p-4 rounded border">
                  <h4 className="font-medium mb-2">AI Medical Analysis</h4>
                  <p className="text-sm leading-relaxed">{result.analysis}</p>
                </div>
              </div>

              {/* Analysis Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Analysis Type:</span>
                  <span className="ml-2 capitalize">{analysisType}</span>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>
                  <span className="ml-2">{result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'High'}</span>
                </div>
                <div>
                  <span className="font-medium">Provider:</span>
                  <span className="ml-2">{result.provider || '0G Compute'}</span>
                </div>
                <div>
                  <span className="font-medium">Timestamp:</span>
                  <span className="ml-2">{new Date(result.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Analysis Failed</span>
              </div>
              <p className="text-sm text-red-700 mt-2">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <div className="flex gap-2">
              {result && (
                <Button variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              )}
              <Button 
                onClick={handleRunAnalysis} 
                disabled={!selectedRecord || loading}
              >
                <Zap className="h-4 w-4 mr-2" />
                {loading ? 'Analyzing...' : 'Run Analysis'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
