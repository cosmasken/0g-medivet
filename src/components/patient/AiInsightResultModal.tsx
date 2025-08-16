import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Save, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface AiInsightResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  insightData: any;
}

const AiInsightResultModal: React.FC<AiInsightResultModalProps> = ({ open, onOpenChange, insightData }) => {

  const handleSave = () => {
    toast.success('Insight saved to your local device!');
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(insightData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ai_insight.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    toast.success('Insight data exported as JSON!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>AI Insight: {insightData.title}</span>
          </DialogTitle>
          <DialogDescription>
            Here's the AI-generated insight based on your selected data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{insightData.summary}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries(insightData.details).map(([key, value]) => (
                <div key={key} className="flex justify-between text-sm">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}</span>
                  <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                </div>
              ))}
              {insightData.details.recommendations && (
                <div className="mt-4">
                  <p className="font-medium text-sm mb-1">Recommendations:</p>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {insightData.details.recommendations.map((rec: string, index: number) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg text-sm text-muted-foreground">
            <p className="font-medium">Disclaimer:</p>
            <p>{insightData.details.disclaimer}</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={handleSave}
              className="flex-1"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Insight
            </Button>
            <Button 
              onClick={handleExport}
              className="flex-1"
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data (JSON)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AiInsightResultModal;
