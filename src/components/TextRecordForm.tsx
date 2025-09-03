import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, FileText } from 'lucide-react';
import { useCreateRecordMutation } from '@/hooks/useRecordsQuery';
import { createMedicalRecord } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

interface TextRecordFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const TextRecordForm = ({ onSuccess, onCancel }: TextRecordFormProps) => {
  const { currentUser } = useAuthStore();
  const createRecordMutation = useCreateRecordMutation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    content: '',
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState('');

  const categories = [
    'Lab Results',
    'Diagnosis',
    'Treatment Plan',
    'Symptoms',
    'Medication Notes',
    'Consultation Notes',
    'Progress Notes',
    'Discharge Summary',
    'Other'
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
    
    createRecordMutation.mutate({
      user_id: currentUser.id,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      file_type: 'text/plain',
      file_size: new Blob([formData.content]).size,
      zero_g_hash: textHash,
      tags: formData.tags
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      category: '',
      content: '',
      tags: []
    });
    
    onSuccess?.();
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
            <Label htmlFor="category">Category *</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description (optional)"
            />
          </div>

          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Enter your medical record content here..."
              rows={8}
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

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={createRecordMutation.isPending} className="flex-1">
              {createRecordMutation.isPending ? 'Creating...' : 'Create Record'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default TextRecordForm;
