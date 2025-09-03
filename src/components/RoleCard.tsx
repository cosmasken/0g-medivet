import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface RoleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
  onSelect: () => void;
  variant: "patient" | "provider";
}

export function RoleCard({ icon, title, description, features, onSelect, variant }: RoleCardProps) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-glow transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 opacity-5 ${variant === 'patient' ? 'bg-gradient-health' : 'bg-gradient-primary'}`} />
      
      <CardContent className="p-8 relative">
        <div className={`w-16 h-16 rounded-xl mb-6 flex items-center justify-center ${
          variant === 'patient' ? 'bg-health-light text-health' : 'bg-secondary text-primary'
        }`}>
          {icon}
        </div>
        
        <h3 className="text-2xl font-semibold mb-3">{title}</h3>
        <p className="text-muted-foreground mb-6 leading-relaxed">{description}</p>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                variant === 'patient' ? 'bg-health' : 'bg-primary'
              }`} />
              {feature}
            </li>
          ))}
        </ul>
        
        <Button 
          onClick={onSelect}
          className={`w-full group/btn ${
            variant === 'patient' 
              ? 'bg-gradient-health hover:shadow-health' 
              : 'bg-gradient-primary hover:shadow-soft'
          }`}
        >
          Get Started
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}