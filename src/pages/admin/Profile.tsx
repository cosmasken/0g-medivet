import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shield, Save, Users, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminProfile: React.FC = () => {
  const { currentUser, updateProfile } = useAuthStore();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'System Administrator',
    contact: 'admin@medivet.com',
    department: 'System Administration',
    adminLevel: 'Super Admin',
    permissions: ['user_management', 'system_config', 'data_oversight']
  });

  if (!currentUser || currentUser.role !== 'Admin') {
    return <div>Access denied</div>;
  }

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    // updateProfile(formData); // Admin profile is read-only for now
    setSaving(false);
    toast.success('Admin profile updated successfully!');
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your administrative account and system permissions
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
              <Shield className="h-5 w-5" />
              <span>Administrator Information</span>
            </CardTitle>
            <CardDescription>
              Your administrative account details
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
              <Label htmlFor="contact">Contact Email</Label>
              <Input
                id="contact"
                type="email"
                value={formData.contact}
                onChange={(e) => handleInputChange('contact', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="adminLevel">Admin Level</Label>
              <Input
                id="adminLevel"
                value={formData.adminLevel}
                onChange={(e) => handleInputChange('adminLevel', e.target.value)}
                disabled
              />
            </div>
          </CardContent>
        </Card>

        {/* Permissions & Access */}
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Permissions</span>
            </CardTitle>
            <CardDescription>
              Your current administrative privileges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Current Permissions</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.permissions.map((permission, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {permission.replace('_', ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-warning/10 border border-warning/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-warning" />
                <span className="font-medium text-warning">Security Notice</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Administrative privileges grant access to sensitive system functions. 
                Use these permissions responsibly and in accordance with company policy.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Statistics */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>System Overview</span>
          </CardTitle>
          <CardDescription>
            Current system statistics and activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">247</div>
              <div className="text-sm text-muted-foreground">Total Users</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">89</div>
              <div className="text-sm text-muted-foreground">Active Providers</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">1,234</div>
              <div className="text-sm text-muted-foreground">Health Records</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">56</div>
              <div className="text-sm text-muted-foreground">Pending Reviews</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;