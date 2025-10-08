import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/stores/authStore";
import { useWallet } from "@/hooks/useWallet";
import { User, Stethoscope, ArrowLeft } from "lucide-react";

export default function RoleSelection() {
  const navigate = useNavigate();
  const { setSelectedRole, login } = useAuthStore();
  const { address } = useWallet();

  const handleRoleSelect = async (role: "patient" | "provider") => {
    setSelectedRole(role);
    
    if (address) {
      try {
        await login(role, {}, address);
        const dashboardPath = role === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
        navigate(dashboardPath);
      } catch (error) {
        console.error('Login failed:', error);
        // Even if login fails, proceed to dashboard as we have local auth fallback
        const dashboardPath = role === 'patient' ? '/dashboard/patient' : '/dashboard/provider';
        navigate(dashboardPath);
      }
    } else {
      navigate(`/onboarding/${role}`);
    }
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToLanding}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-4xl font-bold mb-4">Choose Your Account Type</h1>
          <p className="text-xl text-muted-foreground">
            Select how you'll be using MediVet
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelect("patient")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-blue-100 rounded-full w-fit">
                <User className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl">Patient</CardTitle>
              <CardDescription>
                Manage your medical records and health data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Store medical records securely</li>
                <li>• Share data with providers</li>
                <li>• Monetize your health data</li>
                <li>• AI-powered health insights</li>
              </ul>
              <Button className="w-full mt-4">
                Continue as Patient
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handleRoleSelect("provider")}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-green-100 rounded-full w-fit">
                <Stethoscope className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Healthcare Provider</CardTitle>
              <CardDescription>
                Access patient data and manage care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Access shared patient records</li>
                <li>• Collaborate with patients</li>
                <li>• Purchase research data</li>
                <li>• Clinical decision support</li>
              </ul>
              <Button className="w-full mt-4">
                Continue as Provider
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
