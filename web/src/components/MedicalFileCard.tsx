/**
 * MedicalFileCard Component
 * A card component specifically for displaying medical files
 */

import React from 'react';
import { cn } from '@/lib/utils';
import MedicalCard from '@/components/MedicalCard';
import MedicalButton from '@/components/MedicalButton';
import { FileIcon, DownloadIcon, EyeIcon, AlertTriangleIcon, CheckCircleIcon } from 'lucide-react';

interface MedicalFileCardProps {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  isEncrypted?: boolean;
  isShared?: boolean;
  category?: string;
  onPreview?: () => void;
  onDownload?: () => void;
  className?: string;
  variant?: 'default' | 'compact';
}

const MedicalFileCard: React.FC<MedicalFileCardProps> = ({
  id,
  name,
  type,
  size,
  uploadDate,
  isEncrypted = false,
  isShared = false,
  category,
  onPreview,
  onDownload,
  className,
  variant = 'default'
}) => {
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // Get file icon based on type
  const getFileIcon = () => {
    if (type.includes('pdf')) return <FileIcon className="w-8 h-8 text-red-500" />;
    if (type.includes('image')) return <FileIcon className="w-8 h-8 text-blue-500" />;
    return <FileIcon className="w-8 h-8 text-gray-500" />;
  };

  return (
    <MedicalCard 
      className={cn("flex flex-col", className)}
      variant="default"
      padding={variant === 'compact' ? 'sm' : 'md'}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getFileIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 truncate">{name}</h3>
          <p className="text-xs text-gray-500 mt-1">{type} • {formatFileSize(size)}</p>
          
          {category && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {category}
            </span>
          )}
          
          <div className="mt-2 flex flex-wrap gap-1">
            {isEncrypted && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Encrypted
              </span>
            )}
            {isShared && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="w-3 h-3 mr-1" />
                Shared
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          {new Date(uploadDate).toLocaleDateString()}
        </div>
        
        <div className="flex space-x-2">
          {onPreview && (
            <MedicalButton 
              size="sm" 
              variant="ghost" 
              onClick={onPreview}
              aria-label="Preview file"
            >
              <EyeIcon className="w-4 h-4" />
            </MedicalButton>
          )}
          {onDownload && (
            <MedicalButton 
              size="sm" 
              variant="primary" 
              onClick={onDownload}
              aria-label="Download file"
            >
              <DownloadIcon className="w-4 h-4" />
            </MedicalButton>
          )}
        </div>
      </div>
    </MedicalCard>
  );
};

export default MedicalFileCard;