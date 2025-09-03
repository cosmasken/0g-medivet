import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { ArrowLeft, ArrowRight, User, Shield, FileText, CheckCircle } from "lucide-react";

const steps = ["Personal Info", "Medical History", "Privacy Settings", "Complete"];

export default function PatientOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [allowEmergencyOverride, setAllowEmergencyOverride] = useState(true);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard/patient");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Progress Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-6 p-0 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <OnboardingProgress
            steps={steps}
            currentStep={currentStep}
            className="mb-6"
          />

          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">Patient Onboarding</h1>
            <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentStep === 0 && <User className="h-5 w-5 mr-2 text-health" />}
              {currentStep === 1 && <FileText className="h-5 w-5 mr-2 text-health" />}
              {currentStep === 2 && <Shield className="h-5 w-5 mr-2 text-health" />}
              {currentStep === 3 && <CheckCircle className="h-5 w-5 mr-2 text-health" />}
              {steps[currentStep]}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  Let's start with your basic information to personalize your health record experience.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="your.email@example.com" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="(555) 123-4567" />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input id="dateOfBirth" type="date" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  Help us understand your medical background to provide better care coordination.
                </p>
                <div>
                  <Label htmlFor="conditions">Current Medical Conditions</Label>
                  <Textarea
                    id="conditions"
                    placeholder="List any current medical conditions, chronic illnesses, or ongoing health concerns..."
                    className="min-h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Current Medications</Label>
                  <Textarea
                    id="medications"
                    placeholder="List all medications you're currently taking, including dosages..."
                    className="min-h-24"
                  />
                </div>
                <div>
                  <Label htmlFor="allergies">Allergies & Reactions</Label>
                  <Textarea
                    id="allergies"
                    placeholder="List any known allergies to medications, foods, or other substances..."
                    className="min-h-20"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  Configure your privacy preferences. These settings control how your health data is shared and accessed.
                </p>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium text-sm">Emergency Override</div>
                        <p className="text-xs text-muted-foreground">Allow emergency access to critical health data</p>
                      </div>
                      <Switch
                        checked={allowEmergencyOverride}
                        onCheckedChange={setAllowEmergencyOverride}
                      />
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox id="family" />
                      <div>
                        <Label htmlFor="family" className="font-medium">Family Member Access</Label>
                        <p className="text-sm text-muted-foreground">
                          Allow designated family members to view your health records
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Checkbox id="research" />
                      <div>
                        <Label htmlFor="research" className="font-medium">Anonymous Research</Label>
                        <p className="text-sm text-muted-foreground">
                          Contribute anonymized data to medical research studies
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg bg-muted/20">
                      <Checkbox id="audit-log" defaultChecked disabled />
                      <div>
                        <Label htmlFor="audit-log" className="font-medium">Access Audit Logging</Label>
                        <p className="text-sm text-muted-foreground">
                          Keep detailed logs of who accesses your data (always enabled)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-health rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-health-foreground" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-3">Welcome to Medivet!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your patient account has been successfully created. You can now:
                  </p>
                </div>

                <div className="grid gap-4 text-left">
                  {[
                    "Access your complete medical history",
                    "Manage provider permissions",
                    "Schedule appointments",
                    "Communicate securely with your care team",
                    "Track medications and allergies"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-health" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 3}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Back to Home" : "Previous"}
          </Button>

          <Button
            onClick={handleNext}
            className={currentStep === 3 ? "bg-gradient-health" : "bg-gradient-primary"}
          >
            {currentStep === 3 ? "Go to Dashboard" : "Next Step"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}