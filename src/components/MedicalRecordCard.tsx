import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { AttachmentViewer } from "@/components/AttachmentViewer";
import { 
  FileText, 
  TestTube, 
  Camera, 
  Pill, 
  Stethoscope, 
  Activity, 
  AlertTriangle,
  Eye,
  Calendar,
  User,
  Share2,
  DollarSign,
  Edit,
  Save,
  X,
  Shield,
  TrendingUp,
  Paperclip,
  Image,
  Video,
  Music,
  FileIcon,
  Download,
  Star,
  CheckCircle
} from "lucide-react";
import { MedicalRecord, MedicalAttachment } from "@/lib/mock-data";
import { generateMockAttachments } from "@/lib/mock-attachments";
import { mockProviders } from "@/lib/mock-data";
import { calculatePotentialEarnings } from "@/lib/monetization-data";

const recordTypeIcons = {
  lab: TestTube,
  imaging: Camera,
  prescription: Pill,
  visit: Stethoscope,
  vital: Activity,
  allergy: AlertTriangle
};

const recordTypeColors = {
  lab: 'bg-blue-100 text-blue-800 border-blue-200',
  imaging: 'bg-purple-100 text-purple-800 border-purple-200',
  prescription: 'bg-green-100 text-green-800 border-green-200',
  visit: 'bg-orange-100 text-orange-800 border-orange-200',
  vital: 'bg-red-100 text-red-800 border-red-200',
  allergy: 'bg-yellow-100 text-yellow-800 border-yellow-200'
};

interface MedicalRecordCardProps {
  record: MedicalRecord;
  canView: boolean;
  compact?: boolean;
  showActions?: boolean;
  isPatientView?: boolean;
  onShareRecord?: (recordId: string, providerIds: string[]) => void;
  onMonetizeRecord?: (recordId: string, enabled: boolean) => void;
  onUpdateRecord?: (recordId: string, updates: Partial<MedicalRecord>) => void;
}

