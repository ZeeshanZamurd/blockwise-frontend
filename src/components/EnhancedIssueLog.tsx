
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Search, Filter, Clock, CheckCircle, Plus, Calendar, User, MessageSquare, Flag } from 'lucide-react';
import EnhancedIssueDetailsModal from './EnhancedIssueDetailsModal';
import CreateIssueForm from './CreateIssueForm';
import { useSearchParams } from 'react-router-dom';
import { useIssues, Issue } from '@/contexts/IssuesContext';
import { useIssue } from '@/hooks/useIssue';
import { useBuilding } from '@/hooks/useBuilding';
import { EmptyEnhancedIssueLog } from './EmptyEnhancedIssueLog';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedIssueLogProps {
  emptyDataMode?: boolean;
}

const EnhancedIssueLog = ({ emptyDataMode = false }: EnhancedIssueLogProps) => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('live'); // Default to 'live'
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterTimeframe, setFilterTimeframe] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewedIssues, setViewedIssues] = useState<Set<string>>(() => {
    const stored = localStorage.getItem('issues_viewed_ids');
    return stored ? new Set(JSON.parse(stored)) : new Set();
  });
  const { issues, updateIssue } = useIssues();
  const { fetchIssues } = useIssue();
  const { building } = useBuilding();

  // Get "last visit" timestamp for new issues grouping
  const [lastVisit] = useState(() => {
    const stored = localStorage.getItem('issues_last_visit');
    return stored ? new Date(stored) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
  });

  // Save last visit timestamp when component unmounts
  useEffect(() => {
    return () => {
      localStorage.setItem('issues_last_visit', new Date().toISOString());
    };
  }, []);

  // Fetch issues when building data is available
  useEffect(() => {
    if (building?.buildingId && issues.length === 0) {
      fetchIssues(building.buildingId);
    }
  }, [building?.buildingId, issues.length, fetchIssues]);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    const newViewedIssues = new Set(viewedIssues).add(issue.id);
    setViewedIssues(newViewedIssues);
    localStorage.setItem('issues_viewed_ids', JSON.stringify(Array.from(newViewedIssues)));
  };

  // Set initial filter based on URL params
  useEffect(() => {
    const statusParam = searchParams.get('status');
    const showOverdue = searchParams.get('overdue');
    
    if (statusParam) {
      setFilterStatus(statusParam);
    } else if (showOverdue === 'true') {
      setFilterStatus('overdue');
    }
  }, [searchParams]);
  // Using issues from context now

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not started': return 'bg-gray-100 text-gray-800';
      case 'in review': return 'bg-yellow-100 text-yellow-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      // Legacy support
      case 'live': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'repairs': return 'bg-orange-100 text-orange-800';
      case 'administration': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not started': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'in review': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'in progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Clock className="h-4 w-4 text-orange-500" />;
      // Legacy support
      case 'live': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Filter and sort issues based on search term, status, priority, and timeframe
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (filterStatus === 'live') {
      // Show all statuses except closed for 'live' filter
      matchesStatus = issue.status.toLowerCase() !== 'closed';
    } else if (filterStatus === 'overdue') {
      matchesStatus = false; // Simplified for now
    } else if (filterStatus !== 'all') {
      matchesStatus = issue.status.toLowerCase() === filterStatus;
    }
    
    const matchesPriority = filterPriority === 'all' || issue.priority.toLowerCase() === filterPriority;
    
    // Timeframe filtering
    let matchesTimeframe = true;
    if (filterTimeframe !== 'all') {
      const now = new Date();
      const effectiveDate = new Date(issue.lastUpdated || issue.dateCreated);
      const diffHours = (now.getTime() - effectiveDate.getTime()) / (1000 * 60 * 60);
      
      switch (filterTimeframe) {
        case '24h':
          matchesTimeframe = diffHours <= 24;
          break;
        case '7d':
          matchesTimeframe = diffHours <= 168; // 7 days in hours
          break;
        case '30d':
          matchesTimeframe = diffHours <= 720; // 30 days in hours
          break;
        default:
          matchesTimeframe = true;
      }
    }
    
    return matchesSearch && matchesStatus && matchesPriority && matchesTimeframe;
  }).sort((a, b) => {
    // Sort by most recent activity (lastUpdated or dateCreated)
    const aDate = new Date(a.lastUpdated || a.dateCreated);
    const bDate = new Date(b.lastUpdated || b.dateCreated);
    return bDate.getTime() - aDate.getTime();
  });

  // Group issues: new since last visit at top, then viewed new, then rest
  const groupedIssues = () => {
    const newSinceVisit = filteredIssues.filter(issue => {
      const issueDate = new Date(issue.dateCreated);
      const updateDate = issue.lastUpdated ? new Date(issue.lastUpdated) : null;
      const isNewSinceVisit = lastVisit && issueDate > lastVisit;
      const isUpdatedSinceVisit = lastVisit && updateDate && updateDate > lastVisit;
      return (isNewSinceVisit || isUpdatedSinceVisit) && !viewedIssues.has(issue.id);
    });
    
    const viewedNew = filteredIssues.filter(issue => {
      const issueDate = new Date(issue.dateCreated);
      const updateDate = issue.lastUpdated ? new Date(issue.lastUpdated) : null;
      const isNewSinceVisit = lastVisit && issueDate > lastVisit;
      const isUpdatedSinceVisit = lastVisit && updateDate && updateDate > lastVisit;
      return (isNewSinceVisit || isUpdatedSinceVisit) && viewedIssues.has(issue.id);
    });
    
    const regular = filteredIssues.filter(issue => {
      const issueDate = new Date(issue.dateCreated);
      const updateDate = issue.lastUpdated ? new Date(issue.lastUpdated) : null;
      const isNewSinceVisit = lastVisit && issueDate > lastVisit;
      const isUpdatedSinceVisit = lastVisit && updateDate && updateDate > lastVisit;
      return !isNewSinceVisit && !isUpdatedSinceVisit;
    });
    
    return { newSinceVisit, viewedNew, regular };
  };

  const { newSinceVisit, viewedNew, regular } = groupedIssues();

  const overdueCount = 0; // Simplified for now

  if (emptyDataMode) {
    return <EmptyEnhancedIssueLog />;
  }

  return (
    <div className="p-4 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Building Issues</h2>
          <p className="text-sm md:text-base text-gray-600">Track and manage building issues and tasks</p>
          {filterStatus === 'overdue' && (
            <div className="mt-2">
              <Badge className="bg-red-100 text-red-800">
                {overdueCount} Overdue Issues
              </Badge>
            </div>
          )}
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto" onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Issue
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full text-xs md:text-sm">
                  <Filter className="h-4 w-4 mr-1 md:mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="live">Live Issues</SelectItem>
                  <SelectItem value="overdue">Overdue ({overdueCount})</SelectItem>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="not started">Not started</SelectItem>
                  <SelectItem value="in review">In review</SelectItem>
                  <SelectItem value="in progress">In progress</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-full text-xs md:text-sm">
                  <Filter className="h-4 w-4 mr-1 md:mr-2" />
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem> 
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterTimeframe} onValueChange={setFilterTimeframe}>
                <SelectTrigger className="w-full text-xs md:text-sm col-span-2 md:col-span-1">
                  <Clock className="h-4 w-4 mr-1 md:mr-2" />
                  <SelectValue placeholder="Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues List */}
      <div className="space-y-4">
        {/* New since last visit section */}
        {newSinceVisit.length > 0 && (
          <>
            <div className="text-xs md:text-sm font-medium text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
              New since your last visit ({newSinceVisit.length})
            </div>
            {newSinceVisit.map((issue) => {
              const isNewSinceVisit = lastVisit && new Date(issue.dateCreated) > lastVisit;
              const isUpdatedSinceVisit = lastVisit && issue.lastUpdated && new Date(issue.lastUpdated) > lastVisit;
              const isHighlighted = (isNewSinceVisit || isUpdatedSinceVisit) && !viewedIssues.has(issue.id);
              
              return (
                <div 
                  key={issue.id} 
                  className={`flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-200 relative ${
                    isHighlighted ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' : 'bg-gray-50'
                  }`}
                  onClick={() => handleIssueClick(issue)}
                >
                  {isHighlighted && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                  <div className="flex-shrink-0 sm:mt-1">
                    {getStatusIcon(issue.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                       <div className="flex items-center space-x-2 min-w-0">
                         <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                           {issue.title}
                         </h3>
                         {isUpdatedSinceVisit && (
                           <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 flex-shrink-0">
                             Updated
                           </Badge>
                         )}
                         {isNewSinceVisit && !isUpdatedSinceVisit && (
                           <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 flex-shrink-0">
                             New
                           </Badge>
                         )}
                       </div>
                      <div className="flex items-center space-x-2 flex-wrap gap-1">
                         <Badge 
                           className={`${getStatusColor(issue.status)} text-xs md:text-sm px-2 md:px-3 py-1 cursor-pointer hover:opacity-80`}
                           onClick={(e) => {
                             e.stopPropagation();
                             if (issue.status !== 'Closed') {
                               updateIssue(issue.id, { status: 'Closed' as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused' });
                             }
                           }}
                         >
                           {issue.status}
                         </Badge>
                         <Badge className={`${getPriorityColor(issue.priority)} text-xs md:text-sm px-2 md:px-3 py-1`}>
                           <Flag className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                           {issue.priority}
                         </Badge>
                       </div>
                     </div>
                     <p className="text-xs md:text-sm text-gray-600 mb-2">{issue.summary}</p>
                     <Badge variant="outline" className="text-xs">
                      {issue.category}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </>
        )}
        
        {/* Viewed new issues and regular issues */}
        {[...viewedNew, ...regular].map((issue) => {
          const isNewSinceVisit = lastVisit && new Date(issue.dateCreated) > lastVisit;
          const isUpdatedSinceVisit = lastVisit && issue.lastUpdated && new Date(issue.lastUpdated) > lastVisit;
          const isHighlighted = (isNewSinceVisit || isUpdatedSinceVisit) && !viewedIssues.has(issue.id);
          
          return (
            <div 
              key={issue.id} 
              className={`flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-3 md:p-4 rounded-lg cursor-pointer transition-all duration-200 relative ${
                isHighlighted ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' : 'bg-gray-50'
              }`}
              onClick={() => handleIssueClick(issue)}
            >
              {isHighlighted && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
              <div className="flex-shrink-0 sm:mt-1">
                {getStatusIcon(issue.status)}
              </div>
              <div className="flex-1 min-w-0">
                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                   <div className="flex items-center space-x-2 min-w-0">
                     <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
                       {issue.title}
                     </h3>
                     {isUpdatedSinceVisit && (
                       <Badge className="bg-blue-600 text-white text-xs px-2 py-0.5 flex-shrink-0">
                         Updated
                       </Badge>
                     )}
                     {isNewSinceVisit && !isUpdatedSinceVisit && (
                       <Badge className="bg-green-600 text-white text-xs px-2 py-0.5 flex-shrink-0">
                         New
                       </Badge>
                     )}
                   </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-1">
                      <Badge 
                        className={`${getStatusColor(issue.status)} text-xs md:text-sm px-2 md:px-3 py-1 cursor-pointer hover:opacity-80`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (issue.status !== 'Closed') {
                            updateIssue(issue.id, { status: 'Closed' as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused' });
                          }
                        }}
                      >
                        {issue.status}
                      </Badge>
                      <Badge className={`${getPriorityColor(issue.priority)} text-xs md:text-sm px-2 md:px-3 py-1`}>
                        <Flag className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        {issue.priority}
                      </Badge>
                   </div>
                 </div>
                 <p className="text-xs md:text-sm text-gray-600 mb-2">{issue.summary}</p>
                 <Badge variant="outline" className="text-xs">
                  {issue.category}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {/* Issue Details Modal */}
      {selectedIssue && (
        <EnhancedIssueDetailsModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
        />
      )}

      {/* Create Issue Form */}
      <CreateIssueForm 
        open={showCreateForm} 
        onClose={() => setShowCreateForm(false)} 
      />
    </div>
  );
};

export default EnhancedIssueLog;
