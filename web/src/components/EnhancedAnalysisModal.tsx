import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useAIAnalysis } from '@/hooks/useAIAnalysis';
import { useAuthStore } from '@/stores/authStore';
import { Brain, Stethoscope, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface EnhancedAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileData: {
    id: string;
    name: string;
    type: string;
    category: string;
  };
  patientId: string;
  onAnalysisComplete?: (result: any) => void;
}

const EnhancedAnalysisModal = ({
  isOpen,
  onClose,
  fileData,
  patientId,
  onAnalysisComplete
}: EnhancedAnalysisModalProps) => {
  const { currentUser } = useAuthStore();
  const { analyzeFile, loading, error, result } = useAIAnalysis();
  
  const [analysisType, setAnalysisType] = useState<string>('comprehensive');
  const [specialty, setSpecialty] = useState<string>('general');
  const [clinicalContext, setClinicalContext] = useState<string>('');
  const [urgentAnalysis, setUrgentAnalysis] = useState(false);
  const [patientConsent, setPatientConsent] = useState(false);

  const handleSubmitAnalysis = async () => {
    if (!patientConsent) {
      toast.error('Patient consent is required for enhanced analysis');
      return;
    }

    if (!currentUser || currentUser.role !== 'provider') {
      toast.error('Only healthcare providers can request enhanced analysis');
      return;
    }

    try {
      const enhancedFileData = {
        ...fileData,
        analysisParameters: {
          type: analysisType,
          specialty,
          clinicalContext,
          urgent: urgentAnalysis,
          providerId: currentUser.id,
          patientId
        }
      };

      const analysisResult = await analyzeFile(
        enhancedFileData,
        'enhanced-analysis',
        currentUser.id
      );

      toast.success('Enhanced analysis completed!');
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
      
      onClose();
    } catch (err) {
      console.error('Enhanced analysis failed:', err);
      toast.error('Enhanced analysis failed. Please try again.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Enhanced AI Analysis
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">File Details</h3>
            <p className="text-sm text-gray-600">{fileData.name}</p>
            <p className="text-sm text-gray-600">Category: {fileData.category}</p>
          </div>

          {/* Analysis Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="analysis-type">Analysis Type</Label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                  <SelectItem value="diagnostic">Diagnostic Focus</SelectItem>
                  <SelectItem value="risk-assessment">Risk Assessment</SelectItem>
                  <SelectItem value="treatment-planning">Treatment Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialty">Medical Specialty</Label>
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Medicine</SelectItem>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="radiology">Radiology</SelectItem>
                  <SelectItem value="pathology">Pathology</SelectItem>
                  <SelectItem value="oncology">Oncology</SelectItem>
                  <SelectItem value="neurology">Neurology</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="clinical-context">Clinical Context (Optional)</Label>
              <Textarea
                id="clinical-context"
                placeholder="Provide additional clinical context, symptoms, or specific questions for the AI analysis..."
                value={clinicalContext}
                onChange={(e) => setClinicalContext(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="urgent-analysis" className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Urgent Analysis
              </Label>
              <Switch
                id="urgent-analysis"
                checked={urgentAnalysis}
                onCheckedChange={setUrgentAnalysis}
              />
            </div>
          </div>

          {/* Patient Consent */}
          <div className="bg-blue-50 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="patient-consent" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Patient Consent Verified
              </Label>
              <Switch
                id="patient-consent"
                checked={patientConsent}
                onCheckedChange={setPatientConsent}
              />
            </div>
            <p className="text-xs text-gray-600">
              Confirm that the patient has provided consent for enhanced AI analysis of their medical data.
            </p>
          </div>

          {/* Analysis Result */}
          {loading && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span className="text-sm">Running enhanced analysis with 0G Compute...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600">Analysis failed: {error}</p>
            </div>
          )}

          {result && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Enhanced Analysis Complete</span>
              </div>
              <p className="text-sm text-gray-700">{result.analysis}</p>
              <p className="text-xs text-gray-500 mt-2">
                Confidence: {(result.isValid ? 95 : 75)}% | Provider: {result.provider}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAnalysis}
              disabled={loading || !patientConsent}
              className="flex-1"
            >
              <Brain className="h-4 w-4 mr-2" />
              {loading ? 'Analyzing...' : 'Start Enhanced Analysis'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedAnalysisModal;
