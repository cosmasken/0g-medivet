import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertTriangle,
  Bell,
  CheckCircle,
  Eye,
  Loader2,
  Shield,
  Users
} from "lucide-react";
import {
  mockClinicalAlerts,
  getUnreadAlerts,
  getCriticalPatients,
  type ClinicalAlert
} from "@/lib/provider-dashboard-data";

export default function Notifications() {
  const [alerts, setAlerts] = useState(mockClinicalAlerts);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const unreadAlerts = getUnreadAlerts();
  const criticalPatients = getCriticalPatients();

  const handleLoading = (key: string, duration = 1500) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }, duration);
  };

  const mockMarkAlertRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
    toast({
      title: "Alert Marked as Read",
      description: "Alert has been acknowledged"
    });
  };

  const mockTakeAction = (alertId: string) => {
    handleLoading(`action-${alertId}`);
    setTimeout(() => {
      setAlerts(prev => prev.map(alert =>
        alert.id === alertId ? {
          ...alert,
          isRead: true,
          actionTaken: 'Provider action completed',
          resolvedAt: new Date().toISOString()
        } : alert
      ));
      const alert = alerts.find(a => a.id === alertId);
      toast({
        title: "Action Completed",
        description: `Action taken for ${alert?.patientName}`
      });
    }, 2000);
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Bell className="h-8 w-8 text-medical-primary" />
              Notifications & Alerts
            </h1>
            <p className="text-muted-foreground">
              Monitor critical alerts and patient notifications
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{unreadAlerts.length}</div>
              <div className="text-sm text-muted-foreground">Unread Alerts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{criticalPatients.length}</div>
              <div className="text-sm text-muted-foreground">Critical Patients</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                Critical Alerts ({unreadAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`p-3 bg-white rounded-lg border ${alert.isRead ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={getAlertSeverityColor(alert.severity)}>
                              {alert.severity.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{alert.category}</Badge>
                            {!alert.isRead && <Badge className="bg-blue-100 text-blue-800">NEW</Badge>}
                          </div>
                          <h4 className="font-medium mb-1">{alert.title}</h4>
                          <p className="text-sm text-muted-foreground mb-1">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">
                            {alert.patientName} • {formatDateTime(alert.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.actionRequired && !alert.actionTaken && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => mockTakeAction(alert.id)}
                              disabled={loadingStates[`action-${alert.id}`]}
                            >
                              {loadingStates[`action-${alert.id}`] ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'Take Action'
                              )}
                            </Button>
                          )}
                          {!alert.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => mockMarkAlertRead(alert.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-lg font-medium mb-2">No Alerts</h3>
                      <p className="text-muted-foreground">All systems are running smoothly</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Critical Patients */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Critical Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {criticalPatients.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No Critical Patients</h3>
                      <p className="text-muted-foreground">
                        Great news! No patients currently require immediate attention.
                      </p>
                    </div>
                  ) : (
                    criticalPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={patient.avatar} />
                            <AvatarFallback>
                              {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{patient.firstName} {patient.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              Age {calculateAge(patient.dateOfBirth)} • {patient.medicalInfo.chronicConditions} chronic conditions
                            </p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {patient.medicalInfo.conditions.slice(0, 2).map((condition) => (
                                <Badge key={condition} variant="outline" className="text-xs">
                                  {condition}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRiskLevelColor(patient.medicalInfo.riskLevel)}>
                            {patient.medicalInfo.riskLevel.toUpperCase()}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Data Access Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Data Access Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm p-3 bg-blue-50 rounded border">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Patient data accessed by Dr. Emily Smith</span>
                </div>
                <span className="text-muted-foreground">2h ago</span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 bg-green-50 rounded border">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>New data sharing agreement approved</span>
                </div>
                <span className="text-muted-foreground">4h ago</span>
              </div>
              <div className="flex items-center justify-between text-sm p-3 bg-purple-50 rounded border">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-purple-600" />
                  <span>AI inference completed on patient dataset</span>
                </div>
                <span className="text-muted-foreground">6h ago</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
