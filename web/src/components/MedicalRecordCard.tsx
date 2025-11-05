import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, User, Share2, Eye, Download } from "lucide-react";

interface MedicalRecordCardProps {
  record: any;
  isPatient?: boolean;
}

export default function MedicalRecordCard({ record, isPatient = false }: MedicalRecordCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return FileText; // Simplified to always use FileText icon
  };

  const FileIcon = getFileIcon(record?.fileName || record?.name || '');

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {record?.fileName || record?.name || 'Medical Record'}
              </CardTitle>
              <CardDescription className="flex items-center space-x-4 mt-1">
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(record?.createdAt || record?.date || new Date().toISOString())}
                </span>
                {record?.fileSize && (
                  <span>{Math.round(record.fileSize / 1024)} KB</span>
                )}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline">
            {record?.category || record?.type || 'Medical'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {isPatient ? 'Your record' : 'Patient record'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            {isPatient && (
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </div>

        {record?.description && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-gray-600">{record.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
