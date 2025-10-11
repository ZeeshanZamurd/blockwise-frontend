
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit, Mail, Phone, MessageCircle, MessageSquare, Save, X, AlertTriangle, FileText } from 'lucide-react';
import { useIssue } from '@/hooks/useIssue';
import { toast } from 'sonner';

interface IssueDetailsCardProps {
  issue: any;
  onIssueUpdate?: () => void; // Callback to notify parent of updates
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ issue, onIssueUpdate }) => {
  console.log('Issue Details Card', issue);
  const { updateIssueDetails, getIssueById } = useIssue();

  // Function to format date from ISO format to "M/D/YYYY, H:MM:SS AM/PM"
  const formatDate = (dateString: string | undefined | null): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString; // Return original if invalid
      
      return date.toLocaleString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return original if error
    }
  };
  const [isEditingUpdate, setIsEditingUpdate] = useState(false);
  const [editedUpdate, setEditedUpdate] = useState(issue.latestUpdate ?? issue.lastUpdate ?? '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(issue.issueName ?? issue.title ?? '');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(issue.issueDesc ?? issue.summary ?? '');
  const [isSavingSummary, setIsSavingSummary] = useState(false);
  const [isSavingUpdate, setIsSavingUpdate] = useState(false);

  const getUpdateMethodIcon = (method?: string) => {
    const m = (method ?? '').toString().toLowerCase();
    switch (m) {
      case 'email': return <Mail className="h-3 w-3 text-blue-500" />;
      case 'call': return <Phone className="h-3 w-3 text-green-500" />;
      case 'whatsapp': return <MessageCircle className="h-3 w-3 text-green-600" />;
      default: return <MessageSquare className="h-3 w-3 text-gray-500" />;
    }
  };

  const handleUpdateEdit = async () => {
    if (isEditingUpdate) {
      // Save the edited update via API
      setIsSavingUpdate(true);
      try {
        console.log('Updating latest update with:', {
          issueId: issue.id,
          latestUpdate: editedUpdate
        });
        
        const result = await updateIssueDetails(issue.id, {
          latestUpdate: editedUpdate
        });
        
        console.log('Update result:', result);
        
        if (result.success) {
          // Refetch the issue to get updated data
          await getIssueById(issue.id);
          setIsEditingUpdate(false);
          console.log('Latest update saved successfully');
          toast.success('Latest update saved successfully');
          // Notify parent component of the update
          if (onIssueUpdate) {
            onIssueUpdate();
          }
        } else {
          console.error('Failed to update latest update:', result.error);
          toast.error(`Failed to update: ${result.error}`);
          // Revert to original update
          setEditedUpdate(issue.latestUpdate ?? issue.lastUpdate ?? '');
        }
      } catch (error) {
        console.error('Error updating latest update:', error);
        toast.error('Error updating latest update');
        // Revert to original update
        setEditedUpdate(issue.latestUpdate ?? issue.lastUpdate ?? '');
      } finally {
        setIsSavingUpdate(false);
      }
    } else {
      // Start editing
      setIsEditingUpdate(true);
    }
  };

  const handleCancelUpdateEdit = () => {
    setIsEditingUpdate(false);
    setEditedUpdate(issue.latestUpdate ?? issue.lastUpdate ?? '');
  };

  const handleTitleEdit = () => {
    if (isEditingTitle) {
      const oldTitle = issue.title;
      issue.title = editedTitle;
      // Log the change for audit history
      console.log(`Title changed from "${oldTitle}" to "${editedTitle}"`);
      setIsEditingTitle(false);
    } else {
      setIsEditingTitle(true);
    }
  };

  const handleSummaryEdit = async () => {
    if (isEditingSummary) {
      // Save the edited summary via API
      setIsSavingSummary(true);
      try {
        console.log('Updating summary with:', {
          issueId: issue.id,
          issueDesc: editedSummary
        });
        
        const result = await updateIssueDetails(issue.id, {
          issueDesc: editedSummary
        });
        
        console.log('Summary update result:', result);
        
        if (result.success) {
          // Refetch the issue to get updated data
          await getIssueById(issue.id);
          setIsEditingSummary(false);
          console.log('Summary updated successfully');
          toast.success('Summary updated successfully');
          // Notify parent component of the update
          if (onIssueUpdate) {
            onIssueUpdate();
          }
        } else {
          console.error('Failed to update summary:', result.error);
          toast.error(`Failed to update summary: ${result.error}`);
          // Revert to original summary
          setEditedSummary(issue.issueDesc ?? issue.summary ?? '');
        }
      } catch (error) {
        console.error('Error updating summary:', error);
        toast.error('Error updating summary');
        // Revert to original summary
        setEditedSummary(issue.issueDesc ?? issue.summary ?? '');
      } finally {
        setIsSavingSummary(false);
      }
    } else {
      // Start editing
      setIsEditingSummary(true);
    }
  };

  const handleCancelSummaryEdit = () => {
    setIsEditingSummary(false);
    setEditedSummary(issue.issueDesc ?? issue.summary ?? '');
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* <div className="flex items-center space-x-3 flex-1"> */}
            {/* {isEditingTitle ? (
              <div className="flex items-center space-x-2 flex-1">
                <Input
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
                <Button onClick={handleTitleEdit} variant="outline" size="sm">
                  <Save className="h-3 w-3" />
                </Button>
                <Button onClick={() => setIsEditingTitle(false)} variant="outline" size="sm">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <>
                <Button onClick={handleTitleEdit} variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <CardTitle className="text-lg">{issue.title}</CardTitle>
              </>
            )} */}
          {/* </div> */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Issue ID: {issue.id}</span>
            <span>Category: {issue.issueCategory || issue.category}</span>
            <span>Created: {formatDate(issue.createdDate || issue.dateCreated || issue.date)}</span>
            {issue.dueDate && <span>Due: {formatDate(issue.dueDate)}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Summary</h4>
              {isEditingSummary ? (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleSummaryEdit} 
                    variant="outline" 
                    size="sm"
                    disabled={isSavingSummary}
                    className="flex items-center space-x-1"
                  >
                    {isSavingSummary ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    <span>Save</span>
                  </Button>
                  <Button 
                    onClick={handleCancelSummaryEdit} 
                    variant="outline" 
                    size="sm"
                    disabled={isSavingSummary}
                    className="flex items-center space-x-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleSummaryEdit} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
            
            {isEditingSummary ? (
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="text-sm"
                rows={3}
                placeholder="Enter issue summary..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleSummaryEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelSummaryEdit();
                  }
                }}
                autoFocus
              />
            ) : (
              <p className="text-gray-700 text-sm">{issue.issueDesc || issue.summary || 'No summary provided. Click Edit to add a summary.'}</p>
            )}
          </div>
          <div>
            {/* <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Latest Update</h4>
              {isEditingUpdate ? (
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={handleUpdateEdit} 
                    variant="outline" 
                    size="sm"
                    disabled={isSavingUpdate}
                    className="flex items-center space-x-1"
                  >
                    {isSavingUpdate ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                    ) : (
                      <Save className="h-3 w-3" />
                    )}
                    <span>Save</span>
                  </Button>
                  <Button 
                    onClick={handleCancelUpdateEdit} 
                    variant="outline" 
                    size="sm"
                    disabled={isSavingUpdate}
                    className="flex items-center space-x-1"
                  >
                    <X className="h-3 w-3" />
                    <span>Cancel</span>
                  </Button>
                </div>
              ) : (
                <Button 
                  onClick={handleUpdateEdit} 
                  variant="outline" 
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div> 
             {isEditingUpdate ? (
              <Textarea
                value={editedUpdate}
                onChange={(e) => setEditedUpdate(e.target.value)}
                className="text-sm mb-2"
                rows={3}
                placeholder="Add latest update..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey) {
                    handleUpdateEdit();
                  } else if (e.key === 'Escape') {
                    handleCancelUpdateEdit();
                  }
                }}
                autoFocus
              />
            ) : (
              <p className="text-gray-700 text-sm mb-2">
                {issue.latestUpdate || issue.lastUpdate || 'No updates yet. Click Edit to add an update.'}
              </p>
            )} */}
            
            {(issue.latestUpdate || issue.lastUpdate) && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  {getUpdateMethodIcon(issue.lastUpdateMethod)}
                  <span>Via {issue.lastUpdateMethod || 'system'}</span>
                  <span>by {issue.lastUpdateBy || 'User'}</span>
                </div>
                <span>
                  {issue.lastUpdateDate ? formatDate(issue.lastUpdateDate) : 
                   issue.daysAgo === 0 ? 'today' : `${issue.daysAgo || 0} day${(issue.daysAgo || 0) > 1 ? 's' : ''} ago`}
                </span>
              </div>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default IssueDetailsCard;
