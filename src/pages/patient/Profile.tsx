import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Save, Shield, DollarSign } from 'lucide-react';
import { PatientProfile as PatientProfileType } from '@/types';
import toast from 'react-hot-toast';

const PatientProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PatientProfileType>(
    currentUser?.profile as PatientProfileType || {
      fullName: '',
      dob: '',
      contact: '',
      emergency: '',
      medicalHistory: '',
      allergies: '',
      medications: '',
      monetizeEnabled: false
    }
  );

  if (!currentUser || currentUser.role !== 'Patient') {
    return <div>Access denied</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProfile(formData);
    setSaving(false);
    toast.success('Profile updated successfully!');
  };

  const handleInputChange = (field: keyof PatientProfileType, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patient Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and privacy settings
          </p>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="medical-gradient medical-shadow"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              <span>Saving...</span>
            </div>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
            <CardDescription>
              Your personal details and contact information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                type="email"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="emergency">Emergency Contact</Label>
              <Input
                id="emergency"
                value={formData.emergency}
                onChange={(e) => handleInputChange('emergency', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Monetization */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5" />
              <span>Data Monetization</span>
            </CardTitle>
            <CardDescription>
              Control how your health data can be used
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Enable Data Monetization</p>
                <p className="text-sm text-muted-foreground">
                  Allow your anonymized health data to be listed on the marketplace
                </p>
              </div>
              <Switch
                checked={formData.monetizeEnabled}
                onCheckedChange={(checked) => handleInputChange('monetizeEnabled', checked)}
              />
            </div>
            
            {formData.monetizeEnabled && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Monetization Enabled</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your health records marked as "Monetizable" can be listed on the marketplace. 
                  All data is encrypted and anonymized before sharing.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Medical Information */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
          <CardDescription>
            Your medical history and current medications (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              placeholder="Previous conditions, surgeries, family history..."
              value={formData.medicalHistory || ''}
              onChange={(e) => handleInputChange('medicalHistory', e.target.value)}
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              placeholder="Food allergies, medication allergies..."
              value={formData.allergies || ''}
              onChange={(e) => handleInputChange('allergies', e.target.value)}
              rows={2}
            />
          </div>
          <div>
            <Label htmlFor="medications">Current Medications</Label>
            <Textarea
              id="medications"
              placeholder="Current prescriptions, dosages..."
              value={formData.medications || ''}
              onChange={(e) => handleInputChange('medications', e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientProfile;