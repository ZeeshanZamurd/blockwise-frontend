
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Share } from 'lucide-react';
import IssueDetailsCard from './issue-details/IssueDetailsCard';
import SubTasks from './issue-details/SubTasks';
import DirectorComments from './issue-details/DirectorComments';
import AuditHistory from './issue-details/AuditHistory';
import CommunicationsSection from './issue-details/CommunicationsSection';
import LinkedIssues from './issue-details/LinkedIssues';
import StatusSelector from './issue-details/StatusSelector';
import { getStatusColor, getPriorityColor, handleShare } from './issue-details/utils';
import { useIssues } from '@/contexts/IssuesContext';

interface EnhancedIssueDetailsModalProps {
  issue: any;
  onClose: () => void;
}

const EnhancedIssueDetailsModal: React.FC<EnhancedIssueDetailsModalProps> = ({ issue, onClose }) => {
  const { issues, updateIssue } = useIssues();
  const currentIssue = issues.find(i => i.id === issue.id) ?? issue;

  const handleStatusChange = (newStatus: string) => {
    updateIssue(issue.id, { status: newStatus as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused' });
  };
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 flex flex-col">
        <DialogDescription className="sr-only">
          Issue details and management interface
        </DialogDescription>
        <DialogHeader className="p-4 md:p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-base md:text-lg truncate">{issue.title}</span>
              {(() => {
                const lastVisit = localStorage.getItem('issues_last_visit') ? new Date(localStorage.getItem('issues_last_visit')!) : new Date(Date.now() - 24 * 60 * 60 * 1000);
                const isNewSinceVisit = new Date(issue.dateCreated) > lastVisit;
                const isUpdatedSinceVisit = issue.lastUpdated && new Date(issue.lastUpdated) > lastVisit;
                
                if (isUpdatedSinceVisit) {
                  return <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 flex-shrink-0">Updated</Badge>;
                } else if (isNewSinceVisit) {
                  return <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 flex-shrink-0">New</Badge>;
                }
                return null;
              })()}
            </div>
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <StatusSelector 
                currentStatus={currentIssue.status} 
                onStatusChange={handleStatusChange}
              />
              <Badge className={`${getPriorityColor(currentIssue.priority)} text-xs md:text-sm px-2 py-0.5`}>{currentIssue.priority}</Badge>
              <Button onClick={() => handleShare(currentIssue)} variant="outline" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
            {/* Issue Details */}
            <IssueDetailsCard issue={currentIssue} />

            {/* Communications Section */}
            <CommunicationsSection issueId={issue.id} />

            {/* Director Comments */}
            <DirectorComments />

            {/* Two Column Layout - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <AuditHistory />
              <LinkedIssues issueId={issue.id} />
            </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedIssueDetailsModal;
