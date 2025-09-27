
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Link2, AlertTriangle, Plus } from 'lucide-react';
import { useIssues } from '@/contexts/IssuesContext';

interface LinkedIssuesProps {
  issueId: string;
  linkedIssues?: any[];
}

const LinkedIssues: React.FC<LinkedIssuesProps> = ({ issueId, linkedIssues = [] }) => {
  const { issues, linkIssueToIssue } = useIssues();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [issueSearchTerm, setIssueSearchTerm] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState('');

  // Get issues linked to this issue
  const currentIssue = issues.find(i => i.id === issueId);
  const linkedIssuesList = issues.filter(issue => 
    currentIssue?.linkedIssueIds?.includes(issue.id) || []
  );

  const filteredIssues = issues.filter(issue =>
    issue.id !== issueId && (
      issue.id.toLowerCase().includes(issueSearchTerm.toLowerCase()) ||
      issue.title.toLowerCase().includes(issueSearchTerm.toLowerCase()) ||
      issue.summary.toLowerCase().includes(issueSearchTerm.toLowerCase())
    )
  );

  const handleLinkIssue = () => {
    if (selectedIssueId) {
      linkIssueToIssue(issueId, selectedIssueId);
      // Also link the reverse relationship
      linkIssueToIssue(selectedIssueId, issueId);
      setIsLinkDialogOpen(false);
      setSelectedIssueId('');
      setIssueSearchTerm('');
    }
  };

  const handleIssueIdInput = (inputIssueId: string) => {
    const issue = issues.find(i => i.id === inputIssueId);
    if (issue && issue.id !== issueId) {
      linkIssueToIssue(issueId, inputIssueId);
      linkIssueToIssue(inputIssueId, issueId);
      setIssueSearchTerm('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'acknowledged': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Linked Issues</CardTitle>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Plus className="h-3 w-3" />
                <span>+ Link Issue</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Link Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">How to find Issue ID:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Issue IDs look like this: <code className="bg-blue-100 px-1 rounded">ISS-xxxx-xxx</code></li>
                      <li>• Found at the top right next to the issue title inside an issue window</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Search by Issue ID or details
                  </label>
                  <Input
                    placeholder="Search issues or enter Issue ID..."
                    value={issueSearchTerm}
                    onChange={(e) => setIssueSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && issueSearchTerm.startsWith('ISS-')) {
                        handleIssueIdInput(issueSearchTerm);
                      }
                    }}
                  />
                </div>
                
                {issueSearchTerm && !issueSearchTerm.startsWith('ISS-') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Issue
                    </label>
                    <Select value={selectedIssueId} onValueChange={setSelectedIssueId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an issue..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredIssues.slice(0, 10).map((issue) => (
                          <SelectItem key={issue.id} value={issue.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{issue.id}</span>
                              <span className="text-xs text-muted-foreground">{issue.title}</span>
                              <span className="text-xs text-muted-foreground">Status: {issue.status}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleLinkIssue} 
                    disabled={!selectedIssueId}
                    className="flex-1"
                  >
                    Link Issue
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsLinkDialogOpen(false);
                      setSelectedIssueId('');
                      setIssueSearchTerm('');
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {linkedIssuesList.length > 0 ? (
            linkedIssuesList.map((linkedIssue) => (
              <div key={linkedIssue.id} className="p-3 bg-muted/30 rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium text-foreground text-sm">{linkedIssue.title}</h4>
                  </div>
                  <Badge className={getStatusColor(linkedIssue.status)} variant="outline">
                    {linkedIssue.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{linkedIssue.id}</span>
                  <span className="text-muted-foreground">{linkedIssue.dateCreated}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Link2 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">No linked issues</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkedIssues;
