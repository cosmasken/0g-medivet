/**
 * BatchOperations Component
 * Provides batch operations for multiple selected items
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import MedicalButton from '@/components/MedicalButton';
import { FileDown, Share2, Trash2, Download, Eye, Archive } from 'lucide-react';

interface BatchOperation {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  action: (selectedItems: string[]) => Promise<void>;
  requiresConfirmation?: boolean;
  disabled?: boolean;
}

interface BatchOperationsProps {
  selectedItems: string[];
  availableOperations: BatchOperation[];
  onOperationComplete?: (operationId: string, success: boolean) => void;
  onCancelSelection?: () => void;
  className?: string;
}

const BatchOperations: React.FC<BatchOperationsProps> = ({
  selectedItems,
  availableOperations,
  onOperationComplete,
  onCancelSelection,
  className
}) => {
  const [activeOperation, setActiveOperation] = useState<string | null>(null);
  const [operationStatus, setOperationStatus] = useState<'idle' | 'executing' | 'success' | 'error'>('idle');
  const [confirmationRequired, setConfirmationRequired] = useState<string | null>(null);

  const executeOperation = async (operation: BatchOperation) => {
    if (operation.requiresConfirmation) {
      setConfirmationRequired(operation.id);
      return;
    }

    try {
      setActiveOperation(operation.id);
      setOperationStatus('executing');
      
      await operation.action(selectedItems);
      
      setOperationStatus('success');
      if (onOperationComplete) {
        onOperationComplete(operation.id, true);
      }
      
      // Reset after a short delay
      setTimeout(() => {
        setActiveOperation(null);
        setOperationStatus('idle');
      }, 2000);
    } catch (error) {
      setOperationStatus('error');
      if (onOperationComplete) {
        onOperationComplete(operation.id, false);
      }
      
      setTimeout(() => {
        setActiveOperation(null);
        setOperationStatus('idle');
      }, 2000);
    }
  };

  const confirmOperation = async () => {
    if (!confirmationRequired) return;
    
    const operation = availableOperations.find(op => op.id === confirmationRequired);
    if (operation) {
      await executeOperation(operation);
    }
    
    setConfirmationRequired(null);
  };

  const getOperationIcon = (operationId: string) => {
    switch (operationId) {
      case 'download': return <Download className="w-4 h-4" />;
      case 'share': return <Share2 className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'preview': return <Eye className="w-4 h-4" />;
      case 'archive': return <Archive className="w-4 h-4" />;
      default: return <FileDown className="w-4 h-4" />;
    }
  };

  if (selectedItems.length === 0) return null;

  return (
    <div className={cn("fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 w-full max-w-2xl", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Choose an action to perform on the selected items
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-end">
          <MedicalButton 
            variant="ghost" 
            size="sm" 
            onClick={onCancelSelection}
          >
            Cancel
          </MedicalButton>
          
          {availableOperations.map((operation) => (
            <MedicalButton
              key={operation.id}
              variant={operation.id === 'delete' ? 'error' : 'secondary'}
              size="sm"
              disabled={operation.disabled || activeOperation === operation.id}
              onClick={() => executeOperation(operation)}
              className="flex items-center gap-1"
            >
              {activeOperation === operation.id ? (
                operationStatus === 'executing' ? (
                  <span className="flex items-center">
                    <span className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                    Processing...
                  </span>
                ) : operationStatus === 'success' ? (
                  'Success!'
                ) : operationStatus === 'error' ? (
                  'Error!'
                ) : (
                  <>
                    {getOperationIcon(operation.id)}
                    {operation.name}
                  </>
                )
              ) : (
                <>
                  {getOperationIcon(operation.id)}
                  {operation.name}
                </>
              )}
            </MedicalButton>
          ))}
        </div>
      </div>
      
      {confirmationRequired && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Confirm action</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Are you sure you want to perform this action? This cannot be undone.</p>
              </div>
              <div className="mt-4 flex space-x-3">
                <MedicalButton 
                  variant="warning" 
                  size="sm" 
                  onClick={confirmOperation}
                >
                  Yes, confirm
                </MedicalButton>
                <MedicalButton 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setConfirmationRequired(null)}
                >
                  Cancel
                </MedicalButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchOperations;