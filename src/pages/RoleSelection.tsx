import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RoleCard } from "@/components/RoleCard";
import { AccountSwitcher } from "@/components/AccountSwitcher";
import { User, Stethoscope, Shield, Calendar, FileText, Users, Settings, BarChart3, ArrowLeft } from "lucide-react";
import heroImage from "@/assets/hero-medical.jpg";

export default function RoleSelection() {
  const navigate = useNavigate();

  const handleRoleSelect = (role: "patient" | "provider") => {
    navigate(`/onboarding/${role}`);
  };

  const handleBackToLanding = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToLanding}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">Medivet</span>
            </div>
          </div>
          <AccountSwitcher />
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img
            src={heroImage}
            alt="Medical dashboard interface"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4 text-center relative">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Secure Health Records Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Connect patients and healthcare providers with advanced permission controls,
            comprehensive health record management, and seamless data sharing.
          </p>
          <p className="text-sm text-muted-foreground mb-12">
            Choose your role to get started with your personalized dashboard experience
          </p>
        </div>
      </section>

      {/* Role Selection */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <RoleCard
              variant="patient"
              icon={<User className="h-8 w-8" />}
              title="Patient Portal"
              description="Access and manage your health records with complete control over who sees your data."
              features={[
                "View your complete medical history",
                "Control provider access permissions",
                "Schedule appointments and view results",
                "Secure messaging with healthcare team",
                "Track medications and allergies",
                "Download and share records securely"
              ]}
              onSelect={() => handleRoleSelect("patient")}
            />

            <RoleCard
              variant="provider"
              icon={<Stethoscope className="h-8 w-8" />}
              title="Provider Dashboard"
              description="Comprehensive patient management with secure access to authorized health records."
              features={[
                "Access patient records with permissions",
                "Create and update medical documentation",
                "Manage appointments and schedules",
                "Collaborate with other providers",
                "Analytics and reporting tools",
                "HIPAA-compliant communication"
              ]}
              onSelect={() => handleRoleSelect("provider")}
            />
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-card/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Platform Features</h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { icon: Shield, title: "Granular Permissions", desc: "Control exactly who can access what data" },
              { icon: FileText, title: "Comprehensive Records", desc: "Complete medical history in one place" },
              { icon: Users, title: "Provider Network", desc: "Connect with your entire care team" },
              { icon: BarChart3, title: "Health Analytics", desc: "Insights from your health data" }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-card hover:shadow-soft transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}