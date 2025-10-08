import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, FileText } from 'lucide-react';
import { useCreateFileRecordMutation } from '@/hooks/useFileRecords';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface TextRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TextRecordForm = ({ onSuccess, onCancel }: TextRecordFormProps) => {
  const { currentUser } = useAuthStore();
  const createRecordMutation = useCreateFileRecordMutation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'laboratory',
    specialty: 'general',
    priority_level: 'medium',
    content: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    { value: 'laboratory', label: 'Lab Results' },
    { value: 'imaging', label: 'Imaging' },
    { value: 'consultation', label: 'Consultation Notes' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'diagnosis', label: 'Diagnosis' },
    { value: 'treatment', label: 'Treatment Plan' },
    { value: 'symptoms', label: 'Symptoms' },
    { value: 'progress', label: 'Progress Notes' },
    { value: 'discharge', label: 'Discharge Summary' },
    { value: 'other', label: 'Other' }
  ];

  const specialties = [
    { value: 'general', label: 'General Medicine' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'dermatology', label: 'Dermatology' },
    { value: 'endocrinology', label: 'Endocrinology' },
    { value: 'gastroenterology', label: 'Gastroenterology' },
    { value: 'neurology', label: 'Neurology' },
    { value: 'orthopedics', label: 'Orthopedics' },
    { value: 'pediatrics', label: 'Pediatrics' },
    { value: 'psychiatry', label: 'Psychiatry' },
    { value: 'radiology', label: 'Radiology' }
  ];

  const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser || !formData.title || !formData.content || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Generate a simple hash for text content
    const textHash = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const recordData = {
      user_id: currentUser.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      specialty: formData.specialty,
      priority_level: formData.priority_level,
      file_type: 'text/plain',
      file_size: new Blob([formData.content]).size,
      zero_g_hash: textHash,
      merkle_root: textHash,
      transaction_hash: textHash,
      tags: formData.tags,
      upload_status: 'completed',
      // Store text content in description for text records
      content: formData.content
    };

    createRecordMutation.mutate(recordData, {
      onSuccess: () => {
        toast.success('Text record created successfully!');
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'laboratory',
          specialty: 'general',
          priority_level: 'medium',
          content: '',
          tags: []
        });
        onSuccess?.();
      },
      onError: (error: any) => {
        toast.error(`Failed to create record: ${error.message}`);
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Create Text Record
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter record title"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the record"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Select value={formData.specialty} onValueChange={(value) => setFormData(prev => ({ ...prev, specialty: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty.value} value={specialty.value}>
                      {specialty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority_level} onValueChange={(value) => setFormData(prev => ({ ...prev, priority_level: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter the medical record content..."
              className="min-h-[200px]"
              required
            />
          </div>

          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={createRecordMutation.isPending}>
              {createRecordMutation.isPending ? 'Creating...' : 'Create Record'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TextRecordForm;
