import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { UserCircle, Stethoscope, Shield, ArrowRight } from 'lucide-react';
import { Role, PatientProfile, ProviderProfile } from '@/types';
import toast from 'react-hot-toast';

const Onboarding: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [profileData, setProfileData] = useState<any>({});
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const roles = [
    {
      type: 'Patient' as Role,
      icon: UserCircle,
      title: 'Patient',
      description: 'Manage your health records and monetize your data',
      color: 'bg-primary',
      badge: 'Own Your Data'
    },
    {
      type: 'Provider' as Role,
      icon: Stethoscope,
      title: 'Healthcare Provider',
      description: 'Access shared records and contribute to research',
      color: 'bg-accent',
      badge: 'Research Access'
    },
    {
      type: 'Admin' as Role,
      icon: Shield,
      title: 'Administrator',
      description: 'Platform management and governance',
      color: 'bg-destructive',
      badge: 'Platform Control'
    }
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setProfileData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleMockLogin = (roleType: Role) => {
    let mockProfile: PatientProfile | ProviderProfile;
    let navigatePath: string;

    switch (roleType) {
      case 'Patient':
        mockProfile = {
          fullName: 'Mock Patient',
          dob: '1990-01-01',
          contact: 'mock.patient@example.com',
          emergency: 'Mock Emergency - +1 555-0000',
          monetizeEnabled: true
        };
        navigatePath = '/patient/dashboard';
        break;
      case 'Provider':
        mockProfile = {
          name: 'Dr. Mock Provider',
          license: 'MDMOCK123',
          specialty: 'General Practice',
          contact: 'mock.provider@example.com',
          whitelisted: true,
          reputation: 90,
          organization: 'Mock Clinic',
          lastInteraction: new Date().toISOString()
        };
        navigatePath = '/provider/dashboard';
        break;
      case 'Admin':
        mockProfile = {
          name: 'Mock Admin',
          license: 'ADMINMOCK',
          specialty: 'System Admin',
          contact: 'mock.admin@example.com',
          whitelisted: true,
          reputation: 100,
          organization: 'MediVet Corp'
        };
        navigatePath = '/admin';
        break;
      default:
        return;
    }

    login(roleType, mockProfile);
    toast.success(`Welcome to MediVet! Logged in as ${roleType}`);
    navigate(navigatePath);
  };

  const handleSubmit = () => {
    if (!selectedRole) return;

    let profile: PatientProfile | ProviderProfile;

    switch (selectedRole) {
      case 'Patient':
        profile = {
          fullName: profileData.fullName || 'Demo Patient',
          dob: profileData.dob || '1985-03-15',
          contact: profileData.contact || 'demo@patient.com',
          emergency: profileData.emergency || 'Emergency Contact',
          monetizeEnabled: true
        } as PatientProfile;
        break;
      case 'Provider':
        profile = {
          name: profileData.name || 'Dr. Demo Provider',
          license: profileData.license || 'MD' + Date.now(),
          specialty: profileData.specialty || 'General Medicine',
          contact: profileData.contact || 'demo@provider.com',
          whitelisted: false,
          reputation: 85
        } as ProviderProfile;
        break;
      case 'Admin':
        profile = {
          name: 'Admin User',
          license: 'ADMIN001',
          specialty: 'Platform Administration',
          contact: 'admin@medivet.com',
          whitelisted: true,
          reputation: 100
        } as ProviderProfile;
        break;
      default:
        return;
    }

    login(selectedRole, profile);
    toast.success(`Welcome to MediVet! Logged in as ${selectedRole}`);
    
    // Navigate to appropriate dashboard
    switch (selectedRole) {
      case 'Patient':
        navigate('/patient/dashboard');
        break;
      case 'Provider':
        navigate('/provider/dashboard');
        break;
      case 'Admin':
        navigate('/admin');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 medical-gradient rounded-xl flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">M</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">MediVet</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Decentralized Medical Records with Data Monetization
          </p>
          <Badge variant="secondary" className="mt-2">
            Internet Computer • Privacy First • Patient Owned
          </Badge>
        </div>

        {!selectedRole ? (
          <div className="grid md:grid-cols-3 gap-6">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.type} 
                  className="medical-card cursor-pointer medical-transition hover:medical-shadow hover:scale-105"
                  onClick={() => handleRoleSelect(role.type)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${role.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="flex items-center justify-center space-x-2">
                      <span>{role.title}</span>
                      <Badge variant="outline">{role.badge}</Badge>
                    </CardTitle>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" variant="outline" onClick={() => handleMockLogin(role.type)}>
                      Try Mock Login
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="medical-card max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Complete Your Profile</CardTitle>
              <CardDescription>
                {selectedRole === 'Admin' 
                  ? 'Admin access will be granted automatically'
                  : 'Fill in your details to get started'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRole === 'Patient' && (
                <>
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={profileData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Email</Label>
                    <Input
                      id="contact"
                      type="email"
                      placeholder="your.email@example.com"
                      value={profileData.contact || ''}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {selectedRole === 'Provider' && (
                <>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Dr. Your Name"
                      value={profileData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Input
                      id="specialty"
                      placeholder="e.g., Cardiology, General Medicine"
                      value={profileData.specialty || ''}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Email</Label>
                    <Input
                      id="contact"
                      type="email"
                      placeholder="doctor@clinic.com"
                      value={profileData.contact || ''}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedRole(null)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="flex-1 medical-gradient medical-shadow"
                >
                  {selectedRole === 'Admin' ? 'Access Admin Panel' : 'Complete Setup'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;