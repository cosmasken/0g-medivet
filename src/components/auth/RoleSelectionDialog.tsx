import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Stethoscope, Shield, ArrowRight, Sparkles } from 'lucide-react';
import { Role, PatientProfile, ProviderProfile } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  walletAddress: string;
}

const RoleSelectionDialog: React.FC<RoleSelectionDialogProps> = ({
  isOpen,
  onClose,
  walletAddress
}) => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [profileData, setProfileData] = useState<any>({});
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const roles = [
    {
      type: 'Patient' as Role,
      icon: UserCircle,
      title: 'Patient',
      description: 'Manage your health records and monetize your data on 0G',
      gradient: 'bg-gradient-to-br from-primary to-primary-glow',
      badge: 'Own Your Data',
      features: ['Upload Medical Records', 'Earn from Data Sharing', 'AI Health Insights']
    },
    {
      type: 'Provider' as Role,
      icon: Stethoscope,
      title: 'Healthcare Provider',
      description: 'Access patient data and leverage 0G\'s AI for research',
      gradient: 'bg-gradient-to-br from-accent to-cyan-400',
      badge: 'AI Research',
      features: ['Access Patient Data', 'AI-Powered Analysis', 'Contribute Research']
    },
    {
      type: 'Admin' as Role,
      icon: Shield,
      title: 'Platform Admin',
      description: 'Manage the 0G MediVet platform and governance',
      gradient: 'bg-gradient-to-br from-destructive to-red-400',
      badge: 'Platform Control',
      features: ['User Management', 'Platform Analytics', 'Governance Tools']
    }
  ];

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setProfileData({});
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleSubmit = () => {
    if (!selectedRole) return;

    let profile: PatientProfile | ProviderProfile;
    let navigatePath: string;

    switch (selectedRole) {
      case 'Patient':
        profile = {
          fullName: profileData.fullName || 'Anonymous Patient',
          dob: profileData.dob || '1990-01-01',
          contact: profileData.contact || `${walletAddress.slice(0, 8)}@0g.medivet`,
          emergency: profileData.emergency || 'Emergency Contact',
          monetizeEnabled: true
        } as PatientProfile;
        navigatePath = '/patient/dashboard';
        break;

      case 'Provider':
        profile = {
          name: profileData.name || 'Healthcare Provider',
          license: profileData.license || `0G-${walletAddress.slice(-8).toUpperCase()}`,
          specialty: profileData.specialty || 'General Medicine',
          contact: profileData.contact || `${walletAddress.slice(0, 8)}@0g.medivet`,
          whitelisted: false, // Requires admin approval
          reputation: 85,
          organization: profileData.organization
        } as ProviderProfile;
        navigatePath = '/provider/dashboard';
        break;

      case 'Admin':
        profile = {
          name: 'Platform Administrator',
          license: `ADMIN-${walletAddress.slice(-6).toUpperCase()}`,
          specialty: '0G Platform Administration',
          contact: `admin@0g.medivet`,
          whitelisted: true,
          reputation: 100,
          organization: '0G Labs'
        } as ProviderProfile;
        navigatePath = '/admin';
        break;

      default:
        return;
    }

    login(selectedRole, profile);
    toast.success(`Welcome to 0G MediVet! Connected as ${selectedRole}`);
    navigate(navigatePath);
    onClose();
  };

  const handleMockLogin = (role: Role) => {
    setSelectedRole(role);
    // Auto-fill with mock data and submit
    setTimeout(() => handleSubmit(), 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 ai-gradient rounded-xl flex items-center justify-center zero-g-glow">
              <span className="text-primary-foreground font-bold">ØG</span>
            </div>
            <div>
              <DialogTitle className="text-2xl">Welcome to 0G MediVet</DialogTitle>
              <DialogDescription className="flex items-center space-x-2">
                <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                  <span className="text-xs">0G Testnet</span>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {!selectedRole ? (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Choose Your Role</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select how you want to interact with the 0G-powered healthcare marketplace
              </p>
              <Badge variant="outline" className="ai-gradient text-white border-none">
                <Sparkles className="mr-1 h-3 w-3" />
                AI-Powered • Decentralized • Patient-Owned
              </Badge>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card 
                    key={role.type}
                    className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-primary/20 hover:border-primary/40"
                    onClick={() => handleRoleSelect(role.type)}
                  >
                    <CardHeader className="text-center pb-2">
                      <div className={`w-14 h-14 ${role.gradient} rounded-xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <CardTitle className="flex items-center justify-center space-x-2 text-base">
                        <span>{role.title}</span>
                        <Badge variant="secondary" className="text-xs">
                          {role.badge}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-xs leading-relaxed">
                        {role.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-1 mb-4">
                        {role.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-xs">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                            <span className="text-muted-foreground">{feature}</span>
                          </div>
                        ))}
                      </div>
                      <Button 
                        className="w-full text-xs" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMockLogin(role.type);
                        }}
                      >
                        Quick Start
                        <ArrowRight className="ml-2 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Complete Your {selectedRole} Profile</h3>
              <p className="text-sm text-muted-foreground">
                {selectedRole === 'Admin' 
                  ? 'Admin privileges will be granted automatically' 
                  : 'Customize your profile or skip to use defaults'
                }
              </p>
            </div>

            <div className="max-w-md mx-auto space-y-4">
              {selectedRole === 'Patient' && (
                <>
                  <div>
                    <Label htmlFor="fullName">Full Name (Optional)</Label>
                    <Input
                      id="fullName"
                      placeholder="Your full name"
                      value={profileData.fullName || ''}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Email (Optional)</Label>
                    <Input
                      id="contact"
                      type="email"
                      placeholder={`${walletAddress.slice(0, 8)}@0g.medivet`}
                      value={profileData.contact || ''}
                      onChange={(e) => handleInputChange('contact', e.target.value)}
                    />
                  </div>
                </>
              )}
              
              {selectedRole === 'Provider' && (
                <>
                  <div>
                    <Label htmlFor="name">Provider Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="Dr. Your Name"
                      value={profileData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="specialty">Specialty (Optional)</Label>
                    <Input
                      id="specialty"
                      placeholder="e.g., Cardiology, General Medicine"
                      value={profileData.specialty || ''}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organization (Optional)</Label>
                    <Input
                      id="organization"
                      placeholder="Hospital or Clinic Name"
                      value={profileData.organization || ''}
                      onChange={(e) => handleInputChange('organization', e.target.value)}
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
                  className="flex-1 ai-gradient zero-g-glow"
                >
                  {selectedRole === 'Admin' ? 'Access Admin Panel' : 'Enter 0G MediVet'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoleSelectionDialog;
