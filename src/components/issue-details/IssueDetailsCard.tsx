
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Edit, Mail, Phone, MessageCircle, MessageSquare, Save, X, AlertTriangle, FileText } from 'lucide-react';

interface IssueDetailsCardProps {
  issue: any;
}

const IssueDetailsCard: React.FC<IssueDetailsCardProps> = ({ issue }) => {
  const [isEditingUpdate, setIsEditingUpdate] = useState(false);
  const [editedUpdate, setEditedUpdate] = useState(issue.lastUpdate ?? '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(issue.title ?? '');
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummary, setEditedSummary] = useState(issue.summary ?? '');

  const getUpdateMethodIcon = (method?: string) => {
    const m = (method ?? '').toString().toLowerCase();
    switch (m) {
      case 'email': return <Mail className="h-3 w-3 text-blue-500" />;
      case 'call': return <Phone className="h-3 w-3 text-green-500" />;
      case 'whatsapp': return <MessageCircle className="h-3 w-3 text-green-600" />;
      default: return <MessageSquare className="h-3 w-3 text-gray-500" />;
    }
  };

  const handleUpdateEdit = () => {
    if (isEditingUpdate) {
      issue.lastUpdate = editedUpdate;
      setIsEditingUpdate(false);
    } else {
      setIsEditingUpdate(true);
    }
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

  const handleSummaryEdit = () => {
    if (isEditingSummary) {
      const oldSummary = issue.summary;
      issue.summary = editedSummary;
      // Log the change for audit history
      console.log(`Summary changed from "${oldSummary}" to "${editedSummary}"`);
      setIsEditingSummary(false);
    } else {
      setIsEditingSummary(true);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {isEditingTitle ? (
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
                <CardTitle className="text-lg">{issue.title}</CardTitle>
                <Button onClick={handleTitleEdit} variant="outline" size="sm">
                  <Edit className="h-3 w-3" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Issue ID: {issue.id}</span>
            <span>Category: {issue.category}</span>
            <span>Created: {issue.dateCreated || issue.date}</span>
            {issue.dueDate && <span>Due: {issue.dueDate}</span>}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Summary</h4>
              <Button 
                onClick={handleSummaryEdit} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1"
              >
                <Edit className="h-3 w-3" />
                <span>{isEditingSummary ? 'Save' : 'Edit'}</span>
              </Button>
            </div>
            
            {isEditingSummary ? (
              <Textarea
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="text-sm"
                rows={3}
                placeholder="Enter issue summary..."
              />
            ) : (
              <p className="text-gray-700 text-sm">{issue.summary || 'No summary provided. Click Edit to add a summary.'}</p>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">Latest Update</h4>
              <Button 
                onClick={handleUpdateEdit} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-1"
              >
                <Edit className="h-3 w-3" />
                <span>{isEditingUpdate ? 'Save' : 'Edit'}</span>
              </Button>
            </div>
            
            {isEditingUpdate ? (
              <Textarea
                value={editedUpdate}
                onChange={(e) => setEditedUpdate(e.target.value)}
                className="text-sm mb-2"
                rows={3}
                placeholder="Add latest update..."
              />
            ) : (
              <p className="text-gray-700 text-sm mb-2">
                {issue.lastUpdate || 'No updates yet. Click Edit to add an update.'}
              </p>
            )}
            
            {issue.lastUpdate && (
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  {getUpdateMethodIcon(issue.lastUpdateMethod)}
                  <span>Via {issue.lastUpdateMethod || 'system'}</span>
                  <span>by {issue.lastUpdateBy || 'User'}</span>
                </div>
                <span>
                  {issue.daysAgo === 0 ? 'today' : `${issue.daysAgo || 0} day${(issue.daysAgo || 0) > 1 ? 's' : ''} ago`}
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
