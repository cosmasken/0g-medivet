import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User, 
  Stethoscope, 
  Shield, 
  ArrowRight, 
  Lock, 
  DollarSign, 
  Share2, 
  Activity, 
  CheckCircle
} from 'lucide-react';

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
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center p-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow opacity-20" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="w-20 h-20 medical-gradient rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-primary-foreground font-bold text-3xl">M</span>
          </div>
          <h1 className="text-5xl font-extrabold leading-tight text-foreground drop-shadow-md">
            Your Health Data, Your Control, Your Value.
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Securely manage your medical records on the blockchain and monetize your health data for research, all while maintaining privacy.
          </p>
          {!isAuthenticated && (
            <Button 
              size="lg" 
              className="medical-gradient medical-shadow text-lg px-8 py-3"
              onClick={() => navigate('/onboarding')}
            >
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Features & Benefits</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="medical-card text-center p-6">
              <CardHeader>
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <CardTitle>Patient Empowerment</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Gain full control over your medical history with secure, encrypted records. Decide who accesses your data and for how long.</CardDescription>
              </CardContent>
            </Card>
            <Card className="medical-card text-center p-6">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-success mx-auto mb-4" />
                <CardTitle>Data Monetization</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Anonymously contribute your health data to research and earn compensation. Your data helps advance medicine.</CardDescription>
              </CardContent>
            </Card>
            <Card className="medical-card text-center p-6">
              <CardHeader>
                <Share2 className="h-12 w-12 text-warning mx-auto mb-4" />
                <CardTitle>Secure Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>Share specific health records with healthcare providers or researchers with granular, time-bound permissions.</CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 medical-gradient rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">1</div>
              <h3 className="text-xl font-semibold">Upload Your Records</h3>
              <p className="text-muted-foreground">Securely upload your medical documents and data. Everything is encrypted on your device.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 medical-gradient rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">2</div>
              <h3 className="text-xl font-semibold">Control Access</h3>
              <p className="text-muted-foreground">Decide which parts of your data to share, with whom, and for how long, using granular permissions.</p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 medical-gradient rounded-full flex items-center justify-center mx-auto text-primary-foreground text-2xl font-bold">3</div>
              <h3 className="text-xl font-semibold">Monetize & Research</h3>
              <p className="text-muted-foreground">Optionally list anonymized data on the marketplace for research, earning compensation while contributing to science.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 space-y-6">
          <h2 className="text-4xl font-bold">Ready to Take Control of Your Health Data?</h2>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Join MediVet today and experience a new era of patient empowerment, privacy, and data value.
          </p>
          {!isAuthenticated && (
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-8 py-3"
              onClick={() => navigate('/onboarding')}
            >
              Sign Up Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer (Optional) */}
      <footer className="py-8 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} MediVet. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
