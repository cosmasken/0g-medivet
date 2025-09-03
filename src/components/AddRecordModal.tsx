import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from './FileUpload';
import { useRecordsStore } from '@/stores/recordsStore';
import { FileText, Upload, Heart, Activity, Pill, Calendar } from 'lucide-react';

interface AddRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const recordTemplates = {
  'blood-test': {
    title: 'Blood Test Results',
    icon: Activity,
    fields: {
      title: 'Blood Test - {date}',
      description: 'Complete blood count and metabolic panel results',
      template: `Test Date: {date}
Lab: {lab_name}
Ordered by: {doctor_name}

COMPLETE BLOOD COUNT (CBC):
- White Blood Cells: {wbc} (Normal: 4.5-11.0 K/uL)
- Red Blood Cells: {rbc} (Normal: 4.2-5.4 M/uL)
- Hemoglobin: {hemoglobin} (Normal: 12.0-15.5 g/dL)
- Hematocrit: {hematocrit} (Normal: 36-46%)
- Platelets: {platelets} (Normal: 150-450 K/uL)

BASIC METABOLIC PANEL:
- Glucose: {glucose} (Normal: 70-100 mg/dL)
- Sodium: {sodium} (Normal: 136-145 mEq/L)
- Potassium: {potassium} (Normal: 3.5-5.0 mEq/L)
- Chloride: {chloride} (Normal: 98-107 mEq/L)
- BUN: {bun} (Normal: 7-20 mg/dL)
- Creatinine: {creatinine} (Normal: 0.6-1.2 mg/dL)

Notes: {notes}`
    }
  },
  'visit': {
    title: 'Doctor Visit',
    icon: Heart,
    fields: {
      title: 'Visit - Dr. {doctor_name}',
      description: 'Medical consultation and examination',
      template: `Visit Date: {date}
Provider: Dr. {doctor_name}
Specialty: {specialty}
Location: {location}

CHIEF COMPLAINT:
{chief_complaint}

VITAL SIGNS:
- Blood Pressure: {bp_systolic}/{bp_diastolic} mmHg
- Heart Rate: {heart_rate} bpm
- Temperature: {temperature}°F
- Weight: {weight} lbs
- Height: {height} inches

ASSESSMENT:
{assessment}

PLAN:
{plan}

MEDICATIONS PRESCRIBED:
{medications}

FOLLOW-UP:
{followup}`
    }
  },
  'medication': {
    title: 'Medication Record',
    icon: Pill,
    fields: {
      title: 'Medication - {medication_name}',
      description: 'Prescription and medication details',
      template: `Medication: {medication_name}
Prescribed Date: {date}
Prescribing Doctor: Dr. {doctor_name}

PRESCRIPTION DETAILS:
- Dosage: {dosage}
- Frequency: {frequency}
- Duration: {duration}
- Quantity: {quantity}
- Refills: {refills}

INDICATIONS:
{indications}

INSTRUCTIONS:
{instructions}

SIDE EFFECTS TO MONITOR:
{side_effects}

NOTES:
{notes}`
    }
  },
  'procedure': {
    title: 'Medical Procedure',
    icon: Calendar,
    fields: {
      title: 'Procedure - {procedure_name}',
      description: 'Medical procedure or surgery record',
      template: `Procedure: {procedure_name}
Date: {date}
Provider: Dr. {doctor_name}
Location: {location}

PRE-PROCEDURE:
- Indication: {indication}
- Pre-op Instructions: {preop_instructions}

PROCEDURE DETAILS:
- Start Time: {start_time}
- End Time: {end_time}
- Anesthesia: {anesthesia}
- Complications: {complications}

POST-PROCEDURE:
- Recovery Notes: {recovery_notes}
- Discharge Instructions: {discharge_instructions}
- Follow-up: {followup}

RESULTS:
{results}`
    }
  }
};

export function AddRecordModal({ open, onOpenChange }: AddRecordModalProps) {
  const { addTextRecord } = useRecordsStore();
  const [recordType, setRecordType] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: ''
  });

  const handleTemplateSelect = (type: string) => {
    setRecordType(type);
    const template = recordTemplates[type as keyof typeof recordTemplates];
    setFormData({
      title: template.fields.title,
      description: template.fields.description,
      content: template.fields.template,
      category: template.title
    });
  };

  const handleSave = () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Please fill in title and content');
      return;
    }
    
    addTextRecord({
      title: formData.title,
      description: formData.description,
      content: formData.content,
      category: formData.category || 'General'
    });
    
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setRecordType('');
    setFormData({ title: '', description: '', content: '', category: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Add Medical Record
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="text">Text Record</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="text" className="space-y-4">
            {!recordType ? (
              <div>
                <h3 className="text-lg font-medium mb-4">Choose Record Type</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(recordTemplates).map(([key, template]) => {
                    const IconComponent = template.icon;
                    return (
                      <Card 
                        key={key} 
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleTemplateSelect(key)}
                      >
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <IconComponent className="h-5 w-5" />
                            {template.title}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {recordTemplates[recordType as keyof typeof recordTemplates].title}
                  </h3>
                  <Button variant="outline" onClick={handleReset}>
                    Change Type
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Record title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="Record category"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description"
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    placeholder="Record details"
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Fill in the template fields (e.g., replace {`{date}`} with actual date)
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    Save Record
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Upload Medical File</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload medical documents, images, lab results, or any other medical files
              </p>
              <FileUpload />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
