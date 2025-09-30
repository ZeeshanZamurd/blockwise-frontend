import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Mail, MailOpen, Paperclip, Calendar, AlertTriangle, CheckCircle, Clock, Plus, Eye, Edit, Link, Copy } from 'lucide-react';
import { useIssues } from '@/contexts/IssuesContext';
import { useEmails } from '@/contexts/EmailsContext';
import { useEmail, Email } from '@/hooks/useEmail';
import { toast } from 'sonner';

interface EnhancedCommunicationsPanelProps {
  emptyDataMode?: boolean;
}

const EnhancedCommunicationsPanel = ({ emptyDataMode }: EnhancedCommunicationsPanelProps) => {
  if (emptyDataMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Mail className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Email Communications</h2>
          <p className="text-muted-foreground mb-6">
            Intelligent email processing and communication management
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">What you'll see here:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Automatically processed building emails</li>
              <li>• Issue creation from email content</li>
              <li>• Communication threads and responses</li>
              <li>• Attachment management and storage</li>
              <li>• Email categorization and filtering</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  
  const [searchParams] = useSearchParams();
  const { addIssue, updateIssue, issues } = useIssues();
  const { emails, updateEmail, linkEmailToIssue } = useEmails();
  const { fetchEmails } = useEmail();
  const [apiEmails, setApiEmails] = useState<Email[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [isEditingIssue, setIsEditingIssue] = useState(false);
  const [editableIssue, setEditableIssue] = useState('');
  const [editableSummary, setEditableSummary] = useState('');
  const [newIssues, setNewIssues] = useState([{ title: '', summary: '' }]);
  const [showLogMultiple, setShowLogMultiple] = useState(false);
  const [isLinkingEmail, setIsLinkingEmail] = useState(false);
  const [selectedIssueToLink, setSelectedIssueToLink] = useState('');
  const [showBanner, setShowBanner] = useState(true);

  // Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    if (filter === 'review') {
      setActiveTab('review');
    }
  }, [searchParams]);

  // Fetch emails when component mounts
  useEffect(() => {
    const loadEmails = async () => {
      setIsLoadingEmails(true);
      const result = await fetchEmails();
      if (result.success) {
        setApiEmails(result.emails);
      } else {
        console.error('Failed to fetch emails:', result.error);
        toast.error('Failed to load emails');
      }
      setIsLoadingEmails(false);
    };

    loadEmails();
  }, [fetchEmails]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFilteredEmails = () => {
    let filtered = apiEmails;
    
    // Apply tab filter
    switch (activeTab) {
      case 'review':
        filtered = apiEmails.filter(email => email.issueCreationStatus === null);
        break;
      case 'all':
      default:
        filtered = apiEmails.filter(email => email.issueCreationStatus !== null);
        break;
    }
    
    // Apply search filter
    return filtered.filter(email =>
      email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.bodyText.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredEmails = getFilteredEmails();

  // Set default values when email is selected
  useEffect(() => {
    if (selectedEmail) {
      if (selectedEmail.issueCreationStatus === null) {
        // For emails needing review, start with empty fields
        setEditableIssue('');
        setEditableSummary('');
      } else {
        // For completed emails, show AI-generated content
        setEditableIssue(selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issueName : 'Standard Building Maintenance');
        setEditableSummary(selectedEmail.summary || 'AI-generated summary of the email content and required actions.');
      }
      setShowLogMultiple(false);
      setIsLinkingEmail(false);
      setSelectedIssueToLink('');
      
      // Hide banner when any email is viewed
      if (selectedEmail.issueCreationStatus === null) {
        setShowBanner(false);
      }
    }
  }, [selectedEmail]);

  const handleSaveEdit = () => {
    if (editableIssue.trim() && editableSummary.trim()) {
      if (selectedEmail.status === 'Needs Review') {
        // For review emails, create a new issue
        addIssue({
          title: editableIssue,
          summary: editableSummary,
          status: 'Not started',
          priority: selectedEmail?.priority === 'High' ? 'High' : 'Medium',
          emailId: selectedEmail?.id,
          dateCreated: new Date().toISOString().split('T')[0],
          category: 'General'
        });
        
        // Update email status
        updateEmail(selectedEmail.id, { 
          status: 'Completed',
          aiSummary: editableSummary
        });
        
        toast.success('Issue logged successfully!');
      } else {
        // For completed emails, update the summary
        updateEmail(selectedEmail.id, { 
          aiSummary: editableSummary
        });
        toast.success('Issue updated successfully!');
      }
      
      setEditableIssue('');
      setEditableSummary('');
    }
  };

  const handleLinkToExistingIssue = () => {
    if (selectedIssueToLink && selectedEmail) {
      linkEmailToIssue(selectedEmail.id, selectedIssueToLink);
      toast.success(`Email linked to issue ${selectedIssueToLink}`);
      setIsLinkingEmail(false);
      setSelectedIssueToLink('');
    }
  };

  const handleAddNewIssue = () => {
    setNewIssues([...newIssues, { title: '', summary: '' }]);
  };

  const handleNewIssueChange = (index: number, field: 'title' | 'summary', value: string) => {
    const updated = [...newIssues];
    updated[index][field] = value;
    setNewIssues(updated);
  };

  const handleLogIssues = () => {
    const validIssues = newIssues.filter(issue => issue.title.trim() && issue.summary.trim());
    if (validIssues.length > 0) {
      // Use the issues context to add issues
      validIssues.forEach((issue) => {
        addIssue({
          title: issue.title,
          summary: issue.summary,
          status: 'Not started',
          priority: selectedEmail?.priority === 'High' ? 'High' : 'Medium',
          emailId: selectedEmail?.id,
          dateCreated: new Date().toISOString().split('T')[0],
          category: 'General'
        });
      });
      
      setNewIssues([{ title: '', summary: '' }]);
      toast.success(`${validIssues.length} issue(s) logged successfully!`);
    }
  };

  const copyEmailId = (emailId: string) => {
    navigator.clipboard.writeText(emailId);
    toast.success('Email ID copied to clipboard');
  };

  return (
    <div className="p-6 h-full">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-foreground mb-2">Emails</h2>
        <p className="text-muted-foreground">Manage building-related communications</p>
        
        {/* Show attention banner if there are emails needing review and banner is not dismissed */}
        {apiEmails.filter(e => e.issueCreationStatus === null).length > 0 && showBanner && (
          <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-500 p-2 rounded-full mr-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-orange-900 font-bold text-lg">
                    {apiEmails.filter(e => e.issueCreationStatus === null).length} Email{apiEmails.filter(e => e.issueCreationStatus === null).length > 1 ? 's' : ''} Need{apiEmails.filter(e => e.issueCreationStatus === null).length === 1 ? 's' : ''} Immediate Review
                  </p>
                  <p className="text-orange-700 text-sm">
                    Critical emails require manual review to ensure proper issue logging and response
                  </p>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setActiveTab('review');
                  setShowBanner(false);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-2"
              >
                Review Now
              </Button>
            </div>
          </div>
        )}
        
        {selectedEmail && selectedEmail.status === 'Needs Review' && (
          <div className="mt-4 bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <p className="text-sm text-orange-700 font-medium">
                Manual review required - edit manually to log issue
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex h-[calc(100vh-200px)] gap-4">
        {/* Left Panel - Email List */}
        <div className="w-1/3">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">Emails</TabsTrigger>
                  <TabsTrigger value="review">
                    Need Review
                    {apiEmails.filter(e => e.issueCreationStatus === null).length > 0 && (
                      <Badge variant="outline" className="ml-1 bg-orange-50 text-orange-700">
                        {apiEmails.filter(e => e.issueCreationStatus === null).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search emails..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {isLoadingEmails ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading emails...</p>
                  </div>
                ) : (
                  filteredEmails.map((email) => (
                    <div
                      key={email.messageId}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${
                        selectedEmail?.messageId === email.messageId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                          {email.issueCreationStatus === null ? (
                          <Mail className="h-4 w-4 text-primary" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                          <span className={`text-sm ${email.issueCreationStatus === null ? 'font-semibold' : 'text-foreground'}`}>
                            {email.fromEmail}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                              copyEmailId(email.messageId);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                          {email.issueCreationStatus === null && <div className="w-2 h-2 bg-primary rounded-full"></div>}
                          {email.issueCreationStatus === null && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs">
                            Review
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                          <span className="text-xs text-muted-foreground">{email.messageId.substring(0, 8)}...</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-xs text-muted-foreground">ID: {email.messageId}</span>
                    </div>
                      <h4 className={`text-sm mb-1 ${email.issueCreationStatus === null ? 'font-semibold' : 'text-foreground'}`}>
                      {email.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                        {email.bodyText.substring(0, 100)}...
                    </p>
                  </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - Email Body */}
        <div className="w-1/3">
          <Card className="h-full">
            {selectedEmail ? (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{selectedEmail.subject}</h3>
                    <Badge className={getPriorityColor(selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issuePriority : 'Medium')}>
                      {selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issuePriority : 'Medium'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>ID: {selectedEmail.messageId}</p>
                    <p>From: {selectedEmail.fromEmail}</p>
                    <p>To: {selectedEmail.toEmail}</p>
                  </div>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="prose prose-sm max-w-none">
                    {selectedEmail.bodyText.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="mb-2">Select an email to view its content</p>
                  <p className="text-sm">Click on an email to view its content and the AI summary and issues logged</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Right Panel - AI Summary & Actions */}
        <div className="w-1/3">
          <Card className="h-full">
            {selectedEmail ? (
              <>
                <CardHeader>
                  <CardTitle className="text-lg">AI Summary & Issues Logged</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                   {/* Status & Priority */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="font-medium text-foreground">Status</h4>
                         <Badge className={selectedEmail.issueCreationStatus === null ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                           {selectedEmail.issueCreationStatus === null ? 'Needs Review' : 'Issue Created'}
                         </Badge>
                       </div>
                       <Badge className={getPriorityColor(selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issuePriority : 'Medium')}>
                         {selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issuePriority : 'Medium'} Priority
                     </Badge>
                   </div>

                   <Separator />

                   {selectedEmail.issueCreationStatus === null ? (
                     /* Need Review Email - Manual Creation */
                     <div>
                       <h4 className="font-medium text-foreground mb-3">Manual Issue Creation</h4>
                       
                       <div className="space-y-4">
                         <div>
                           <label className="text-sm font-medium text-foreground mb-1 block">
                             Issue Title
                           </label>
                           <Input
                             value={editableIssue}
                             onChange={(e) => setEditableIssue(e.target.value)}
                             placeholder="Enter issue title..."
                           />
                         </div>
                         
                         <div>
                           <label className="text-sm font-medium text-foreground mb-1 block">
                             Issue Summary
                           </label>
                           <Textarea
                             value={editableSummary}
                             onChange={(e) => setEditableSummary(e.target.value)}
                             placeholder="Enter issue summary..."
                             rows={3}
                           />
                         </div>

                         {/* Link to Existing Issue */}
                         <div>
                           <label className="text-sm font-medium text-foreground mb-2 block">
                             Link to Existing Issue
                           </label>
                           {!isLinkingEmail ? (
                             <Button 
                               variant="outline" 
                               onClick={() => setIsLinkingEmail(true)}
                               className="w-full"
                             >
                               <Link className="h-4 w-4 mr-2" />
                               Link to Existing Issue
                             </Button>
                           ) : (
                              <div className="space-y-2">
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
                                <Select value={selectedIssueToLink} onValueChange={setSelectedIssueToLink}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select an existing issue..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {issues.map((issue) => (
                                      <SelectItem key={issue.id} value={issue.id}>
                                        {issue.id} - {issue.title}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <div className="flex space-x-2">
                                  <Button 
                                    onClick={handleLinkToExistingIssue}
                                    disabled={!selectedIssueToLink}
                                    size="sm"
                                  >
                                    Link Email
                                 </Button>
                                 <Button 
                                   variant="outline" 
                                   onClick={() => {
                                     setIsLinkingEmail(false);
                                     setSelectedIssueToLink('');
                                   }}
                                   size="sm"
                                 >
                                   Cancel
                                 </Button>
                               </div>
                             </div>
                           )}
                         </div>

                         <div className="flex space-x-2">
                           <Button onClick={handleSaveEdit} className="flex-1">
                             Log Issue
                           </Button>
                           <Button 
                             variant="outline" 
                             onClick={() => setShowLogMultiple(!showLogMultiple)}
                             className="flex-1"
                           >
                             <Plus className="h-4 w-4 mr-2" />
                             {showLogMultiple ? 'Hide' : 'Log Multiple Issues'}
                           </Button>
                         </div>
                       </div>
                     </div>
                   ) : (
                     /* Completed Email - Show AI Results */
                     <div>
                       <h4 className="font-medium text-foreground mb-3">
                         Issue Summary
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setIsEditingIssue(!isEditingIssue)}
                           className="ml-2"
                         >
                           <Edit className="h-4 w-4" />
                         </Button>
                       </h4>
                       
                       {isEditingIssue ? (
                         <div className="space-y-4">
                           <div>
                             <label className="text-sm font-medium text-foreground mb-1 block">
                               Issue Summary
                             </label>
                             <Textarea
                               value={editableSummary}
                               onChange={(e) => setEditableSummary(e.target.value)}
                               placeholder="Enter issue summary..."
                               rows={3}
                             />
                           </div>

                           <div className="flex space-x-2">
                             <Button onClick={handleSaveEdit} size="sm">
                               Save Changes
                             </Button>
                             <Button 
                               variant="outline" 
                               onClick={() => setIsEditingIssue(false)}
                               size="sm"
                             >
                               Cancel
                             </Button>
                           </div>
                         </div>
                       ) : (
                         <div className="space-y-3">
                           <div className="p-3 bg-green-50 rounded-lg">
                             <div className="flex items-center mb-2">
                               <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                               <span className="text-sm font-medium text-green-800">
                                 Issue Created
                               </span>
                             </div>
                             <p className="text-sm text-green-700">
                               {selectedEmail.summary}
                             </p>
                           </div>
                           
                           {selectedEmail.associatedIssues && selectedEmail.associatedIssues.length > 0 && (
                             <div>
                               <h5 className="text-sm font-medium text-foreground mb-2">Associated Issues</h5>
                               <div className="space-y-1">
                                 {selectedEmail.associatedIssues.map((issue) => (
                                   <div key={issue.id} className="flex items-center space-x-2 p-2 bg-primary/5 rounded text-sm">
                                     <AlertTriangle className="h-4 w-4 text-primary" />
                                     <div className="flex-1">
                                       <span className="text-primary font-medium">{issue.issueName}</span>
                                       <p className="text-xs text-gray-600">{issue.issueDesc}</p>
                                     </div>
                                     <Badge className={getPriorityColor(issue.issuePriority)}>
                                       {issue.issuePriority}
                                     </Badge>
                                   </div>
                                 ))}
                               </div>
                             </div>
                           )}
                         </div>
                       )}
                     </div>
                   )}

                   {showLogMultiple && (
                     <>
                       <Separator />
                       
                       {/* Log Multiple Issues Section */}
                       <div>
                         <h4 className="font-medium text-foreground mb-3">Additional Issues</h4>
                         <p className="text-sm text-muted-foreground mb-3">Add more issues from this email</p>
                         
                         {newIssues.map((issue, index) => (
                           <div key={index} className="mb-4 p-3 bg-muted/30 rounded-lg">
                             <div className="space-y-3">
                               <div>
                                 <label className="text-sm font-medium text-foreground mb-1 block">
                                   Issue Title
                                 </label>
                                 <Input
                                   placeholder="Enter issue title..."
                                   value={issue.title}
                                   onChange={(e) => handleNewIssueChange(index, 'title', e.target.value)}
                                 />
                               </div>
                               <div>
                                 <label className="text-sm font-medium text-foreground mb-1 block">
                                   Summary
                                 </label>
                                 <Textarea
                                   placeholder="Enter issue summary..."
                                   value={issue.summary}
                                   onChange={(e) => handleNewIssueChange(index, 'summary', e.target.value)}
                                   rows={3}
                                 />
                               </div>
                             </div>
                           </div>
                         ))}
                         
                         <div className="flex space-x-2">
                           <Button variant="outline" onClick={handleAddNewIssue} className="flex-1">
                             <Plus className="h-4 w-4 mr-2" />
                             Add Another Issue
                           </Button>
                           <Button onClick={handleLogIssues} className="flex-1">
                             Log All Issues
                           </Button>
                         </div>
                       </div>
                     </>
                   )}

                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Select an email to view AI analysis</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCommunicationsPanel;