
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Mail, FileText, User, Calendar, Clock, MessageSquare, Link2, X } from 'lucide-react';

interface IssueDetailsModalProps {
  issue: any;
  onClose: () => void;
}

const IssueDetailsModal: React.FC<IssueDetailsModalProps> = ({ issue, onClose }) => {
  console.log('Issue Details Modal', issue);
  // Mock audit history data
  const auditHistory = [
    {
      id: 1,
      type: 'created',
      date: '2024-06-25 09:30',
      user: 'System',
      description: 'Issue created from email from Resident (Flat 12A)',
      details: 'Automatic issue creation from email thread'
    },
    {
      id: 2,
      type: 'status_change',
      date: '2024-06-25 14:20',
      user: 'Managing Agent',
      description: 'Status changed from New to Acknowledged',
      details: 'Issue acknowledged and assigned to maintenance team'
    },
    {
      id: 3,
      type: 'comment',
      date: '2024-06-26 10:15',
      user: 'Director (Sarah Wilson)',
      description: 'Added director comment',
      details: 'This is critical for building safety compliance. Please prioritize and provide timeline.'
    },
    {
      id: 4,
      type: 'update',
      date: '2024-06-26 16:45',
      user: 'Managing Agent',
      description: 'Latest update added',
      details: 'Contractor confirmed availability for next week'
    }
  ];

  // Mock email communications
  const emailCommunications = [
    {
      id: 1,
      subject: 'Urgent: Elevator maintenance overdue',
      from: 'resident.flat12a@building.co.uk',
      to: 'managingagent@property.com',
      date: '2024-06-25 09:30',
      summary: 'Resident reported elevator issues and requested immediate attention',
      hasAttachment: false,
      threadCount: 1
    },
    {
      id: 2,
      subject: 'Re: Elevator maintenance - Contractor Response',
      from: 'contractor@elevatorservice.com',
      to: 'managingagent@property.com',
      date: '2024-06-26 11:20',
      summary: 'Contractor confirmed availability and provided preliminary assessment',
      hasAttachment: true,
      threadCount: 3
    },
    {
      id: 3,
      subject: 'Elevator Service Update',
      from: 'managingagent@property.com',
      to: 'directors@building.co.uk',
      date: '2024-06-26 16:45',
      summary: 'Weekly update on elevator maintenance progress',
      hasAttachment: false,
      threadCount: 1
    }
  ];

  // Mock linked issues
  const linkedIssues = [
    {
      id: 12,
      title: 'Elevator annual inspection - 2023',
      status: 'Resolved',
      date: '2023-06-15',
      relationship: 'Previous Year'
    },
    {
      id: 8,
      title: 'Elevator emergency button fault',
      status: 'Resolved',
      date: '2024-03-10',
      relationship: 'Related Safety Issue'
    }
  ];

  // Mock director comments
  const directorComments = [
    {
      id: 1,
      author: 'Sarah Wilson (Director)',
      date: '2024-06-26 10:15',
      comment: 'This is critical for building safety compliance. Please prioritize and provide timeline.',
      isPrivate: false
    },
    {
      id: 2,
      author: 'Mike Thompson (Director)',
      date: '2024-06-26 18:30',
      comment: 'Agreed. We should also review our maintenance contract terms to prevent this recurring.',
      isPrivate: true
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'in progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'acknowledged': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuditIcon = (type: string) => {
    switch (type) {
      case 'created': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'status_change': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'update': return <Mail className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 flex flex-col">
        <DialogDescription className="sr-only">
          Issue details and management interface with tabs for overview, audit trail, communications, comments, and linked issues
        </DialogDescription>
        <DialogHeader className="p-6 pb-0 flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>{issue.title}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${getStatusColor(issue.status)} text-base px-3 py-1`}>{issue.status}</Badge>
              <Badge className={`${getPriorityColor(issue.priority)} text-base px-3 py-1`}>{issue.priority}</Badge>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6 pt-0">
              <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audit">Audit Trail</TabsTrigger>
              <TabsTrigger value="emails">Communications</TabsTrigger>
              <TabsTrigger value="comments">Comments</TabsTrigger>
              <TabsTrigger value="linked">Linked Issues</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Issue Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                    <p className="text-gray-700">{issue.summary}</p>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Category</h4>
                      <p className="text-gray-700">{issue.category}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Created Date</h4>
                      <p className="text-gray-700">{issue.date}</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Latest Update</h4>
                    <p className="text-gray-700">{issue.lastUpdate}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Updated {issue.daysAgo === 0 ? 'today' : `${issue.daysAgo} day${issue.daysAgo > 1 ? 's' : ''} ago`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Complete Audit History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditHistory.map((entry) => (
                      <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="mt-1">
                          {getAuditIcon(entry.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900">{entry.description}</h4>
                            <span className="text-xs text-gray-500">{entry.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{entry.details}</p>
                          <p className="text-xs text-gray-500">By: {entry.user}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="emails" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Email Communications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {emailCommunications.map((email) => (
                      <div key={email.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{email.subject}</h4>
                          <div className="flex items-center space-x-1">
                            {email.hasAttachment && <FileText className="h-3 w-3 text-gray-400" />}
                            <span className="text-xs text-gray-500">{email.threadCount} messages</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{email.summary}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>From: {email.from}</span>
                          <span>{email.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Director Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {directorComments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">{comment.author}</span>
                            {comment.isPrivate && (
                              <Badge variant="outline" className="text-xs">Private</Badge>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-700">{comment.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="linked" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Linked & Historical Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {linkedIssues.map((linkedIssue) => (
                      <div key={linkedIssue.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-1">
                          <div className="flex items-center space-x-2">
                            <Link2 className="h-4 w-4 text-gray-500" />
                            <h4 className="font-medium text-gray-900">{linkedIssue.title}</h4>
                          </div>
                          <Badge className={`${getStatusColor(linkedIssue.status)} text-base px-3 py-1`}>{linkedIssue.status}</Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{linkedIssue.relationship}</span>
                          <span className="text-gray-500">{linkedIssue.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IssueDetailsModal;
