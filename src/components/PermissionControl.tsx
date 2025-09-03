import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Shield, AlertTriangle } from "lucide-react";

interface PermissionItem {
  key: string;
  label: string;
  description: string;
  sensitive?: boolean;
}

const permissionItems: PermissionItem[] = [
  {
    key: 'basicInfo',
    label: 'Basic Information',
    description: 'Name, date of birth, contact information'
  },
  {
    key: 'medicalHistory',
    label: 'Medical History',
    description: 'Past diagnoses, conditions, and treatments',
    sensitive: true
  },
  {
    key: 'labResults',
    label: 'Laboratory Results',
    description: 'Blood work, urine tests, and other lab findings'
  },
  {
    key: 'imaging',
    label: 'Imaging Studies',
    description: 'X-rays, MRI, CT scans, and other imaging'
  },
  {
    key: 'prescriptions',
    label: 'Medications',
    description: 'Current and past prescriptions',
    sensitive: true
  },
  {
    key: 'vitals',
    label: 'Vital Signs',
    description: 'Blood pressure, heart rate, temperature'
  },
  {
    key: 'allergies',
    label: 'Allergies',
    description: 'Known allergies and adverse reactions'
  },
  {
    key: 'emergencyContact',
    label: 'Emergency Contact',
    description: 'Emergency contact information',
    sensitive: true
  }
];

interface PermissionControlProps {
  targetId: string;
  targetName: string;
  targetType: 'patient' | 'provider';
  permissions: Record<string, boolean>;
  onPermissionChange: (key: string, value: boolean) => void;
  readonly?: boolean;
}

export const PermissionControl = ({ 
  targetId, 
  targetName, 
  targetType, 
  permissions, 
  onPermissionChange,
  readonly = false 
}: PermissionControlProps) => {
  const enabledCount = Object.values(permissions).filter(Boolean).length;
  const totalCount = permissionItems.length;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-medical-primary" />
              {readonly ? 'Access Permissions' : 'Sharing Permissions'}
            </CardTitle>
            <CardDescription>
              {readonly 
                ? `Your access level for ${targetName}`
                : `Control what you share with ${targetName}`
              }
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {enabledCount}/{totalCount}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {permissionItems.map((item) => {
          const isEnabled = permissions[item.key] || false;
          
          return (
            <div 
              key={item.key}
              className="flex items-center justify-between p-3 rounded-lg border bg-card/50 hover:bg-accent/30 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{item.label}</span>
                  {item.sensitive && (
                    <Badge variant="secondary" className="h-5 text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Sensitive
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {isEnabled ? (
                  <Eye className="h-4 w-4 text-medical-success" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => onPermissionChange(item.key, checked)}
                  disabled={readonly}
                />
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};