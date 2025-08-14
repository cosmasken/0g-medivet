import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { isAuthenticated, currentUser } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Redirect to appropriate dashboard based on role
      switch (currentUser.role) {
        case 'Patient':
          navigate('/patient/dashboard');
          break;
        case 'Provider':
          navigate('/provider/dashboard');
          break;
        case 'Admin':
          navigate('/admin');
          break;
        default:
          navigate('/onboarding');
      }
    } else {
      navigate('/onboarding');
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="w-12 h-12 medical-gradient rounded-xl flex items-center justify-center mx-auto mb-4">
          <span className="text-primary-foreground font-bold text-lg">M</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">MediVet</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
