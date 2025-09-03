import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Stethoscope, 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby,
  Pill,
  ShieldCheck,
  UserCog,
  Plus
} from "lucide-react";

interface ProviderType {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defaultPermissions: string[];
  common?: boolean;
}

const providerTypes: ProviderType[] = [
  {
    id: "primary-care",
    name: "Primary Care Physician",
    icon: <Stethoscope className="h-5 w-5" />,
    description: "Family medicine, internal medicine, general practice",
    defaultPermissions: ["demographics", "medical-history", "medications", "lab-results"],
    common: true
  },
  {
    id: "cardiologist",
    name: "Cardiologist",
    icon: <Heart className="h-5 w-5" />,
    description: "Heart and cardiovascular system specialist",
    defaultPermissions: ["demographics", "medical-history", "lab-results", "imaging"]
  },
  {
    id: "neurologist",
    name: "Neurologist",
    icon: <Brain className="h-5 w-5" />,
    description: "Brain and nervous system specialist",
    defaultPermissions: ["demographics", "medical-history", "mental-health", "imaging"]
  },
  {
    id: "ophthalmologist",
    name: "Ophthalmologist",
    icon: <Eye className="h-5 w-5" />,
    description: "Eye and vision specialist",
    defaultPermissions: ["demographics", "medical-history", "imaging"]
  },
  {
    id: "orthopedist",
    name: "Orthopedist",
    icon: <Bone className="h-5 w-5" />,
    description: "Bone, joint, and muscle specialist",
    defaultPermissions: ["demographics", "medical-history", "imaging"]
  },
  {
    id: "pediatrician",
    name: "Pediatrician",
    icon: <Baby className="h-5 w-5" />,
    description: "Children's health specialist",
    defaultPermissions: ["demographics", "medical-history", "medications", "lab-results"],
    common: true
  },
  {
    id: "pharmacist",
    name: "Pharmacist",
    icon: <Pill className="h-5 w-5" />,
    description: "Medication management specialist",
    defaultPermissions: ["demographics", "medications"]
  },
  {
    id: "emergency",
    name: "Emergency Responder",
    icon: <ShieldCheck className="h-5 w-5" />,
    description: "EMT, paramedic, emergency room staff",
    defaultPermissions: ["demographics", "medical-history", "medications"],
    common: true
  },
  {
    id: "nurse",
    name: "Nurse/Medical Assistant",
    icon: <UserCog className="h-5 w-5" />,
    description: "Nursing staff and medical assistants",
    defaultPermissions: ["demographics", "medications"]
  }
];

interface ProviderTypeSelectorProps {
  selectedTypes: string[];
  onTypeToggle: (typeId: string, enabled: boolean) => void;
  showCustom?: boolean;
  onAddCustom?: () => void;
}

export function ProviderTypeSelector({ 
  selectedTypes, 
  onTypeToggle, 
  showCustom = false,
  onAddCustom 
}: ProviderTypeSelectorProps) {
  const commonTypes = providerTypes.filter(type => type.common);
  const specialistTypes = providerTypes.filter(type => !type.common);

  return (
    <div className="space-y-6">
      {/* Common Providers */}
      <div>
        <h3 className="font-semibold mb-3 flex items-center">
          Common Provider Types
          <Badge variant="secondary" className="ml-2">Recommended</Badge>
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {commonTypes.map((type) => (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all hover:shadow-soft ${
                selectedTypes.includes(type.id) ? 'ring-2 ring-primary shadow-soft' : ''
              }`}
              onClick={() => onTypeToggle(type.id, !selectedTypes.includes(type.id))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => {}} // Controlled by card click
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-primary">{type.icon}</div>
                      <h4 className="font-medium">{type.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {type.defaultPermissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Specialist Providers */}
      <div>
        <h3 className="font-semibold mb-3">Specialist Provider Types</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {specialistTypes.map((type) => (
            <Card 
              key={type.id} 
              className={`cursor-pointer transition-all hover:shadow-soft ${
                selectedTypes.includes(type.id) ? 'ring-2 ring-health shadow-health' : ''
              }`}
              onClick={() => onTypeToggle(type.id, !selectedTypes.includes(type.id))}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox 
                    checked={selectedTypes.includes(type.id)}
                    onChange={() => {}} // Controlled by card click
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="text-health">{type.icon}</div>
                      <h4 className="font-medium">{type.name}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{type.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {type.defaultPermissions.map((permission) => (
                        <Badge key={permission} variant="outline" className="text-xs">
                          {permission.replace('-', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Custom Provider Type */}
      {showCustom && (
        <div>
          <Button 
            variant="outline" 
            className="w-full border-dashed"
            onClick={onAddCustom}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Custom Provider Type
          </Button>
        </div>
      )}
    </div>
  );
}