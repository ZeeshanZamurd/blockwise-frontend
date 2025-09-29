
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from 'react';
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
import { useIssue } from '@/hooks/useIssue';
import { useBuilding } from '@/hooks/useBuilding';

interface Issue {
  id: string;
  title?: string;
  issueName?: string;
  status?: string;
  issueStatus?: string;
  priority?: string;
  issuePriority?: string;
  category?: string;
  issueCategory?: string;
  summary?: string;
  issueDesc?: string;
  dateCreated?: string;
  createdDate?: string;
  lastUpdated?: string;
  lastUpdateDate?: string;
  relatedCommunications?: unknown[];
  linkedIssues?: unknown[];
  auditHistory?: unknown[];
  directorComments?: unknown[];
}

interface EnhancedIssueDetailsModalProps {
  issue: Issue;
  onClose: () => void;
}

const EnhancedIssueDetailsModal: React.FC<EnhancedIssueDetailsModalProps> = ({ issue, onClose }) => {
  const { issues, updateIssue } = useIssues();
  const { getIssueById, updateIssueStatus } = useIssue();
  const { building } = useBuilding();
  const [detailedIssue, setDetailedIssue] = useState<Issue | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const hasFetchedRef = useRef<string | null>(null);
  
  const currentIssue = issues.find(i => i.id === issue.id) ?? issue;

  // Fetch detailed issue data when modal opens
  useEffect(() => {
    // Only fetch if we haven't already fetched data for this issue
    if (hasFetchedRef.current === issue.id) {
      return;
    }

    const fetchDetailedIssue = async () => {
      setIsLoadingDetails(true);
      hasFetchedRef.current = issue.id;
      
      const result = await getIssueById(issue.id);
      
      if (result.success) {
        setDetailedIssue(result.issue);
        console.log('Detailed issue data loaded:', result.issue);
      } else {
        console.error('Failed to fetch detailed issue:', result.error);
        // Fallback to basic issue data
        setDetailedIssue(issue);
      }
      setIsLoadingDetails(false);
    };

    fetchDetailedIssue();
  }, [issue.id, getIssueById]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = async (newStatus: string) => {
    // Update local Redux state immediately for better UX
    updateIssue(issue.id, { status: newStatus as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused' });
    
    // Update on server with buildingId for background refresh
    const result = await updateIssueStatus(issue.id, newStatus, building?.buildingId);
    
    if (result.success) {
      console.log('Issue status updated successfully:', result.issue);
      // Update the detailed issue data if we have it
      if (detailedIssue) {
        setDetailedIssue({
          ...detailedIssue,
          issueStatus: newStatus === 'Not started' ? 'NOT_STARTED' :
                      newStatus === 'In progress' ? 'IN_PROGRESS' :
                      newStatus === 'In review' ? 'IN_REVIEW' :
                      newStatus === 'Closed' ? 'CLOSED' :
                      newStatus === 'Paused' ? 'PAUSED' : 'NOT_STARTED'
        });
      }
    } else {
      console.error('Failed to update issue status:', result.error);
      // Revert the local change if API call failed
      updateIssue(issue.id, { status: (displayIssue as any).status as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused' });
    }
  };

  // Use detailed issue data if available, otherwise fallback to basic issue
  const displayIssue = detailedIssue || currentIssue;
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
              <span className="text-base md:text-lg truncate">
                {(displayIssue as any).issueName || (displayIssue as any).title}
              </span>
              {(() => {
                const lastVisit = localStorage.getItem('issues_last_visit') ? new Date(localStorage.getItem('issues_last_visit')!) : new Date(Date.now() - 24 * 60 * 60 * 1000);
                const issueDate = (displayIssue as any).createdDate ? new Date((displayIssue as any).createdDate) : new Date((displayIssue as any).dateCreated);
                const isNewSinceVisit = issueDate > lastVisit;
                const isUpdatedSinceVisit = (displayIssue as any).lastUpdateDate && new Date((displayIssue as any).lastUpdateDate) > lastVisit;
                
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
                currentStatus={(() => {
                  const apiStatus = (displayIssue as any).issueStatus;
                  const contextStatus = (displayIssue as any).status;
                  
                  if (apiStatus === 'NOT_STARTED') return 'Not started';
                  if (apiStatus === 'IN_PROGRESS') return 'In progress';
                  if (apiStatus === 'IN_REVIEW') return 'In review';
                  if (apiStatus === 'CLOSED') return 'Closed';
                  if (apiStatus === 'PAUSED') return 'Paused';
                  
                  return contextStatus || 'Not started';
                })() as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused'} 
                onStatusChange={handleStatusChange}
              />
              <Badge className={`${getPriorityColor((displayIssue as any).issuePriority || (displayIssue as any).priority)} text-xs md:text-sm px-2 py-0.5`}>
                {(displayIssue as any).issuePriority || (displayIssue as any).priority}
              </Badge>
              <Button onClick={() => handleShare(displayIssue as any)} variant="outline" size="sm">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="space-y-4 md:space-y-6 p-4 md:p-6 pt-0">
            {/* Issue Details */}
            <IssueDetailsCard issue={displayIssue} />

            {/* Communications Section */}
            <CommunicationsSection 
              issueId={issue.id} 
              communications={(displayIssue as any).relatedCommunications || []}
            />

            {/* Director Comments */}
            <DirectorComments directorComments={(displayIssue as any).directorComments || []} />

            {/* Two Column Layout - Stack on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <AuditHistory auditHistory={(displayIssue as any).auditHistory || []} />
              <LinkedIssues 
                issueId={issue.id} 
                linkedIssues={(displayIssue as any).linkedIssues || []}
              />
            </div>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedIssueDetailsModal;
