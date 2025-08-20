import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Brain,
  Upload,
  FileText,
  Activity,
  Stethoscope,
  User,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Loader2,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MedicalFileUpload from './MedicalFileUpload';
import MedicalAIInsights from './MedicalAIInsights';
import { useMedicalAI } from '@/hooks/useMedicalAI';
import toast from 'react-hot-toast';

interface PatientData {
  age: number;
  gender: string;
  medicalHistory: string[];
  currentSymptoms: string[];
  medications: string[];
  allergies: string[];
  vitalSigns: Record<string, any>;
}

interface MedicalAIAnalysisProps {
  className?: string;
}

const MedicalAIAnalysis: React.FC<MedicalAIAnalysisProps> = ({ className }) => {
  const {
    isLoading,
    isInitialized,
    error,
    analyzeFile,
    generateHealthInsights,
    getTreatmentRecommendations,
    initializeAI
  } = useMedicalAI();

  const [activeTab, setActiveTab] = useState('upload');
  const [patientData, setPatientData] = useState<Partial<PatientData>>({
    age: undefined,
    gender: '',
    medicalHistory: [],
    currentSymptoms: [],
    medications: [],
    allergies: [],
    vitalSigns: {}
  });

  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [patientProfileInput, setPatientProfileInput] = useState('');
  const [treatmentsInput, setTreatmentsInput] = useState('');

  // Handle file analysis when files are uploaded
  const handleFileUploadComplete = useCallback(async (files: any[]) => {
    if (!isInitialized) {
      try {
        await initializeAI();
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        return;
      }
    }

    // Analyze each uploaded file
    for (const uploadedFile of files) {
      try {
        if (uploadedFile.file) {
          const fileContent = await readFileContent(uploadedFile.file);
          const patientContext = patientData.age || patientData.gender ? 
            `Patient: ${patientData.age ? `Age ${patientData.age}` : ''} ${patientData.gender ? patientData.gender : ''}` : 
            undefined;

          await analyzeFile(
            fileContent,
            uploadedFile.file.name,
            uploadedFile.file.type,
            patientContext
          );

          toast.success(`AI analysis completed for ${uploadedFile.file.name}`);
          setActiveTab('insights');
        }
      } catch (error: any) {
        console.error('File analysis failed:', error);
        toast.error(`Analysis failed for ${uploadedFile.file.name}: ${error.message}`);
      }
    }
  }, [isInitialized, analyzeFile, initializeAI, patientData]);

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content || '');
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read as text for simple file types, or as data URL for images
      if (file.type.startsWith('text/') || file.type === 'application/json') {
        reader.readAsText(file);
      } else if (file.type === 'application/pdf') {
        // For PDF files, read as text (this is simplified - you might want to use a PDF parser)
        reader.readAsText(file);
      } else if (file.type.startsWith('image/')) {
        // For images, read as data URL
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  // Handle patient data analysis
  const handlePatientAnalysis = async () => {
    if (!isInitialized) {
      try {
        await initializeAI();
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        return;
      }
    }

    try {
      const cleanedData = {
        ...patientData,
        medicalHistory: Array.isArray(patientData.medicalHistory) ? 
          patientData.medicalHistory : 
          (patientData.medicalHistory as any)?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        currentSymptoms: Array.isArray(patientData.currentSymptoms) ? 
          patientData.currentSymptoms : 
          (patientData.currentSymptoms as any)?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        medications: Array.isArray(patientData.medications) ? 
          patientData.medications : 
          (patientData.medications as any)?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        allergies: Array.isArray(patientData.allergies) ? 
          patientData.allergies : 
          (patientData.allergies as any)?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
      };

      await generateHealthInsights(cleanedData);
      toast.success('Health insights generated successfully!');
      setActiveTab('insights');
    } catch (error: any) {
      console.error('Patient analysis failed:', error);
      toast.error(`Analysis failed: ${error.message}`);
    }
  };

  // Handle treatment recommendations
  const handleTreatmentRecommendations = async () => {
    if (!isInitialized) {
      try {
        await initializeAI();
      } catch (error) {
        console.error('Failed to initialize AI:', error);
        return;
      }
    }

    if (!diagnosisInput || !patientProfileInput) {
      toast.error('Please provide diagnosis and patient profile');
      return;
    }

    try {
      const currentTreatments = treatmentsInput ? 
        treatmentsInput.split(',').map(s => s.trim()).filter(Boolean) : 
        undefined;

      await getTreatmentRecommendations(
        diagnosisInput,
        patientProfileInput,
        currentTreatments
      );
      
      toast.success('Treatment recommendations generated successfully!');
      setActiveTab('insights');
    } catch (error: any) {
      console.error('Treatment recommendations failed:', error);
      toast.error(`Recommendations failed: ${error.message}`);
    }
  };

  // Update patient data field
  const updatePatientData = (field: keyof PatientData, value: any) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle>AI Medical Analysis Platform</CardTitle>
              <CardDescription>
                Upload files, analyze patient data, and get AI-powered medical insights using 0G Compute Network
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="upload" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </TabsTrigger>
          <TabsTrigger value="patient" className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span>Patient Data</span>
          </TabsTrigger>
          <TabsTrigger value="treatment" className="flex items-center space-x-2">
            <Stethoscope className="h-4 w-4" />
            <span>Treatment</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* File Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <MedicalFileUpload 
            onUploadComplete={handleFileUploadComplete}
            className="w-full"
          />
        </TabsContent>

        {/* Patient Data Analysis Tab */}
        <TabsContent value="patient" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Patient Data Analysis</span>
              </CardTitle>
              <CardDescription>
                Enter patient information to get comprehensive health insights and risk assessments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Enter patient age"
                      value={patientData.age || ''}
                      onChange={(e) => updatePatientData('age', e.target.value ? parseInt(e.target.value) : undefined)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Input
                      id="gender"
                      placeholder="Enter gender"
                      value={patientData.gender || ''}
                      onChange={(e) => updatePatientData('gender', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="symptoms">Current Symptoms</Label>
                    <Textarea
                      id="symptoms"
                      placeholder="Enter current symptoms, separated by commas"
                      value={(patientData.currentSymptoms as any) || ''}
                      onChange={(e) => updatePatientData('currentSymptoms', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="history">Medical History</Label>
                    <Textarea
                      id="history"
                      placeholder="Enter medical history, separated by commas"
                      value={(patientData.medicalHistory as any) || ''}
                      onChange={(e) => updatePatientData('medicalHistory', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="medications">Current Medications</Label>
                    <Textarea
                      id="medications"
                      placeholder="Enter current medications, separated by commas"
                      value={(patientData.medications as any) || ''}
                      onChange={(e) => updatePatientData('medications', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="allergies">Known Allergies</Label>
                    <Textarea
                      id="allergies"
                      placeholder="Enter known allergies, separated by commas"
                      value={(patientData.allergies as any) || ''}
                      onChange={(e) => updatePatientData('allergies', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handlePatientAnalysis}
                  disabled={isLoading || !patientData.age}
                  className="ai-gradient zero-g-glow px-8"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <TrendingUp className="h-4 w-4 mr-2" />
                  )}
                  Generate Health Insights
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Treatment Recommendations Tab */}
        <TabsContent value="treatment" className="space-y-6">
          <Card className="medical-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Treatment Recommendations</span>
              </CardTitle>
              <CardDescription>
                Get AI-powered treatment suggestions based on diagnosis and patient profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Textarea
                    id="diagnosis"
                    placeholder="Enter the medical diagnosis..."
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="profile">Patient Profile</Label>
                  <Textarea
                    id="profile"
                    placeholder="Enter patient profile including age, gender, relevant medical history..."
                    value={patientProfileInput}
                    onChange={(e) => setPatientProfileInput(e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="treatments">Current Treatments (Optional)</Label>
                  <Textarea
                    id="treatments"
                    placeholder="Enter current treatments, separated by commas"
                    value={treatmentsInput}
                    onChange={(e) => setTreatmentsInput(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleTreatmentRecommendations}
                  disabled={isLoading || !diagnosisInput || !patientProfileInput}
                  className="ai-gradient zero-g-glow px-8"
                  size="lg"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-2" />
                  )}
                  Get Treatment Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <MedicalAIInsights className="w-full" />
        </TabsContent>
      </Tabs>

      {/* AI Status Alert */}
      {!isInitialized && (
        <Alert className="bg-blue-50 border-blue-200">
          <Brain className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            AI services will be initialized automatically when you upload files or request analysis.
            Make sure you have set the <code>NEXT_PUBLIC_AI_PRIVATE_KEY</code> or <code>REACT_APP_AI_PRIVATE_KEY</code> environment variable.
          </AlertDescription>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert className="bg-destructive/10 border-destructive/20">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MedicalAIAnalysis;
