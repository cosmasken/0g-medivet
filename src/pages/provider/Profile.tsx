import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { UserCheck, Save, Star, Briefcase, AlertCircle } from 'lucide-react';
import { ProviderProfile as ProviderProfileType } from '@/types';
import toast from 'react-hot-toast';

const ProviderProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProviderProfileType>(
    currentUser?.profile as ProviderProfileType || {
      name: '',
      license: '',
      specialty: '',
      contact: '',
      whitelisted: false,
      reputation: 0
    }
  );

  if (!currentUser || currentUser.role !== 'Provider') {
    return <div>Access denied</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updateProfile(formData);
    setSaving(false);
    toast.success('Provider profile updated successfully!');
  };

  const handleInputChange = (field: keyof ProviderProfileType, value: string | boolean | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const getReputationColor = (reputation: number) => {
    if (reputation >= 90) return 'text-green-600';
    if (reputation >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWhitelistStatus = (whitelisted: boolean) => {
    return whitelisted ? 'Approved' : 'Pending Review';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Provider Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your professional information and verification status
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
        {/* Professional Information */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5" />
              <span>Professional Information</span>
            </CardTitle>
            <CardDescription>
              Your professional credentials and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="license">Medical License</Label>
              <Input
                id="license"
                value={formData.license}
                onChange={(e) => handleInputChange('license', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
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
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Verification Status</span>
            </CardTitle>
            <CardDescription>
              Your current verification and reputation status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Whitelist Status</p>
                <p className="text-sm text-muted-foreground">
                  Administrative approval for marketplace access
                </p>
              </div>
              <Badge 
                variant={formData.whitelisted ? "default" : "secondary"}
                className={formData.whitelisted ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
              >
                {getWhitelistStatus(formData.whitelisted)}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium">Reputation Score</p>
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className={`font-bold ${getReputationColor(formData.reputation)}`}>
                    {formData.reputation}/100
                  </span>
                </div>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="medical-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${formData.reputation}%` }}
                />
              </div>
            </div>
            
            {!formData.whitelisted && (
              <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Pending Verification</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your account is currently under review by our administrators. 
                  You will receive an email notification once your verification is complete.
                </p>
              </div>
            )}

            {formData.whitelisted && (
              <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <UserCheck className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Verified Provider</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Your account has been verified and approved for marketplace access. 
                  You can now bid on and access health records.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Professional Summary */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Professional Summary</CardTitle>
          <CardDescription>
            Additional information about your practice and experience
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              placeholder="Brief description of your medical practice, experience, and areas of expertise..."
              value={formData.bio || ''}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">15</div>
              <div className="text-sm text-muted-foreground">Records Accessed</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">8</div>
              <div className="text-sm text-muted-foreground">Active Bids</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">2.3k MT</div>
              <div className="text-sm text-muted-foreground">Total Spent</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderProfile;