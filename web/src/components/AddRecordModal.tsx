import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FileUpload from './FileUpload';
import TextRecordForm from './TextRecordForm';
import { FileText, Upload } from 'lucide-react';

interface AddRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddRecordModal = ({ open, onOpenChange }: AddRecordModalProps) => {
  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Medical Record</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload File
            </TabsTrigger>
            <TabsTrigger value="text" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Text Record
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="file" className="mt-6">
            <FileUpload onUploadComplete={handleSuccess} />
          </TabsContent>
          
          <TabsContent value="text" className="mt-6">
            <TextRecordForm 
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AddRecordModal;
