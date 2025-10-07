import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { ArrowLeft, ArrowRight, Stethoscope, Building, Shield, CheckCircle, UserCheck, Clock, Eye, Lock } from "lucide-react";

const steps = ["Practice Info", "Credentials", "Access Requests", "Permissions", "Complete"];

export default function ProviderOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/dashboard/provider");
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
            <h1 className="text-2xl font-bold mb-2">Provider Onboarding</h1>
            <p className="text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
          </div>
        </div>

        {/* Step Content */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              {currentStep === 0 && <Building className="h-5 w-5 mr-2 text-primary" />}
              {currentStep === 1 && <Stethoscope className="h-5 w-5 mr-2 text-primary" />}
              {currentStep === 2 && <UserCheck className="h-5 w-5 mr-2 text-primary" />}
              {currentStep === 3 && <Shield className="h-5 w-5 mr-2 text-primary" />}
              {currentStep === 4 && <CheckCircle className="h-5 w-5 mr-2 text-primary" />}
              {steps[currentStep]}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  Tell us about your practice to set up your provider dashboard and patient access.
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
                  <Label htmlFor="email">Professional Email</Label>
                  <Input id="email" type="email" placeholder="doctor@practice.com" />
                </div>
                <div>
                  <Label htmlFor="organization">Organization/Practice</Label>
                  <Input id="organization" placeholder="City Health Medical Center" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="family">Family Medicine</SelectItem>
                        <SelectItem value="internal">Internal Medicine</SelectItem>
                        <SelectItem value="cardiology">Cardiology</SelectItem>
                        <SelectItem value="dermatology">Dermatology</SelectItem>
                        <SelectItem value="orthopedics">Orthopedics</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" placeholder="(555) 123-4567" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-muted-foreground mb-6">
                  Verify your medical credentials to ensure secure patient access and HIPAA compliance.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="license">Medical License Number</Label>
                    <Input id="license" placeholder="Enter license number" />
                  </div>
                  <div>
                    <Label htmlFor="state">License State</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ca">California</SelectItem>
                        <SelectItem value="ny">New York</SelectItem>
                        <SelectItem value="tx">Texas</SelectItem>
                        <SelectItem value="fl">Florida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="npi">NPI Number</Label>
                    <Input id="npi" placeholder="Enter NPI number" />
                  </div>
                  <div>
                    <Label htmlFor="dea">DEA Number (Optional)</Label>
                    <Input id="dea" placeholder="Enter DEA number" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="education">Medical Education</Label>
                  <Textarea
                    id="education"
                    placeholder="Medical school, residency, fellowships..."
                    className="min-h-20"
                  />
                </div>
                <div>
                  <Label htmlFor="certifications">Board Certifications</Label>
                  <Textarea
                    id="certifications"
                    placeholder="List your board certifications and expiration dates..."
                    className="min-h-20"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  Understand how patient access requests work and how you'll interact with the permission system.
                </p>

                <div className="space-y-4">
                  <Card className="border-primary/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <UserCheck className="h-5 w-5 mr-2 text-primary" />
                        How Access Requests Work
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-primary">1</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Request Patient Access</h4>
                            <p className="text-sm text-muted-foreground">
                              Search for patients and send access requests specifying what data you need and why
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-primary">2</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Patient Reviews Request</h4>
                            <p className="text-sm text-muted-foreground">
                              Patients review your credentials and decide what level of access to grant
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-xs font-medium text-primary">3</span>
                          </div>
                          <div>
                            <h4 className="font-medium">Access Granted</h4>
                            <p className="text-sm text-muted-foreground">
                              Once approved, you can access the permitted data with full audit logging
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Clock className="h-4 w-4 mr-2 text-accent" />
                          Request Types
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Standard Request</span>
                          <Badge variant="outline">24-48 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Urgent Request</span>
                          <Badge variant="secondary">2-6 hours</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Emergency Override</span>
                          <Badge className="bg-destructive">Immediate</Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Eye className="h-4 w-4 mr-2 text-health" />
                          Access Levels
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">View Only</span>
                          <Badge variant="outline">Read access</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">View & Comment</span>
                          <Badge variant="secondary">Add notes</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Full Access</span>
                          <Badge className="bg-health">Edit & share</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <p className="text-muted-foreground mb-6">
                  Configure your access permissions and understand how patient data sharing works.
                </p>

                <div className="space-y-4">
                  <Card className="border-health/20">
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Shield className="h-5 w-5 mr-2 text-health" />
                        Patient-Controlled Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Patients have complete control over their data. Here's what you need to know:
                      </p>

                      <div className="space-y-3">
                        <div className="p-3 bg-health-light/30 rounded-lg">
                          <h4 className="font-medium text-sm mb-1">Granular Permissions</h4>
                          <p className="text-xs text-muted-foreground">
                            Patients can grant different access levels for different types of data (demographics, medical history, lab results, etc.)
                          </p>
                        </div>

                        <div className="p-3 bg-primary-glow/10 rounded-lg">
                          <h4 className="font-medium text-sm mb-1">Time-Limited Access</h4>
                          <p className="text-xs text-muted-foreground">
                            Patients can set expiration dates for access permissions or revoke access at any time
                          </p>
                        </div>

                        <div className="p-3 bg-accent/10 rounded-lg">
                          <h4 className="font-medium text-sm mb-1">Audit Trail</h4>
                          <p className="text-xs text-muted-foreground">
                            All data access is logged and patients can see exactly what you've viewed and when
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center text-lg">
                        <Lock className="h-5 w-5 mr-2 text-destructive" />
                        Emergency Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox id="emergency-understanding" required />
                          <Label htmlFor="emergency-understanding" className="text-sm">
                            I understand that emergency overrides should only be used in life-threatening situations and require additional documentation
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="audit-understanding" required />
                          <Label htmlFor="audit-understanding" className="text-sm">
                            I acknowledge that emergency access is heavily audited and may require justification to medical boards
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>HIPAA Compliance & Best Practices</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-start space-x-2">
                          <Checkbox id="hipaa" required />
                          <Label htmlFor="hipaa" className="text-sm">
                            I acknowledge and agree to HIPAA compliance requirements and will only access patient data for legitimate medical purposes
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="minimum-necessary" required />
                          <Label htmlFor="minimum-necessary" className="text-sm">
                            I will follow the "minimum necessary" standard and only request access to data required for patient care
                          </Label>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Checkbox id="secure-handling" required />
                          <Label htmlFor="secure-handling" className="text-sm">
                            I will handle all patient data securely and not share access credentials with unauthorized personnel
                          </Label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-10 w-10 text-primary-foreground" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold mb-3">Welcome to Medivet!</h2>
                  <p className="text-muted-foreground mb-6">
                    Your provider account has been successfully created. You can now:
                  </p>
                </div>

                <div className="grid gap-4 text-left">
                  {[
                    "Request access to patient records",
                    "View authorized patient information",
                    "Create and update medical documentation",
                    "Manage appointments and schedules",
                    "Collaborate with other healthcare providers",
                    "Use analytics and the granular permission system"
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
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
            disabled={currentStep === 4}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {currentStep === 0 ? "Back to Home" : "Previous"}
          </Button>

          <Button
            onClick={handleNext}
            className="bg-gradient-primary"
          >
            {currentStep === 4 ? "Go to Dashboard" : "Next Step"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}