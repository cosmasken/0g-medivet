import { CheckCircle, Circle } from "lucide-react";

interface OnboardingProgressProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function OnboardingProgress({ steps, currentStep, className = "" }: OnboardingProgressProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-2 transition-all duration-300 ${
              index < currentStep 
                ? 'bg-gradient-primary text-primary-foreground shadow-soft' 
                : index === currentStep
                  ? 'bg-primary-glow text-primary-foreground shadow-glow'
                  : 'bg-muted text-muted-foreground'
            }`}>
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </div>
            <span className={`text-xs font-medium text-center max-w-20 ${
              index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
            }`}>
              {step}
            </span>
          </div>
          
          {index < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-4 mt-[-20px] transition-colors duration-300 ${
              index < currentStep ? 'bg-primary' : 'bg-border'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}