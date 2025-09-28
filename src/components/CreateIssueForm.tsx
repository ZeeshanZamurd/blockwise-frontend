import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useIssue } from '@/hooks/useIssue';
import { useBuilding } from '@/hooks/useBuilding';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface CreateIssueFormProps {
  open: boolean;
  onClose: () => void;
}

const CreateIssueForm = ({ open, onClose }: CreateIssueFormProps) => {
  const { createIssue, isLoading, error, clearIssueError } = useIssue();
  const { building } = useBuilding();
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    category: 'Maintenance',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.summary) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!building?.buildingId) {
      toast.error('Building ID not found. Please ensure building data is loaded.');
      return;
    }

    const issueData = {
      buildingId: building.buildingId,
      issueName: formData.title,
      issueDesc: formData.summary,
      issueCategory: formData.category,
      issuePriority: formData.priority,
    };

    const result = await createIssue(issueData);
    
    if (result.success) {
      toast.success('Issue created successfully!');
      // Reset form
      setFormData({
        title: '',
        summary: '',
        priority: 'Medium',
        category: 'Maintenance',
      });
      onClose();
    } else {
      toast.error(result.error || 'Failed to create issue');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle error display
  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearIssueError();
    }
  }, [error, clearIssueError]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Create New Issue
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Issue Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter issue title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => handleChange('summary', e.target.value)}
              placeholder="Describe the issue in detail"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange('category', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="Repairs">Repairs</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Utilities">Utilities</SelectItem>
                  <SelectItem value="Compliance">Compliance</SelectItem>
                  <SelectItem value="Administration">Administration</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Issue'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIssueForm;