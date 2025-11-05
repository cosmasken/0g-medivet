import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, User, Mail, Phone } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const WelcomeBanner = () => {
  const { currentUser } = useAuthStore();
  
  if (!currentUser?.profile) return null;

  const profile = currentUser.profile as any;
  const isNewUser = currentUser.isOnboarded && profile.profileCompleted;

  if (!isNewUser) return null;

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to MediVet, {profile.fullName || 'User'}!
              </h3>
            </div>
            
            <p className="text-gray-600 mb-4">
              Your profile has been set up successfully. You can now start uploading and managing your medical records securely on the blockchain.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {profile.fullName && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="h-4 w-4" />
                  <span>{profile.fullName}</span>
                </div>
              )}
              
              {profile.email && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                </div>
              )}
              
              {profile.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="h-4 w-4" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Upload First Record
              </Button>
              <Button size="sm" variant="outline">
                Complete Profile
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeBanner;
