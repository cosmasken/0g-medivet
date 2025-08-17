import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  FileText,
  Plus,
  X,
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Stethoscope
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/useUpload';
import { useFees } from '@/hooks/useFees';
import { useWallet } from '@/hooks/useWallet';
import { createBlob, generateMerkleTree, createSubmission } from '@/lib/0g/blob';
import toast from 'react-hot-toast';

// Medical record templates
interface MedicalRecord {
  id: string;
  type: 'visit' | 'prescription' | 'lab' | 'diagnosis' | 'custom';
  title: string;
  data: Record<string, any>;
  category?: string;
  description?: string;
}

interface MedicalTextUploadProps {
  onUploadComplete?: (record: MedicalRecord & { txHash: string; rootHash: string }) => void;
  onError?: (error: string) => void;
  className?: string;
}

const MedicalTextUpload: React.FC<MedicalTextUploadProps> = ({
  onUploadComplete,
  onError,
  className
}) => {
  const [activeRecord, setActiveRecord] = useState<MedicalRecord | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { address } = useWallet();
  const { loading, error, uploadStatus, txHash, uploadFile, resetUploadState } = useUpload();
  const { storageFee, flowContract, loading: feesLoading } = useFees();

  // Medical record templates
  const recordTemplates = {
    visit: {
      type: 'visit' as const,
      title: 'Medical Visit',
      fields: [
        { key: 'visitDate', label: 'Visit Date', type: 'date', required: true },
        { key: 'provider', label: 'Healthcare Provider', type: 'text', required: true },
        { key: 'chiefComplaint', label: 'Chief Complaint', type: 'textarea', required: true },
        { key: 'symptoms', label: 'Symptoms', type: 'textarea', required: false },
        { key: 'diagnosis', label: 'Diagnosis', type: 'textarea', required: false },
        { key: 'treatment', label: 'Treatment Plan', type: 'textarea', required: false },
        { key: 'notes', label: 'Additional Notes', type: 'textarea', required: false }
      ]
    },
    prescription: {
      type: 'prescription' as const,
      title: 'Prescription',
      fields: [
        { key: 'prescriptionDate', label: 'Prescription Date', type: 'date', required: true },
        { key: 'provider', label: 'Prescribing Provider', type: 'text', required: true },
        { key: 'medication', label: 'Medication Name', type: 'text', required: true },
        { key: 'dosage', label: 'Dosage', type: 'text', required: true },
        { key: 'frequency', label: 'Frequency', type: 'text', required: true },
        { key: 'duration', label: 'Duration', type: 'text', required: false },
        { key: 'instructions', label: 'Special Instructions', type: 'textarea', required: false }
      ]
    },
    lab: {
      type: 'lab' as const,
      title: 'Lab Results',
      fields: [
        { key: 'testDate', label: 'Test Date', type: 'date', required: true },
        { key: 'labName', label: 'Laboratory', type: 'text', required: true },
        { key: 'testName', label: 'Test Name', type: 'text', required: true },
        { key: 'results', label: 'Results', type: 'textarea', required: true },
        { key: 'referenceRange', label: 'Reference Range', type: 'text', required: false },
        { key: 'interpretation', label: 'Interpretation', type: 'textarea', required: false }
      ]
    },
    diagnosis: {
      type: 'diagnosis' as const,
      title: 'Diagnosis Record',
      fields: [
        { key: 'diagnosisDate', label: 'Diagnosis Date', type: 'date', required: true },
        { key: 'provider', label: 'Healthcare Provider', type: 'text', required: true },
        { key: 'primaryDiagnosis', label: 'Primary Diagnosis', type: 'text', required: true },
        { key: 'icdCode', label: 'ICD-10 Code', type: 'text', required: false },
        { key: 'severity', label: 'Severity', type: 'text', required: false },
        { key: 'symptoms', label: 'Presenting Symptoms', type: 'textarea', required: false },
        { key: 'treatmentPlan', label: 'Treatment Plan', type: 'textarea', required: false }
      ]
    },
    custom: {
      type: 'custom' as const,
      title: 'Custom Medical Record',
      fields: [
        { key: 'recordDate', label: 'Record Date', type: 'date', required: true },
        { key: 'title', label: 'Record Title', type: 'text', required: true },
        { key: 'content', label: 'Record Content', type: 'textarea', required: true },
        { key: 'category', label: 'Category', type: 'text', required: false },
        { key: 'tags', label: 'Tags (comma separated)', type: 'text', required: false }
      ]
    }
  };

  // Create new record from template
  const createNewRecord = (type: keyof typeof recordTemplates) => {
    const template = recordTemplates[type];
    const newRecord: MedicalRecord = {
      id: `${type}-${Date.now()}`,
      type,
      title: template.title,
      data: {},
      category: type.charAt(0).toUpperCase() + type.slice(1)
    };
    setActiveRecord(newRecord);
  };

  // Update record data
  const updateRecordData = (key: string, value: string) => {
    if (!activeRecord) return;
    setActiveRecord({
      ...activeRecord,
      data: { ...activeRecord.data, [key]: value }
    });
  };

  // Update record metadata
  const updateRecordMeta = (field: string, value: string) => {
    if (!activeRecord) return;
    setActiveRecord({
      ...activeRecord,
      [field]: value
    });
  };

  // Validate record
  const validateRecord = (): string | null => {
    if (!activeRecord) return 'No record selected';
    
    const template = recordTemplates[activeRecord.type];
    const requiredFields = template.fields.filter(f => f.required);
    
    for (const field of requiredFields) {
      if (!activeRecord.data[field.key] || activeRecord.data[field.key].trim() === '') {
        return `${field.label} is required`;
      }
    }
    
    return null;
  };

  // Upload record to 0G Storage
  const uploadRecord = async () => {
    if (!activeRecord || !address || !flowContract || storageFee === null) {
      toast.error('Missing required data for upload');
      return;
    }

    const validationError = validateRecord();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      // Create JSON data with metadata
      const recordData = {
        ...activeRecord,
        uploadDate: new Date().toISOString(),
        walletAddress: address,
        version: '1.0',
        schema: 'MediVet-Medical-Record'
      };

      // Convert to JSON and create file
      const jsonString = JSON.stringify(recordData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], `medical-record-${activeRecord.id}.json`, {
        type: 'application/json'
      });

      setUploadProgress(30);

      // Create 0G blob
      const zgBlob = createBlob(file);
      
      // Generate merkle tree
      setUploadProgress(50);
      const [tree, treeErr] = await generateMerkleTree(zgBlob);
      if (!tree) {
        throw new Error(`Merkle tree generation failed: ${treeErr?.message}`);
      }

      // Create submission
      setUploadProgress(60);
      const [submission, submissionErr] = await createSubmission(zgBlob);
      if (!submission) {
        throw new Error(`Submission creation failed: ${submissionErr?.message}`);
      }

      // Upload file
      setUploadProgress(80);
      const resultTxHash = await uploadFile(zgBlob, submission, flowContract, storageFee);
      
      if (!resultTxHash) {
        throw new Error('Upload failed');
      }

      // Get root hash from tree
      const rootHash = tree.rootHash();
      
      setUploadProgress(100);

      // Notify parent component
      if (onUploadComplete) {
        onUploadComplete({
          ...activeRecord,
          txHash: resultTxHash,
          rootHash
        });
      }

      toast.success(`${activeRecord.title} uploaded successfully!`);
      
      // Reset state
      setActiveRecord(null);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Upload failed: ${errorMessage}`);
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
      resetUploadState();
    }
  };

  const renderField = (field: any) => {
    const value = activeRecord?.data[field.key] || '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.key}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => updateRecordData(field.key, e.target.value)}
            rows={3}
          />
        );
      case 'date':
        return (
          <Input
            id={field.key}
            type="date"
            value={value}
            onChange={(e) => updateRecordData(field.key, e.target.value)}
          />
        );
      default:
        return (
          <Input
            id={field.key}
            type="text"
            placeholder={`Enter ${field.label.toLowerCase()}`}
            value={value}
            onChange={(e) => updateRecordData(field.key, e.target.value)}
          />
        );
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Template Selection */}
      {!activeRecord && (
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle>Create Medical Record</CardTitle>
                <CardDescription>
                  Upload structured medical data to 0G Storage as JSON records
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(recordTemplates).map(([type, template]) => (
                <Card
                  key={type}
                  className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg border-primary/20 hover:border-primary/40"
                  onClick={() => createNewRecord(type as keyof typeof recordTemplates)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Stethoscope className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{template.title}</CardTitle>
                      </div>
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-sm">
                      {template.fields.length} fields • {template.fields.filter(f => f.required).length} required
                    </CardDescription>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.fields.slice(0, 3).map(field => (
                        <Badge key={field.key} variant="outline" className="text-xs">
                          {field.label}
                        </Badge>
                      ))}
                      {template.fields.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{template.fields.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Status */}
            {(feesLoading || !address) && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {!address ? 'Please connect your wallet to upload records' : 'Loading upload fees...'}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Record Editor */}
      {activeRecord && (
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle>{activeRecord.title}</CardTitle>
                  <CardDescription>
                    Fill in the required fields and upload to 0G Storage
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setActiveRecord(null)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={uploadRecord}
                  disabled={uploading || !address || feesLoading || storageFee === null}
                  className="ai-gradient zero-g-glow"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload Record
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recordCategory">Category (Optional)</Label>
                <Input
                  id="recordCategory"
                  placeholder="e.g., Cardiology, Emergency"
                  value={activeRecord.category || ''}
                  onChange={(e) => updateRecordMeta('category', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="recordDescription">Description (Optional)</Label>
                <Input
                  id="recordDescription"
                  placeholder="Brief description of this record"
                  value={activeRecord.description || ''}
                  onChange={(e) => updateRecordMeta('description', e.target.value)}
                />
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <h4 className="font-semibold">Record Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recordTemplates[activeRecord.type].fields.map(field => (
                  <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                    <Label htmlFor={field.key} className="flex items-center space-x-1">
                      <span>{field.label}</span>
                      {field.required && <span className="text-destructive">*</span>}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>{uploadStatus || 'Uploading record...'}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert className="bg-destructive/10 border-destructive/20">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalTextUpload;
