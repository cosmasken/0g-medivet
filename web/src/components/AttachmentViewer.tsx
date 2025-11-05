import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Image,
  Video,
  Music,
  Download,
  Eye,
  Lock,
  Unlock,
  Calendar,
  User,
  FileIcon,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Share2,
  AlertTriangle
} from "lucide-react";
import { MedicalAttachment } from "@/lib/mock-data";

interface AttachmentViewerProps {
  attachment: MedicalAttachment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttachmentViewer({ attachment, isOpen, onClose }: AttachmentViewerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!attachment) return null;

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
      case 'document':
        return <FileText className="h-5 w-5 text-red-600" />;
      case 'image':
        return <Image className="h-5 w-5 text-blue-600" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-600" />;
      case 'audio':
        return <Music className="h-5 w-5 text-green-600" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPreview = () => {
    switch (attachment.fileType) {
      case 'pdf':
      case 'document':
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <h3 className="text-lg font-medium mb-2">PDF Document</h3>
            <p className="text-muted-foreground mb-4">
              This is a mock PDF viewer. In a real application, this would display the actual PDF content.
            </p>
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
            <Button className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Open in PDF Viewer
            </Button>
          </div>
        );

      case 'image':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="bg-white border rounded-lg p-4 mb-4">
              {attachment.thumbnailUrl ? (
                <img 
                  src={attachment.thumbnailUrl} 
                  alt={attachment.filename}
                  className="w-full h-64 object-contain bg-gray-100 rounded"
                />
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded flex items-center justify-center">
                  <div className="text-center">
                    <Image className="h-16 w-16 mx-auto mb-2 text-blue-600" />
                    <p className="text-muted-foreground">Medical Image Preview</p>
                    <p className="text-sm text-muted-foreground">DICOM Viewer Required</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button className="flex-1">
                <Maximize2 className="h-4 w-4 mr-2" />
                Full Screen
              </Button>
              <Button variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Download DICOM
              </Button>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="bg-black rounded-lg mb-4 relative">
              {attachment.thumbnailUrl ? (
                <img 
                  src={attachment.thumbnailUrl} 
                  alt={attachment.filename}
                  className="w-full h-64 object-cover rounded"
                />
              ) : (
                <div className="w-full h-64 bg-black rounded flex items-center justify-center">
                  <Video className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  className="rounded-full w-16 h-16 p-0"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="sm">
                <Volume2 className="h-4 w-4" />
              </Button>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full w-1/3"></div>
              </div>
              <span className="text-sm text-muted-foreground">2:34 / 7:42</span>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Mock video player - Educational content about EpiPen usage
            </p>
          </div>
        );

      case 'audio':
        return (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-medium mb-2">Audio Recording</h3>
            <p className="text-muted-foreground mb-4">
              Clinical notes and consultation audio
            </p>
            <div className="bg-white rounded-lg p-4 mb-4">
              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                </Button>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full w-1/4"></div>
                </div>
                <span className="text-sm text-muted-foreground">1:23 / 5:47</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              This is a mock audio player for demonstration purposes
            </p>
          </div>
        );

      default:
        return (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FileIcon className="h-16 w-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-lg font-medium mb-2">File Preview</h3>
            <p className="text-muted-foreground">
              Preview not available for this file type
            </p>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getFileIcon(attachment.fileType)}
            {attachment.filename}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Preview Area */}
          <div className="lg:col-span-2">
            {renderPreview()}
          </div>

          {/* File Information */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">File Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{formatFileSize(attachment.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline">{attachment.mimeType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Encryption:</span>
                  <div className="flex items-center gap-1">
                    {attachment.isEncrypted ? (
                      <>
                        <Lock className="h-3 w-3 text-green-600" />
                        <span className="text-green-600">Encrypted</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="h-3 w-3 text-orange-600" />
                        <span className="text-orange-600">Unencrypted</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Upload Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span>{attachment.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span>{formatDate(attachment.uploadedAt)}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Access History</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views:</span>
                  <span>{attachment.accessCount}</span>
                </div>
                {attachment.lastAccessed && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last viewed:</span>
                    <span>{formatDate(attachment.lastAccessed)}</span>
                  </div>
                )}
              </div>
            </div>

            {attachment.description && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {attachment.description}
                  </p>
                </div>
              </>
            )}

            <Separator />

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download File
              </Button>
              <Button className="w-full" variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Share with Provider
              </Button>
              {!attachment.isEncrypted && (
                <div className="flex items-center gap-2 p-2 bg-orange-50 rounded text-xs text-orange-800">
                  <AlertTriangle className="h-3 w-3" />
                  <span>This file is not encrypted</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
