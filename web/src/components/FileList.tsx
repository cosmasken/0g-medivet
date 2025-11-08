/**
 * FileList Component
 * Displays a list of medical files with selection and batch operation support
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import MedicalFileCard from '@/components/MedicalFileCard';
import BatchOperations from '@/components/BatchOperations';
import { MedicalFileMetadata } from '@/stores/medicalFilesStore';

interface FileListProps {
  files: MedicalFileMetadata[];
  viewMode?: 'grid' | 'list';
  onFileSelect?: (fileId: string) => void;
  onFilePreview?: (file: MedicalFileMetadata) => void;
  onFileDownload?: (file: MedicalFileMetadata) => void;
  className?: string;
}

const FileList: React.FC<FileListProps> = ({
  files,
  viewMode = 'grid',
  onFileSelect,
  onFilePreview,
  onFileDownload,
  className
}) => {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showBatchOperations, setShowBatchOperations] = useState(false);

  // Update batch operations visibility when selection changes
  useEffect(() => {
    setShowBatchOperations(selectedFiles.length > 0);
  }, [selectedFiles]);

  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId) 
        ? prev.filter(id => id !== fileId) 
        : [...prev, fileId]
    );
    
    if (onFileSelect) {
      onFileSelect(fileId);
    }
  };

  const selectAllFiles = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([]);
    } else {
      setSelectedFiles(files.map(file => file.id));
    }
  };

  const handleBatchOperation = async (operationId: string, selectedItems: string[]) => {
    console.log(`Executing ${operationId} on ${selectedItems.length} items`);
    
    // In a real implementation, this would execute the actual batch operation
    switch (operationId) {
      case 'download':
        // Download all selected files
        selectedItems.forEach(itemId => {
          const file = files.find(f => f.id === itemId);
          if (file && onFileDownload) {
            onFileDownload(file);
          }
        });
        break;
      case 'preview':
        // Preview all selected files (in a modal for example)
        console.log('Previewing selected files:', selectedItems);
        break;
      case 'delete':
        // Delete selected files
        console.log('Deleting selected files:', selectedItems);
        break;
      default:
        console.log('Unknown operation:', operationId);
    }
    
    // Clear selection after operation
    setSelectedFiles([]);
  };

  // Define available batch operations
  const batchOperations = [
    {
      id: 'download',
      name: 'Download',
      description: 'Download selected files',
      action: (selectedItems: string[]) => Promise.resolve(),
      icon: null
    },
    {
      id: 'preview',
      name: 'Preview',
      description: 'Preview selected files',
      action: (selectedItems: string[]) => Promise.resolve(),
      icon: null
    },
    {
      id: 'delete',
      name: 'Delete',
      description: 'Delete selected files',
      action: (selectedItems: string[]) => Promise.resolve(),
      requiresConfirmation: true,
      icon: null
    }
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Selection header */}
      {files.length > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={selectedFiles.length === files.length && files.length > 0}
              onChange={selectAllFiles}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Select all ({files.length})
            </label>
          </div>
          <div className="text-sm text-gray-500">
            {selectedFiles.length} selected
          </div>
        </div>
      )}

      {/* Files display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {files.map((file) => (
            <div key={file.id} className="relative">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={() => toggleFileSelection(file.id)}
                className="absolute top-2 left-2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 z-10"
              />
              <MedicalFileCard
                id={file.id}
                name={file.name}
                type={file.type}
                size={file.size}
                uploadDate={file.uploadDate}
                isEncrypted={file.isTextRecord}
                isShared={file.shared}
                category={file.category}
                onPreview={() => onFilePreview?.(file)}
                onDownload={() => onFileDownload?.(file)}
                onClick={() => toggleFileSelection(file.id)}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div key={file.id} className="relative">
              <input
                type="checkbox"
                checked={selectedFiles.includes(file.id)}
                onChange={() => toggleFileSelection(file.id)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 z-10"
              />
              <MedicalFileCard
                id={file.id}
                name={file.name}
                type={file.type}
                size={file.size}
                uploadDate={file.uploadDate}
                isEncrypted={file.isTextRecord}
                isShared={file.shared}
                category={file.category}
                onPreview={() => onFilePreview?.(file)}
                onDownload={() => onFileDownload?.(file)}
                onClick={() => toggleFileSelection(file.id)}
                variant="compact"
              />
            </div>
          ))}
        </div>
      )}

      {/* Batch operations bar */}
      {showBatchOperations && (
        <BatchOperations
          selectedItems={selectedFiles}
          availableOperations={batchOperations}
          onOperationComplete={(operationId, success) => {
            console.log(`Operation ${operationId} completed with success: ${success}`);
          }}
          onCancelSelection={() => setSelectedFiles([])}
        />
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No files</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by uploading your first medical document.
          </p>
        </div>
      )}
    </div>
  );
};

export default FileList;