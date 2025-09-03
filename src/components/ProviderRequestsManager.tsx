import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Mail,
  Building,
  Calendar,
  Shield,
  FileText,
  Activity,
  TestTube,
  Camera,
  Pill,
  Stethoscope,
  AlertCircle,
  Phone
} from "lucide-react";
import { mockProviderRequests, type ProviderRequest } from "@/lib/mock-data";

interface ProviderRequestsManagerProps {
  patientId: string;
  isOpen: boolean;
  onClose: () => void;
  onRequestUpdate: (requestId: string, status: 'approved' | 'denied') => void;
}

export function ProviderRequestsManager({ 
  patientId, 
  isOpen, 
  onClose, 
  onRequestUpdate 
}: ProviderRequestsManagerProps) {
  const [selectedRequest, setSelectedRequest] = useState<ProviderRequest | null>(null);
  const [requests, setRequests] = useState<ProviderRequest[]>(
    mockProviderRequests.filter(req => req.patientId === patientId)
  );

  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  const handleApprove = (request: ProviderRequest) => {
    const updatedRequests = requests.map(req => 
      req.id === request.id 
        ? { ...req, status: 'approved' as const, respondedAt: new Date().toISOString() }
        : req
    );
    setRequests(updatedRequests);
    onRequestUpdate(request.id, 'approved');
    setSelectedRequest(null);
  };

  const handleDeny = (request: ProviderRequest) => {
    const updatedRequests = requests.map(req => 
      req.id === request.id 
        ? { ...req, status: 'denied' as const, respondedAt: new Date().toISOString() }
        : req
    );
    setRequests(updatedRequests);
    onRequestUpdate(request.id, 'denied');
    setSelectedRequest(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'basicInfo': return User;
      case 'medicalHistory': return FileText;
      case 'labResults': return TestTube;
      case 'imaging': return Camera;
      case 'prescriptions': return Pill;
      case 'vitals': return Activity;
      case 'allergies': return AlertTriangle;
      case 'emergencyContact': return Phone;
      default: return Shield;
    }
  };

  const getPermissionLabel = (permission: string) => {
    switch (permission) {
      case 'basicInfo': return 'Basic Information';
      case 'medicalHistory': return 'Medical History';
      case 'labResults': return 'Lab Results';
      case 'imaging': return 'Medical Imaging';
      case 'prescriptions': return 'Prescriptions';
      case 'vitals': return 'Vital Signs';
      case 'allergies': return 'Allergies';
      case 'emergencyContact': return 'Emergency Contact';
      default: return permission;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Provider Access Requests
            {pendingRequests.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {pendingRequests.length} pending
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="processed" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Processed ({processedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <ScrollArea className="h-96">
              {pendingRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
                  <h3 className="text-lg font-medium mb-2">No Pending Requests</h3>
                  <p className="text-muted-foreground">
                    You have no pending provider access requests at this time.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <Card key={request.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={request.providerAvatar} alt={request.providerName} />
                              <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                                {request.providerName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{request.providerName}</CardTitle>
                              <CardDescription className="flex items-center gap-4">
                                <span>{request.providerSpecialty}</span>
                                <span className="flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {request.providerOrganization}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={getUrgencyColor(request.urgency)}>
                              {request.urgency.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(request.requestedAt)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2">Request Reason: {request.requestReason}</h4>
                          <p className="text-sm text-muted-foreground">{request.requestMessage}</p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Requested Permissions:</h4>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(request.requestedPermissions)
                              .filter(([_, granted]) => granted)
                              .map(([permission, _]) => {
                                const Icon = getPermissionIcon(permission);
                                return (
                                  <Badge key={permission} variant="outline" className="flex items-center gap-1">
                                    <Icon className="h-3 w-3" />
                                    {getPermissionLabel(permission)}
                                  </Badge>
                                );
                              })}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>Expires: {new Date(request.expiresAt).toLocaleDateString()}</span>
                        </div>

                        <Separator />

                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setSelectedRequest(request)}
                          >
                            Review Details
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleDeny(request)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Deny
                          </Button>
                          <Button 
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            <ScrollArea className="h-96">
              {processedRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No Processed Requests</h3>
                  <p className="text-muted-foreground">
                    Your processed requests will appear here.
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {processedRequests.map((request) => (
                    <Card key={request.id} className="opacity-75">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={request.providerAvatar} alt={request.providerName} />
                              <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                                {request.providerName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-base">{request.providerName}</CardTitle>
                              <CardDescription>{request.providerSpecialty}</CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getStatusColor(request.status)}>
                              {request.status.toUpperCase()}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {request.respondedAt && formatTimeAgo(request.respondedAt)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">{request.requestReason}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {/* Detailed Request Modal */}
        {selectedRequest && (
          <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedRequest.providerAvatar} alt={selectedRequest.providerName} />
                    <AvatarFallback className="bg-gradient-to-br from-medical-primary to-medical-secondary text-white">
                      {selectedRequest.providerName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  Request from {selectedRequest.providerName}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Provider Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRequest.providerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRequest.providerSpecialty}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRequest.providerOrganization}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{selectedRequest.providerEmail}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Reason:</span>
                        <p className="font-medium">{selectedRequest.requestReason}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Urgency:</span>
                        <Badge className={`ml-2 ${getUrgencyColor(selectedRequest.urgency)}`}>
                          {selectedRequest.urgency.toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>
                        <p>{new Date(selectedRequest.expiresAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Provider Message</h4>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedRequest.requestMessage}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Requested Permissions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(selectedRequest.requestedPermissions).map(([permission, granted]) => {
                      const Icon = getPermissionIcon(permission);
                      return (
                        <div key={permission} className={`flex items-center gap-2 p-2 rounded ${granted ? 'bg-green-50 text-green-800' : 'bg-gray-50 text-gray-500'}`}>
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{getPermissionLabel(permission)}</span>
                          {granted ? (
                            <CheckCircle className="h-4 w-4 ml-auto text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 ml-auto text-gray-400" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedRequest(null)}
                  >
                    Close
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => handleDeny(selectedRequest)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Request
                  </Button>
                  <Button 
                    onClick={() => handleApprove(selectedRequest)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Request
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </DialogContent>
    </Dialog>
  );
}