export const MedicalRecordCard = ({ 
  record, 
  canView, 
  compact = false, 
  showActions = false,
  isPatientView = false,
  onShareRecord,
  onMonetizeRecord,
  onUpdateRecord
}: MedicalRecordCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record);
  const [selectedProviders, setSelectedProviders] = useState<string[]>([]);
  const [isMonetized, setIsMonetized] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<MedicalAttachment | null>(null);
  const [showAttachmentViewer, setShowAttachmentViewer] = useState(false);
  const [showSharingModal, setShowSharingModal] = useState(false);

  const Icon = recordTypeIcons[record.type];
  const colorClass = recordTypeColors[record.type];
  const potentialEarnings = calculatePotentialEarnings(record);

  const handleViewAttachment = (attachment: MedicalAttachment) => {
    setSelectedAttachment(attachment);
    setShowAttachmentViewer(true);
  };

  const getAttachmentIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
      case 'document':
        return <FileText className="h-4 w-4 text-red-600" />;
      case 'image':
        return <Image className="h-4 w-4 text-blue-600" />;
      case 'video':
        return <Video className="h-4 w-4 text-purple-600" />;
      case 'audio':
        return <Music className="h-4 w-4 text-green-600" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  if (!canView) {
    return (
      <Card className="opacity-50 bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-muted-foreground">Restricted Record</h4>
              <p className="text-sm text-muted-foreground">No access permission</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSave = () => {
    if (onUpdateRecord) {
      onUpdateRecord(record.id, editedRecord);
    }
    setIsEditing(false);
  };

  const handleShareRecord = () => {
    if (onShareRecord && selectedProviders.length > 0) {
      onShareRecord(record.id, selectedProviders);
      setShowSharingModal(false);
      setSelectedProviders([]);
    }
  };

  const handleMonetizationToggle = (enabled: boolean) => {
    setIsMonetized(enabled);
    if (onMonetizeRecord) {
      onMonetizeRecord(record.id, enabled);
    }
  };

  const toggleProviderSelection = (providerId: string) => {
    setSelectedProviders(prev => 
      prev.includes(providerId) 
        ? prev.filter(id => id !== providerId)
        : [...prev, providerId]
    );
  };

  return (
    <>
      <Card className={`hover:shadow-md transition-all ${record.sensitive ? 'border-medical-warning/30' : ''}`}>
        <CardHeader className={compact ? "pb-2" : ""}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  {record.title}
                  {record.sensitive && (
                    <Badge variant="outline" className="h-5 text-xs border-medical-warning text-medical-warning">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Sensitive
                    </Badge>
                  )}
                  {isMonetized && (
                    <Badge className="h-5 text-xs bg-green-100 text-green-800">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Monetized
                    </Badge>
                  )}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {record.provider}
                  </span>
                </div>
              </div>
            </div>
            <Badge className={`${colorClass} capitalize`}>
              {record.type}
            </Badge>
          </div>
        </CardHeader>
        
        {!compact && (
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {record.description}
            </p>

            {/* Attachments */}
            {record.attachments && record.attachments.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {record.attachments.length} attachment{record.attachments.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {record.attachments.slice(0, 3).map((attachment) => (
                    <Button
                      key={attachment.id}
                      variant="outline"
                      size="sm"
                      className="h-8 px-2 text-xs"
                      onClick={() => handleViewAttachment(attachment)}
                    >
                      {getAttachmentIcon(attachment.fileType)}
                      <span className="ml-1 max-w-20 truncate">
                        {attachment.filename.split('.')[0]}
                      </span>
                    </Button>
                  ))}
                  {record.attachments.length > 3 && (
                    <Badge variant="secondary" className="h-8 px-2 text-xs">
                      +{record.attachments.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Shared with {record.sharedWith.length} provider(s)</span>
                {isPatientView && isMonetized && (
                  <span className="text-green-600">• Est. ${potentialEarnings.estimated}/sale</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDetailModal(true)}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                
                {showActions && isPatientView && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowSharingModal(true)}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button 
                      variant={isMonetized ? "default" : "outline"} 
                      size="sm"
                      onClick={() => handleMonetizationToggle(!isMonetized)}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      {isMonetized ? 'Monetized' : 'Monetize'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detailed View Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="h-5 w-5" />
              </div>
              {isEditing ? 'Edit Medical Record' : 'Medical Record Details'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  {isEditing ? (
                    <Input
                      id="title"
                      value={editedRecord.title}
                      onChange={(e) => setEditedRecord({...editedRecord, title: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{record.title}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="type">Type</Label>
                  {isEditing ? (
                    <Select 
                      value={editedRecord.type} 
                      onValueChange={(value) => setEditedRecord({...editedRecord, type: value as any})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lab">Lab Result</SelectItem>
                        <SelectItem value="imaging">Imaging</SelectItem>
                        <SelectItem value="prescription">Prescription</SelectItem>
                        <SelectItem value="visit">Visit</SelectItem>
                        <SelectItem value="vital">Vital Signs</SelectItem>
                        <SelectItem value="allergy">Allergy</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded capitalize">{record.type}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="date">Date</Label>
                  {isEditing ? (
                    <Input
                      id="date"
                      type="date"
                      value={editedRecord.date}
                      onChange={(e) => setEditedRecord({...editedRecord, date: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{new Date(record.date).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="provider">Provider</Label>
                  {isEditing ? (
                    <Input
                      id="provider"
                      value={editedRecord.provider}
                      onChange={(e) => setEditedRecord({...editedRecord, provider: e.target.value})}
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{record.provider}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={editedRecord.description}
                      onChange={(e) => setEditedRecord({...editedRecord, description: e.target.value})}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm mt-1 p-2 bg-muted rounded">{record.description}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="sensitive">Sensitive Record</Label>
                  {isEditing ? (
                    <Switch
                      id="sensitive"
                      checked={editedRecord.sensitive}
                      onCheckedChange={(checked) => setEditedRecord({...editedRecord, sensitive: checked})}
                    />
                  ) : (
                    <Badge variant={record.sensitive ? "destructive" : "secondary"}>
                      {record.sensitive ? "Yes" : "No"}
                    </Badge>
                  )}
                </div>
                
                <div>
                  <Label>Currently Shared With</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {record.sharedWith.map(providerId => {
                      const provider = mockProviders.find(p => p.id === providerId);
                      return (
                        <Badge key={providerId} variant="outline">
                          {provider?.name || `Provider ${providerId}`}
                        </Badge>
                      );
                    })}
                    {record.sharedWith.length === 0 && (
                      <span className="text-sm text-muted-foreground">Not shared with any providers</span>
                    )}
                  </div>
                </div>

                {/* Attachments Section */}
                {record.attachments && record.attachments.length > 0 && (
                  <div>
                    <Label>Attachments ({record.attachments.length})</Label>
                    <div className="mt-2 space-y-2">
                      {record.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                          <div className="flex items-center gap-3">
                            {getAttachmentIcon(attachment.fileType)}
                            <div>
                              <p className="text-sm font-medium">{attachment.filename}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{formatFileSize(attachment.size)}</span>
                                <span>•</span>
                                <span>Uploaded by {attachment.uploadedBy}</span>
                                {attachment.isEncrypted && (
                                  <>
                                    <span>•</span>
                                    <div className="flex items-center gap-1">
                                      <Shield className="h-3 w-3 text-green-600" />
                                      <span className="text-green-600">Encrypted</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewAttachment(attachment)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full mt-3"
                      onClick={() => {
                        // Generate a new mock attachment
                        const newAttachment = {
                          id: `att${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                          filename: `New_Document_${new Date().toISOString().split('T')[0]}.pdf`,
                          fileType: 'pdf' as const,
                          mimeType: 'application/pdf',
                          size: Math.floor(Math.random() * 500000) + 100000,
                          uploadedAt: new Date().toISOString(),
                          uploadedBy: 'Patient',
                          description: 'Manually added document',
                          isEncrypted: true,
                          accessCount: 0,
                          lastAccessed: undefined
                        };
                        
                        // Add to record (this would normally update the backend)
                        record.attachments = [...(record.attachments || []), newAttachment];
                        
                        // Force re-render by updating the record
                        onUpdateRecord?.(record.id, record);
                      }}
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Add Mock Attachment
                    </Button>
                  </div>
                )}

                {/* Add Attachment Section for records without attachments */}
                {(!record.attachments || record.attachments.length === 0) && (
                  <div>
                    <Label>Attachments</Label>
                    <div className="mt-2 p-4 border-2 border-dashed border-muted rounded-lg text-center">
                      <Paperclip className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-3">No attachments yet</p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Generate mock attachments based on record type
                          const mockAttachments = generateMockAttachments(record.type, record.title);
                          record.attachments = mockAttachments;
                          onUpdateRecord?.(record.id, record);
                        }}
                      >
                        <Paperclip className="h-4 w-4 mr-2" />
                        Generate Mock Attachments
                      </Button>
                    </div>
                  </div>
                )}

                {isPatientView && (
                  <div className="space-y-3">
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Monetization</Label>
                        <p className="text-xs text-muted-foreground">Earn ${potentialEarnings.estimated} per sale</p>
                      </div>
                      <Switch
                        checked={isMonetized}
                        onCheckedChange={handleMonetizationToggle}
                      />
                    </div>
                    {isMonetized && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">Record is monetized</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {isPatientView && (
              <div className="flex justify-end gap-2 pt-4 border-t">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Record
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Simple Sharing Modal */}
      <Dialog open={showSharingModal} onOpenChange={setShowSharingModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share "{record.title}"
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                Select providers to share this record with. They will only see what their existing permissions allow.
              </p>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Available Healthcare Providers</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {mockProviders.map(provider => (
                  <div key={provider.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-medical-primary/10 rounded-lg">
                        <User className="h-4 w-4 text-medical-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium">{provider.name}</h5>
                        <p className="text-sm text-muted-foreground">
                          {provider.specialty} • {provider.organization}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={selectedProviders.includes(provider.id)}
                      onCheckedChange={() => toggleProviderSelection(provider.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowSharingModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleShareRecord}
                disabled={selectedProviders.length === 0}
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share with {selectedProviders.length} Provider{selectedProviders.length !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Attachment Viewer */}
      <AttachmentViewer
        attachment={selectedAttachment}
        isOpen={showAttachmentViewer}
        onClose={() => setShowAttachmentViewer(false)}
      />
    </>
  );
};
