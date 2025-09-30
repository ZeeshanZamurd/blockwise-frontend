
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Mail, Plus, Link } from 'lucide-react';
import { useEmails } from '@/contexts/EmailsContext';
import { useIssues } from '@/contexts/IssuesContext';
import { useNavigate } from 'react-router-dom';

interface CommunicationsSectionProps {
  issueId: string;
  communications?: any[];
}

const CommunicationsSection: React.FC<CommunicationsSectionProps> = ({ issueId, communications = [] }) => {
  const { emails, linkEmailToIssue } = useEmails();
  const { issues, linkIssueToEmail } = useIssues();
  const navigate = useNavigate();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [emailSearchTerm, setEmailSearchTerm] = useState('');
  const [selectedEmailId, setSelectedEmailId] = useState('');

  // Get the current issue to check if it has an emailId
  const currentIssue = issues.find(i => i.id === issueId);
  const issueEmailId = currentIssue?.emailId;

  // Use API communications data if available, otherwise fallback to context emails
  const linkedEmails = communications.length > 0 ? communications : 
    emails.filter(email => issue?.linkedEmailIds?.includes(email.id) || []);

  const filteredEmails = emails.filter(email =>
    email.id.toLowerCase().includes(emailSearchTerm.toLowerCase()) ||
    email.subject.toLowerCase().includes(emailSearchTerm.toLowerCase()) ||
    email.from.toLowerCase().includes(emailSearchTerm.toLowerCase())
  );

  const handleLinkEmail = () => {
    if (selectedEmailId) {
      linkEmailToIssue(selectedEmailId, issueId);
      linkIssueToEmail(issueId, selectedEmailId);
      setIsLinkDialogOpen(false);
      setSelectedEmailId('');
      setEmailSearchTerm('');
      
      // Navigate to email tab
      navigate('/emails');
    }
  };

  const handleEmailIdInput = (emailId: string) => {
    const email = emails.find(e => e.id === emailId);
    if (email) {
      linkEmailToIssue(emailId, issueId);
      linkIssueToEmail(issueId, emailId);
      setEmailSearchTerm('');
      
      // Navigate to email tab
      navigate('/emails');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Communications</CardTitle>
          <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>+ Link Email</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Link Email to Issue</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-2">How to find Email ID:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Email IDs look like this: <code className="bg-blue-100 px-1 rounded">EML-xxxx-xxx</code></li>
                      <li>• Found in the email section under the email subject heading</li>
                      <li>• If an email isn't showing up, forward it to your unique blocwise building email address found in the "Building info" area</li>
                    </ul>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Search by Email ID or details
                  </label>
                  <Input
                    placeholder={issueEmailId ? `Pre-filled: ${issueEmailId}` : "Search emails or enter Email ID..."}
                    value={issueEmailId ? issueEmailId : emailSearchTerm}
                    onChange={(e) => setEmailSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (emailSearchTerm.startsWith('EML-') || issueEmailId)) {
                        handleEmailIdInput(emailSearchTerm || issueEmailId || '');
                      }
                    }}
                    disabled={!!issueEmailId}
                    className={issueEmailId ? 'bg-gray-100' : ''}
                  />
                  {issueEmailId && (
                    <p className="text-xs text-gray-500 mt-1">
                      This issue is already linked to email: {issueEmailId}
                    </p>
                  )}
                </div>
                
                {emailSearchTerm && !emailSearchTerm.startsWith('EML-') && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Email
                    </label>
                    <Select value={selectedEmailId} onValueChange={setSelectedEmailId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an email..." />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredEmails.slice(0, 10).map((email) => (
                          <SelectItem key={email.id} value={email.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{email.id}</span>
                              <span className="text-xs text-muted-foreground">{email.subject}</span>
                              <span className="text-xs text-muted-foreground">From: {email.from}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => {
                      if (issueEmailId) {
                        // If issue has emailId, link it directly
                        handleEmailIdInput(issueEmailId);
                      } else {
                        // Otherwise use the selected email
                        handleLinkEmail();
                      }
                    }}
                    disabled={!selectedEmailId && !issueEmailId}
                    className="flex-1"
                  >
                    {issueEmailId ? 'Link Pre-filled Email' : 'Link Email'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsLinkDialogOpen(false);
                      setSelectedEmailId('');
                      setEmailSearchTerm('');
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
          {linkedEmails.length > 0 ? (
            linkedEmails.map((communication, index) => {
              // Handle both API communication format and context email format
              const isApiFormat = communication.messageId;
              const email = isApiFormat ? {
                id: communication.messageId,
                subject: communication.subject,
                from: communication.fromEmail,
                to: communication.toEmail,
                body: communication.bodyText,
                summary: communication.summary,
                date: communication.messageId // Use messageId as date fallback
              } : communication;
              
              // For demo purposes, mark first email as new
              const isNewEmail = index === 0;
              return (
                <div key={email.id} className={`p-3 rounded-lg border ${
                  isNewEmail 
                    ? "bg-blue-50 border-blue-200" 
                    : "bg-muted/30 border-transparent"
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-foreground text-sm">{email.subject}</h4>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs text-muted-foreground">{email.id}</span>
                      {isNewEmail && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">New</span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">
                    {email.summary || email.aiSummary || 'Email linked to this issue'}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>From: {email.from}</span>
                    <span>To: {email.to || 'N/A'}</span>
                  </div>
                  {isApiFormat && communication.bodyText && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                        View full message
                      </summary>
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-700 max-h-32 overflow-y-auto">
                        {communication.summary}
                      </div>
                    </details>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm">No emails linked to this issue</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommunicationsSection;
