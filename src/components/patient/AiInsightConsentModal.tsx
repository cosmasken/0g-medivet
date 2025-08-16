import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Activity, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuditStore } from '@/stores/auditStore';
import { useAuthStore } from '@/stores/authStore';
import { HealthRecord } from '@/types';

interface AiInsightConsentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userRecords: HealthRecord[];
  onInsightGenerated: (insight: any) => void;
}

const AiInsightConsentModal: React.FC<AiInsightConsentModalProps> = ({ open, onOpenChange, userRecords }) => {
  const { addEvent } = useAuditStore(); // Assuming addEvent exists or will be added
  const { currentUser } = useAuthStore();
  const [selectedRecords, setSelectedRecords] = useState<number[]>([]);
  const [generateMockInsight, setGenerateMockInsight] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState('Encrypting...');
  const [aiResult, setAiResult] = useState<any>(null);

  const mockRecordOptions = userRecords.map(record => ({
    id: record.id,
    label: `${record.title} - ${new Date(record.createdAt).toLocaleDateString()}`,
  }));

  const handleCheckboxChange = (recordId: number, checked: boolean) => {
    setSelectedRecords(prev =>
      checked ? [...prev, recordId] : prev.filter(id => id !== recordId)
    );
  };

  const runDemo = async () => {
    setProcessing(true);
    setProgress(0);

    const processingSteps = [
      { caption: 'Accessing selected records...', duration: 500 },
      { caption: 'Applying privacy-preserving techniques...', duration: 800 },
      { caption: 'Running diagnostic algorithms...', duration: 1200 },
      { caption: 'Cross-referencing medical literature...', duration: 700 },
      { caption: 'Generating insights...', duration: 800 },
    ];

    let totalDuration = 0;
    processingSteps.forEach(step => totalDuration += step.duration);

    let currentProgress = 0;
    for (const step of processingSteps) {
      setCaption(step.caption);
      const stepProgress = (step.duration / totalDuration) * 100;

      await new Promise(resolve => setTimeout(resolve, step.duration));
      currentProgress += stepProgress;
      setProgress(Math.min(currentProgress, 100));
    }

    setProcessing(false);
    setProgress(100);

    // Generate mock AI result
    const mockInsightData = {
      title: 'Cholesterol Trend Analysis',
      summary: 'Your cholesterol trend is stable. No action needed. Keep up the good work!',
      details: {
        LDL: 'Stable (100 mg/dL)',
        HDL: 'Good (60 mg/dL)',
        Triglycerides: 'Normal (120 mg/dL)',
        recommendations: ['Continue current diet and exercise.', 'Annual check-up recommended.'],
        data_points_analyzed: selectedRecords.length > 0 ? userRecords.find(r => r.id === selectedRecords[0])?.title : 'N/A',
        disclaimer: 'This is a mock AI insight for demonstration purposes only and should not be used for medical decisions.'
      }
    };
    setAiResult(mockInsightData);
    onInsightGenerated(mockInsightData);

    // Add audit log entry
    if (currentUser) {
      addEvent({
        id: `ai_demo_${Date.now()}`,
        timestamp: Date.now(),
        actor: { id: currentUser.principal, role: currentUser.role, name: currentUser.profile.contact || currentUser.profile.contact },
        action: 'AI_DEMO_MOCK',
        recordId: 0, // N/A for demo
        recordTitle: 'AI Health Insight Demo',
        txHash: 'mock_tx_ai_demo',
        details: { records_hashed: selectedRecords.length, external_call: false, status: 'success', insight_title: mockInsightData.title },
      });
    }

    onOpenChange(false); // Close consent modal
    // Open result modal will be handled by parent component
    setSelectedRecords([]);
    setGenerateMockInsight(true);
    setAiResult(null); // Reset aiResult when modal closes

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>AI Health Insights Demo</span>
            </DialogTitle>
            <DialogDescription>
              Select data to analyze and generate a mock AI insight.
            </DialogDescription>
          </DialogHeader>

          {!processing ? (
            <div className="space-y-4">
              <div>
                <Label>Select Data for Analysis</Label>
                <div className="mt-2 space-y-2">
                  {mockRecordOptions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No records available for analysis.</p>
                  ) : (
                    mockRecordOptions.map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`record-${option.id}`}
                          checked={selectedRecords.includes(option.id)}
                          onCheckedChange={(checked) => handleCheckboxChange(option.id, !!checked)}
                        />
                        <Label htmlFor={`record-${option.id}`}>{option.label}</Label>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                <p>Nothing leaves your browser unencrypted.</p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="generate-mock">Generate mock insight</Label>
                <Switch
                  id="generate-mock"
                  checked={generateMockInsight}
                  onCheckedChange={setGenerateMockInsight}
                />
              </div>

              <Button
                onClick={runDemo}
                className="w-full medical-gradient medical-shadow"
                disabled={selectedRecords.length === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Run Demo
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-lg font-medium text-primary">{caption}</p>
              <div className="w-full bg-secondary rounded-full h-2">
                <div
                  className="medical-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  };
};

export default AiInsightConsentModal;
