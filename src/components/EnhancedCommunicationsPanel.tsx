import React, { useState, useEffect, useCallback } from 'react';
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
import { Search, Mail, MailOpen, Paperclip, Calendar, AlertTriangle, CheckCircle, Clock, Plus, Eye, Edit, Link, Copy, X } from 'lucide-react';
import { useIssues } from '@/contexts/IssuesContext';
import { useEmails } from '@/contexts/EmailsContext';
import { useEmail, Email } from '@/hooks/useEmail';
import { useIssue } from '@/hooks/useIssue';
import { useBuilding } from '@/hooks/useBuilding';
import { toast } from 'sonner';

interface EnhancedCommunicationsPanelProps {
  emptyDataMode?: boolean;
}

const EnhancedCommunicationsPanel = ({ emptyDataMode }: EnhancedCommunicationsPanelProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addIssue, updateIssue, issues } = useIssues();
  const { emails, updateEmail, linkEmailToIssue } = useEmails();
  const { fetchEmails, fetchEmailById } = useEmail();
  const { createIssue } = useIssue();
  const { building } = useBuilding();
  const [apiEmails, setApiEmails] = useState<Email[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isFilteredByEmailId, setIsFilteredByEmailId] = useState(false);
  
  // Debug: Track when apiEmails changes
  useEffect(() => {
    console.log('apiEmails state changed:', apiEmails.length, 'emails');
    console.log('apiEmails status breakdown:', {
      inReview: apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length,
      notInReview: apiEmails.filter(e => e.issueCreationStatus !== "IN_REVIEW").length,
      total: apiEmails.length
    });
    
    // Check for duplicates
    const messageIds = apiEmails.map(e => e.messageId);
    const uniqueMessageIds = [...new Set(messageIds)];
    if (messageIds.length !== uniqueMessageIds.length) {
      console.warn('Duplicate emails detected! Total:', messageIds.length, 'Unique:', uniqueMessageIds.length);
    }
  }, [apiEmails]);
  
  // Debug: Track when selectedEmail changes
  useEffect(() => {
    if (selectedEmail) {
      console.log('Selected email changed:', {
        id: selectedEmail.id,
        messageId: selectedEmail.messageId,
        subject: selectedEmail.subject,
        status: selectedEmail.issueCreationStatus
      });
    } else {
      console.log('Selected email cleared');
    }
  }, [selectedEmail]);
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

  // Helper function to deduplicate emails by messageId
  const deduplicateEmails = useCallback((emails: Email[]): Email[] => {
    return emails.reduce((acc: Email[], current: Email) => {
      const exists = acc.find(email => email.messageId === current.messageId);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, []);
  }, []);

  const loadAllEmails = useCallback(async () => {
    console.log('Loading all emails...');
    setIsLoadingEmails(true);
    try {
      const result = await fetchEmails();
      if (result.success) {
        // Deduplicate emails by messageId
        const uniqueEmails = deduplicateEmails(result.emails);
        
        console.log('Loaded emails:', result.emails.length, 'Unique emails:', uniqueEmails.length);
        setApiEmails(uniqueEmails);
        setIsFilteredByEmailId(false);
      } else {
        console.error('Failed to fetch emails:', result.error);
        toast.error('Failed to load emails');
      }
    } catch (error) {
      console.error('Error loading emails:', error);
      toast.error('Failed to load emails');
    } finally {
      setIsLoadingEmails(false);
    }
  }, [fetchEmails, deduplicateEmails]);

  const handleFetchEmailById = useCallback(async (emailId: string) => {
    console.log('handleFetchEmailById called with emailId:', emailId);
    setIsLoadingEmails(true);
    
    try {
      const result = await fetchEmailById(emailId);
      
      if (result.success) {
        console.log('Email fetched successfully:', result.email);
        console.log('Setting apiEmails to single email:', [result.email]);
        setApiEmails([result.email]); // Set only this email in the list
        setSelectedEmail(result.email); // Auto-select this email
        setIsFilteredByEmailId(true); // Mark as filtered
        console.log('Email should now be displayed in the list');
      } else {
        console.error('Failed to fetch email:', result.error);
        toast.error(`Failed to load email: ${result.error}`);
        // Load all emails as fallback
        await loadAllEmails();
      }
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      toast.error('Failed to load email');
      // Load all emails as fallback
      await loadAllEmails();
    } finally {
      setIsLoadingEmails(false);
    }
  }, [fetchEmailById, loadAllEmails]);

  // Handle URL filter parameter
  useEffect(() => {
    const filter = searchParams.get('filter');
    const emailId = searchParams.get('emailId');
    
    if (filter === 'review') {
      setActiveTab('review');
    }
    
    // If emailId is provided, fetch that specific email
    if (emailId) {
      console.log('EmailId filter applied, fetching email by ID:', emailId);
      handleFetchEmailById(emailId);
    } else if (isFilteredByEmailId) {
      // If emailId was removed from URL and we were previously filtered, load all emails
      console.log('EmailId filter removed, loading all emails...');
      loadAllEmails();
    }
  }, [searchParams, handleFetchEmailById, isFilteredByEmailId, loadAllEmails]);

  // Fetch emails when component mounts (only if no emailId filter)
  useEffect(() => {
    const emailId = searchParams.get('emailId');
    
    // Only load all emails if no emailId filter is applied and we're not already filtered
    if (!emailId && !isFilteredByEmailId) {
      console.log('Component mounted, loading all emails...');
      loadAllEmails();
    }
  }, [fetchEmails, searchParams, loadAllEmails, isFilteredByEmailId]);

  // Set default values when email is selected
  useEffect(() => {
    if (selectedEmail) {
      if (selectedEmail.issueCreationStatus === "IN_REVIEW") {
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
      if (selectedEmail.issueCreationStatus === "IN_REVIEW") {
        setShowBanner(false);
      }
    }
  }, [selectedEmail]);

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
    
    // Apply emailId filter if provided in URL
    const emailId = searchParams.get('emailId');
    console.log('getFilteredEmails - emailId from URL:', emailId);
    console.log('getFilteredEmails - total apiEmails:', apiEmails.length);
    console.log('getFilteredEmails - issueCreationStatus breakdown:', {
      inReview: apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length,
      notInReview: apiEmails.filter(e => e.issueCreationStatus !== "IN_REVIEW").length,
      total: apiEmails.length
    });
    
    // Debug: Show all IN_REVIEW emails with their IDs
    const inReviewEmails = apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW");
    console.log('IN_REVIEW emails:', inReviewEmails.map(e => ({ id: e.id, messageId: e.messageId, subject: e.subject })));
    
    // Debug: Show all emails with their status
    console.log('All emails with status:', apiEmails.map(e => ({ id: e.id, messageId: e.messageId, subject: e.subject, status: e.issueCreationStatus })));
    
    // Debug: Check for duplicate messageIds
    const messageIds = apiEmails.map(e => e.messageId);
    const duplicateMessageIds = messageIds.filter((id, index) => messageIds.indexOf(id) !== index);
    if (duplicateMessageIds.length > 0) {
      console.log('Duplicate messageIds found:', duplicateMessageIds);
    }
    
    // Debug: Check for duplicate IDs
    const ids = apiEmails.map(e => e.id).filter(id => id !== undefined);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length > 0) {
      console.log('Duplicate IDs found:', duplicateIds);
    }
    
    if (emailId) {
      // Try to match by id first, then by messageId as fallback
      filtered = filtered.filter(email => 
        email.id?.toString() === emailId || 
        email.emailId?.toString() === emailId || 
        email.messageId === emailId
      );
      console.log('Filtering by emailId:', emailId, 'Found emails:', filtered.length);
      console.log('Available emails for filtering:', apiEmails.map(e => ({ id: e.id, emailId: e.emailId, messageId: e.messageId })));
    } else {
      console.log('No emailId filter applied, showing all emails:', filtered.length);
    }
    
    // Apply tab filter
    switch (activeTab) {
      case 'review':
        // Show only emails that need review (issueCreationStatus === "IN_REVIEW")
        filtered = filtered.filter(email => email.issueCreationStatus === "IN_REVIEW");
        console.log('Review tab - emails needing review (IN_REVIEW):', filtered.length);
        break;
      case 'all':
      default:
        // Show all emails regardless of status
        // No filtering needed for 'all' tab
        console.log('All tab - showing all emails:', filtered.length);
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

  const handleSaveEdit = async () => {
    console.log('handleSaveEdit called');
    console.log('selectedEmail:', selectedEmail);
    console.log('editableIssue:', editableIssue);
    console.log('editableSummary:', editableSummary);
    console.log('building:', building);
    
    if (editableIssue.trim() && editableSummary.trim()) {
      // Check if email needs review (issueCreationStatus === "IN_REVIEW" means it needs review)
      if (selectedEmail.issueCreationStatus === "IN_REVIEW") {
        console.log('Creating issue via API...');
        // For review emails, create a new issue via API
        try {
          const issueData = {
            buildingId: building?.buildingId || 0,
            issueName: editableIssue,
            issueDesc: editableSummary,
            issueCategory: 'General',
            issuePriority: selectedEmail?.priority === 'High' ? 'High' : 'Medium',
            emailId: selectedEmail?.emailId || selectedEmail?.id || undefined
          };
          
          console.log('Sending issue data:', issueData);
          console.log('Email ID being sent:', selectedEmail?.emailId || selectedEmail?.id || 'undefined');
          const result = await createIssue(issueData);
          console.log('Create issue result:', result);
          
          if (result.success) {
            // Update email status (only if we have an ID)
            if (selectedEmail?.id || selectedEmail?.emailId) {
              const emailId = selectedEmail?.emailId || selectedEmail?.id;
              updateEmail(emailId.toString(), { 
          status: 'Completed',
          aiSummary: editableSummary
        });
            }
        
        toast.success('Issue logged successfully!');
          } else {
            toast.error(result.error || 'Failed to create issue');
          }
        } catch (error) {
          console.error('Error creating issue:', error);
          toast.error('Failed to create issue');
        }
      } else {
        console.log('Updating existing email summary...');
        // For completed emails, update the summary (only if we have an ID)
        if (selectedEmail?.id || selectedEmail?.emailId) {
          const emailId = selectedEmail?.emailId || selectedEmail?.id;
          updateEmail(emailId.toString(), { 
          aiSummary: editableSummary
        });
        }
        toast.success('Issue updated successfully!');
      }
      
      setEditableIssue('');
      setEditableSummary('');
    } else {
      console.log('Missing required fields - editableIssue or editableSummary is empty');
      toast.error('Please fill in both issue title and summary');
    }
  };

  const handleLinkToExistingIssue = () => {
    if (selectedIssueToLink && selectedEmail && (selectedEmail?.id || selectedEmail?.emailId)) {
      const emailId = selectedEmail?.emailId || selectedEmail?.id;
      linkEmailToIssue(emailId.toString(), selectedIssueToLink);
      toast.success(`Email linked to issue ${selectedIssueToLink}`);
      setIsLinkingEmail(false);
      setSelectedIssueToLink('');
    }
  };

  console.log('selectedEmail ',selectedEmail)

  const handleAddNewIssue = () => {
    console.log('handleAddNewIssue called');
    console.log('Current newIssues before adding:', newIssues);
    const updatedIssues = [...newIssues, { title: '', summary: '' }];
    console.log('New issues array after adding:', updatedIssues);
    setNewIssues(updatedIssues);
  };

  const handleNewIssueChange = (index: number, field: 'title' | 'summary', value: string) => {
    console.log(`handleNewIssueChange called - index: ${index}, field: ${field}, value: "${value}"`);
    console.log('Current newIssues before change:', newIssues);
    const updated = [...newIssues];
    updated[index][field] = value;
    console.log('Updated newIssues after change:', updated);
    setNewIssues(updated);
  };

  const handleLogIssues = async () => {
    console.log('handleLogIssues called');
    console.log('newIssues array length:', newIssues.length);
    console.log('newIssues:', newIssues);
    console.log('Main issue fields - editableIssue:', editableIssue, 'editableSummary:', editableSummary);
    console.log('selectedEmail:', selectedEmail);
    console.log('building:', building);
    
    // Include the main issue fields in the list of issues to create
    const allIssues = [
      // Main issue (always present)
      { title: editableIssue, summary: editableSummary },
      // Additional issues
      ...newIssues
    ];
    
    console.log('All issues (main + additional):', allIssues);
    
    const validIssues = allIssues.filter(issue => issue.title.trim() && issue.summary.trim());
    console.log('validIssues length:', validIssues.length);
    console.log('validIssues:', validIssues);
    
    // Debug each issue individually
    allIssues.forEach((issue, index) => {
      console.log(`Issue ${index}:`, {
        title: issue.title,
        summary: issue.summary,
        titleTrimmed: issue.title.trim(),
        summaryTrimmed: issue.summary.trim(),
        isValid: issue.title.trim() && issue.summary.trim()
      });
    });
    
    if (validIssues.length > 0) {
      try {
        console.log('Creating multiple issues via API...');
        // Create issues via API calls
        console.log(`About to create ${validIssues.length} issues`);
        const createPromises = validIssues.map((issue, index) => {
          const issueData = {
            buildingId: building?.buildingId || 0,
            issueName: issue.title,
            issueDesc: issue.summary,
            issueCategory: 'General',
            issuePriority: selectedEmail?.priority === 'High' ? 'High' : 'Medium',
            emailId: selectedEmail?.emailId || selectedEmail?.id || undefined
          };
          console.log(`Creating issue ${index + 1}/${validIssues.length} with data:`, issueData);
          console.log('Email ID being sent:', selectedEmail?.emailId || selectedEmail?.id || 'undefined');
          return createIssue(issueData);
        });
        
        const results = await Promise.all(createPromises);
        console.log('Multiple issues creation results:', results);
        const successCount = results.filter(result => result.success).length;
        
        if (successCount === validIssues.length) {
          toast.success(`${successCount} issue(s) logged successfully!`);
        } else {
          toast.error(`${validIssues.length - successCount} issue(s) failed to create`);
        }
        
        // Clear both main issue fields and additional issues
        setEditableIssue('');
        setEditableSummary('');
      setNewIssues([{ title: '', summary: '' }]);
      } catch (error) {
        console.error('Error creating multiple issues:', error);
        toast.error('Failed to create issues');
      }
    } else {
      console.log('No valid issues to create');
      console.log('Main issue - title:', editableIssue, 'summary:', editableSummary);
      console.log('Additional issues:', newIssues);
      toast.error('Please fill in at least one issue title and summary (main issue or additional issues)');
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
        {apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length > 0 && showBanner && (
          <div className="mt-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 p-4 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-orange-500 p-2 rounded-full mr-3">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-orange-900 font-bold text-lg">
                    {apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length} Email{apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length > 1 ? 's' : ''} Need{apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length === 1 ? 's' : ''} Immediate Review
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
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="all">Emails</TabsTrigger>
                  <TabsTrigger value="review">
                    Need Review
                    {apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length > 0 && (
                      <Badge variant="outline" className="ml-1 bg-orange-50 text-orange-700">
                        {apiEmails.filter(e => e.issueCreationStatus === "IN_REVIEW").length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* EmailId Filter Indicator */}
              {searchParams.get('emailId') && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-blue-600 mr-2" />
                      <span className="text-sm text-blue-800">
                        Filtered by Email ID: <code className="bg-blue-100 px-1 rounded text-xs">{searchParams.get('emailId')}</code>
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        console.log('X button clicked, loading all emails...');
                        console.log('Current searchParams before removal:', searchParams.toString());
                        
                        // Remove emailId from URL using setSearchParams
                        const newSearchParams = new URLSearchParams(searchParams);
                        newSearchParams.delete('emailId');
                        console.log('New searchParams after removal:', newSearchParams.toString());
                        setSearchParams(newSearchParams);
                        
                        // Clear selected email first
                        setSelectedEmail(null);
                        setIsFilteredByEmailId(false);
                        
                        // Load all emails
                        await loadAllEmails();
                        console.log('X button click completed');
                      }}
                      className="h-6 w-6 p-0 hover:bg-blue-200"
                    >
                      <X className="h-3 w-3 text-blue-600" />
                    </Button>
                  </div>
                </div>
              )}
              
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
            <CardContent className="p-0 flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                {isLoadingEmails ? (
                  <div className="p-4 text-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Loading emails...</p>
                  </div>
                ) : (
                  filteredEmails.map((email, index) => {
                    console.log(`Rendering email ${index}:`, { id: email.id, messageId: email.messageId, subject: email.subject, status: email.issueCreationStatus });
                    return (
                    <div
                      key={`${email.messageId}-${email.issueCreationStatus}-${index}`}
                    onClick={() => setSelectedEmail(email)}
                    className={`p-4 cursor-pointer border-b border-border hover:bg-muted/50 transition-colors ${
                        selectedEmail?.messageId === email.messageId ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                          {email.issueCreationStatus === "IN_REVIEW" ? (
                          <Mail className="h-4 w-4 text-primary flex-shrink-0" />
                        ) : (
                          <MailOpen className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                          <span className={`text-sm truncate ${email.issueCreationStatus === "IN_REVIEW" ? 'font-semibold' : 'text-foreground'}`}>
                            {email.fromEmail}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                              copyEmailId(email.messageId);
                          }}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                          {email.issueCreationStatus === "IN_REVIEW" && <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>}
                          {email.issueCreationStatus === "IN_REVIEW" && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 text-xs flex-shrink-0">
                            Review
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                          <span className="text-xs text-muted-foreground">{email.messageId.substring(0, 8)}...</span>
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-xs text-muted-foreground break-all">ID: {email.messageId}</span>
                    </div>
                      <h4 className={`text-sm mb-1 line-clamp-2 ${email.issueCreationStatus === "IN_REVIEW" ? 'font-semibold' : 'text-foreground'}`}>
                      {email.subject}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 break-words">
                        {email.bodyText.substring(0, 100)}...
                    </p>
                  </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Panel - Email Body */}
        <div className="w-1/3">
          <Card className="h-full flex flex-col">
            {selectedEmail ? (
              <>
                <CardHeader className="pb-3 flex-shrink-0">
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
                <Separator className="flex-shrink-0" />
                <CardContent className="pt-4 flex-1 overflow-hidden">
                  <div className="h-full overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {selectedEmail.bodyText.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-3 text-foreground leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                    </div>
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
          <Card className="h-full flex flex-col">
            {selectedEmail ? (
              <>
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-lg">AI Summary & Issues Logged</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-6">
                   {/* Status & Priority */}
                   <div>
                     <div className="flex items-center justify-between mb-2">
                       <h4 className="font-medium text-foreground">Status</h4>
                         <Badge className={selectedEmail.issueCreationStatus === "IN_REVIEW" ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}>
                           {selectedEmail.issueCreationStatus === "IN_REVIEW" ? 'Needs Review' : 'Issue Created'}
                         </Badge>
                       </div>
                       <Badge className={getPriorityColor(selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issuePriority : 'Medium')}>
                         {selectedEmail.associatedIssues.length > 0 ? selectedEmail.associatedIssues[0].issuePriority : 'Medium'} Priority
                     </Badge>
                   </div>

                   <Separator />

                   {selectedEmail.issueCreationStatus === "IN_REVIEW" ? (
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
                         {/* <div>
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
                         </div> */}

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