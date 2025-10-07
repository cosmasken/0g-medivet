import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Eye, Edit, Share, AlertTriangle } from "lucide-react";

interface PermissionLevel {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const permissionLevels: PermissionLevel[] = [
  {
    id: "none",
    label: "No Access",
    description: "Completely private",
    icon: <Lock className="h-4 w-4" />,
    color: "text-destructive"
  },
  {
    id: "view",
    label: "View Only",
    description: "Can see but not modify",
    icon: <Eye className="h-4 w-4" />,
    color: "text-muted-foreground"
  },
  {
    id: "comment",
    label: "View & Comment",
    description: "Can add notes and observations",
    icon: <Edit className="h-4 w-4" />,
    color: "text-primary"
  },
  {
    id: "full",
    label: "Full Access",
    description: "Can view, edit, and share",
    icon: <Share className="h-4 w-4" />,
    color: "text-health"
  }
];

interface DataCategory {
  id: string;
  title: string;
  description: string;
  sensitive?: boolean;
  defaultLevel: string;
}

const dataCategories: DataCategory[] = [
  {
    id: "demographics",
    title: "Basic Demographics",
    description: "Name, age, contact information",
    defaultLevel: "view"
  },
  {
    id: "medical-history",
    title: "Medical History",
    description: "Past conditions, surgeries, family history",
    defaultLevel: "comment"
  },
  {
    id: "medications",
    title: "Current Medications",
    description: "Prescriptions, dosages, allergies",
    defaultLevel: "full"
  },
  {
    id: "lab-results",
    title: "Lab Results",
    description: "Blood work, diagnostic tests",
    defaultLevel: "comment"
  },
  {
    id: "imaging",
    title: "Medical Imaging",
    description: "X-rays, MRIs, CT scans",
    defaultLevel: "view"
  },
  {
    id: "mental-health",
    title: "Mental Health Records",
    description: "Psychological evaluations, therapy notes",
    sensitive: true,
    defaultLevel: "none"
  },
  {
    id: "genetic",
    title: "Genetic Information",
    description: "DNA tests, genetic predispositions",
    sensitive: true,
    defaultLevel: "none"
  },
  {
    id: "insurance",
    title: "Insurance Information",
    description: "Coverage details, billing history",
    defaultLevel: "view"
  }
];

interface PermissionCardProps {
  title: string;
  permissions: Record<string, string>;
  onPermissionChange: (categoryId: string, level: string) => void;
  allowEmergencyOverride?: boolean;
  onEmergencyOverrideChange?: (enabled: boolean) => void;
}

export function PermissionCard({ 
  title, 
  permissions, 
  onPermissionChange,
  allowEmergencyOverride = false,
  onEmergencyOverrideChange
}: PermissionCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {allowEmergencyOverride && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-accent" />
              <Label htmlFor="emergency-override" className="text-sm">Emergency Override</Label>
              <Switch 
                id="emergency-override"
                onCheckedChange={onEmergencyOverrideChange}
              />
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {dataCategories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/30 transition-colors">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-medium">{category.title}</h4>
                {category.sensitive && (
                  <Badge variant="outline" className="text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Sensitive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{category.description}</p>
            </div>
            
            <div className="ml-4 min-w-44">
              <Select
                value={permissions[category.id] || category.defaultLevel}
                onValueChange={(value) => onPermissionChange(category.id, value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {permissionLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex items-center space-x-2">
                        <span className={level.color}>{level.icon}</span>
                        <div>
                          <div className="font-medium">{level.label}</div>
                          <div className="text-xs text-muted-foreground">{level.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}