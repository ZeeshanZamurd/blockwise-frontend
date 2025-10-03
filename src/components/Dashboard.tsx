import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Calendar, FileText, CheckCircle, Clock, Users, PoundSterling, Shield, Activity, Eye, ArrowRight, TriangleAlert, Mail, MessageSquare, User, Phone, Mail as MailIcon, Clock as ClockIcon, Repeat } from 'lucide-react';
import EnhancedIssueDetailsModal from './EnhancedIssueDetailsModal';
import EmailProcessing from './EmailProcessing';
import ExpiryBanner from './ExpiryBanner';

import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  emptyDataMode?: boolean;
  userData?: any;
}

const Dashboard = ({ emptyDataMode = false, userData }: DashboardProps) => {
  const navigate = useNavigate();
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Top-level KPIs - updated to include Require Review
  const kpis = [
    { 
      title: 'Recent Activity', 
      value: emptyDataMode ? '0' : '47', 
      icon: Activity, 
      color: 'text-blue-600', 
      bgColor: 'bg-blue-50', 
      description: emptyDataMode ? 'Ready to process emails' : 'Emails processed and issues generated',
      onClick: () => navigate('/recent-activity')
    },
    { 
      title: 'Open Issues', 
      value: emptyDataMode ? '0' : '12', 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      description: emptyDataMode ? 'Waiting for data...' : 'Requiring attention/action',
      onClick: () => navigate('/dashboard?section=building-management&tab=tasks&status=live')
    },
    { 
      title: 'Overdue', 
      value: emptyDataMode ? '0' : '5', 
      icon: Clock, 
      color: 'text-red-600', 
      bgColor: 'bg-red-50', 
      description: emptyDataMode ? 'No overdue tasks' : 'Tasks and maintenance past due date',
      onClick: () => navigate('/dashboard?section=building-management&tab=tasks&overdue=true')
    },
    { 
      title: 'Require Review', 
      value: emptyDataMode ? '0' : '3', 
      icon: Mail, 
      color: 'text-orange-600', 
      bgColor: 'bg-orange-50', 
      description: emptyDataMode ? 'No pending reviews' : 'Emails needing manual review',
      onClick: () => navigate('/dashboard?section=building-management&tab=emails&filter=review')
    },
  ];

  // Get "last visit" timestamp for new issues grouping
  const [lastVisit] = useState(() => {
    const stored = localStorage.getItem('issues_last_visit');
    return stored ? new Date(stored) : new Date(Date.now() - 24 * 60 * 60 * 1000); // Default to 24 hours ago
  });

  // Enhanced Live Issues data with required fields for modal - limited to 3 for dashboard
  const liveIssues = [];

  // Emails requiring review
  const emailsRequiringReview = [
    {
      id: 1,
      subject: 'Urgent: Broken window in Flat 4B',
      from: 'resident.4b@alto.com',
      date: '2024-06-27 09:30',
      needsReview: true
    },
    {
      id: 2,
      subject: 'Noise complaint - Flat 2A',
      from: 'resident.1b@alto.com',
      date: '2024-06-27 11:15',
      needsReview: true
    },
    {
      id: 3,
      subject: 'Water damage in basement',
      from: 'contractor@repairs.com',
      date: '2024-06-26 14:20',
      needsReview: true
    }
  ];

  // Weekly diary appointments with detailed information
  const weeklyAppointments = [
    { 
      id: 1, 
      day: 'Monday', 
      time: '09:00', 
      title: 'Cleaner - Common Areas', 
      type: 'Cleaning', 
      duration: '2 hours',
      contractor: 'SparkleClean Services',
      contactPerson: 'Sarah Mitchell',
      contactPhone: '020 7456 7890',
      contactEmail: 'sarah@sparkleclean.co.uk',
      frequency: 'Daily (Mon-Fri)',
      totalTime: '10 hours per week',
      notes: 'Entrance lobby, mailroom, and communal corridors'
    },
    { 
      id: 2, 
      day: 'Tuesday', 
      time: '14:00', 
      title: 'Car Park Gate Repair', 
      type: 'Maintenance', 
      duration: '3 hours',
      contractor: 'AutoGate Solutions',
      contactPerson: 'Mark Thompson',
      contactPhone: '020 8123 4567',
      contactEmail: 'mark@autogate.co.uk',
      frequency: 'One-off repair',
      totalTime: '3 hours',
      notes: 'Fixing sensor malfunction and motor alignment'
    },
    { 
      id: 3, 
      day: 'Wednesday', 
      time: '10:00', 
      title: 'Boiler Maintenance', 
      type: 'Maintenance', 
      duration: '4 hours',
      contractor: 'Heating Experts Ltd',
      contactPerson: 'James Wilson',
      contactPhone: '020 9876 5432',
      contactEmail: 'james@heatingexperts.co.uk',
      frequency: 'Quarterly',
      totalTime: '4 hours per quarter',
      notes: 'Annual service and safety inspection'
    },
    { 
      id: 4, 
      day: 'Wednesday', 
      time: '15:00', 
      title: 'Cleaner - Stairwells', 
      type: 'Cleaning', 
      duration: '1.5 hours',
      contractor: 'SparkleClean Services',
      contactPerson: 'Sarah Mitchell',
      contactPhone: '020 7456 7890',
      contactEmail: 'sarah@sparkleclean.co.uk',
      frequency: 'Twice weekly (Wed, Sat)',
      totalTime: '3 hours per week',
      notes: 'All stairwells and landing areas'
    },
    { 
      id: 5, 
      day: 'Thursday', 
      time: '11:00', 
      title: 'MA Monthly Report Check', 
      type: 'Administration', 
      duration: '1 hour',
      contractor: 'Building Management Office',
      contactPerson: 'Emma Roberts',
      contactPhone: '020 5555 0123',
      contactEmail: 'emma@buildingmanagement.co.uk',
      frequency: 'Monthly',
      totalTime: '1 hour per month',
      notes: 'Review of monthly reports and outstanding issues'
    },
    { 
      id: 6, 
      day: 'Friday', 
      time: '08:30', 
      title: 'Gardener - Grounds Maintenance', 
      type: 'Gardening', 
      duration: '3 hours',
      contractor: 'Green Spaces Ltd',
      contactPerson: 'David Green',
      contactPhone: '020 3333 7777',
      contactEmail: 'david@greenspaces.co.uk',
      frequency: 'Weekly',
      totalTime: '3 hours per week',
      notes: 'Lawn care, hedge trimming, and flower bed maintenance'
    },
    { 
      id: 7, 
      day: 'Friday', 
      time: '13:00', 
      title: 'Solar Panel Maintenance', 
      type: 'Maintenance', 
      duration: '2 hours',
      contractor: 'Solar Solutions UK',
      contactPerson: 'Michael Chen',
      contactPhone: '020 2222 8888',
      contactEmail: 'michael@solarsolutions.co.uk',
      frequency: 'Bi-annually',
      totalTime: '4 hours per year',
      notes: 'Cleaning and performance check of rooftop panels'
    },
    { 
      id: 8, 
      day: 'Saturday', 
      time: '09:00', 
      title: 'First Floor Decoration', 
      type: 'Decoration', 
      duration: '6 hours',
      contractor: 'Premier Decorators',
      contactPerson: 'Lisa Taylor',
      contactPhone: '020 1111 4444',
      contactEmail: 'lisa@premierdecorators.co.uk',
      frequency: 'Project work (3 weeks)',
      totalTime: '18 hours per week',
      notes: 'Corridor and communal area painting project'
    },
  ];

  // Financial Overview data
  const financialItems = [
    { id: 1, type: 'invoice', title: 'Elevator Service Ltd - Annual Maintenance', amount: '£2,400', status: 'Pending', date: '2024-06-20', category: 'Maintenance' },
    { id: 2, type: 'quote', title: 'Roof Repair Specialists - Emergency Repairs', amount: '£1,800', status: 'Review', date: '2024-06-25', category: 'Repairs' },
    { id: 3, type: 'invoice', title: 'Fire Safety Systems - Quarterly Check', amount: '£450', status: 'Pending', date: '2024-06-22', category: 'Safety' },
  ];

  // Compliance & Certificates data
  const complianceItems = [
    { id: 1, title: 'Fire Safety Certificate', type: 'Certificate', status: 'Expiring', daysUntil: 45, date: '2024-08-15', priority: 'High' },
    { id: 2, title: 'Elevator Annual Inspection', type: 'Inspection', status: 'Overdue', daysUntil: -5, date: '2024-06-20', priority: 'Critical' },
    { id: 3, title: 'Insurance Policy Renewal', type: 'Policy', status: 'Due Soon', daysUntil: 30, date: '2024-07-25', priority: 'Medium' },
  ];

  const getFilteredIssues = () => {
    const issueData = emptyDataMode ? [] : [];
    let filtered;
    switch (selectedTab) {
      case 'high':
        filtered = issueData.filter(issue => issue.isHighPriority);
        break;
      case 'week':
        filtered = issueData.filter(issue => issue.isThisWeek);
        break;
      default:
        filtered = issueData;
        break;
    }
    
    // Sort: new since last visit at top
    const newSinceVisit = filtered.filter(issue => new Date(issue.date) > lastVisit);
    const regular = filtered.filter(issue => new Date(issue.date) <= lastVisit);
    
    // Limit to 3 issues on dashboard
    return [...newSinceVisit, ...regular].slice(0, 3);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
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
      case 'new': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'expiring': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAppointmentTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cleaning': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-orange-100 text-orange-800';
      case 'administration': return 'bg-purple-100 text-purple-800';
      case 'gardening': return 'bg-green-100 text-green-800';
      case 'decoration': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleIssueClick = (issue) => {
    console.log('Issue clicked:', issue);
    setSelectedIssue(issue);
  };

  const handleReviewEmailsClick = () => {
    navigate('/dashboard?section=communications&filter=review');
  };

  // Get expiring documents (within 3 months)
  const getExpiringDocuments = () => {
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(today.getMonth() + 3);
    
    // Sample documents with expiry dates
    const documents = [
      { id: '1', title: 'Gas Safety Certificate', expiryDate: '2025-02-15', type: 'certificate' as const },
      { id: '2', title: 'Fire Safety Certificate', expiryDate: '2025-03-20', type: 'certificate' as const },
      { id: '3', title: 'Building Insurance Policy', expiryDate: '2025-01-28', type: 'insurance' as const }
    ];
    
    return documents
      .map(doc => {
        const expiryDate = new Date(doc.expiryDate);
        const diffTime = expiryDate.getTime() - today.getTime();
        const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return { ...doc, daysUntilExpiry };
      })
      .filter(doc => doc.daysUntilExpiry <= 90 && doc.daysUntilExpiry > 0);
  };

  if (emptyDataMode) {
    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Building Overview</h2>
          <p className="text-gray-600">Centralised hub for issues, communications and scheduling</p>
        </div>

        {/* Unique Email Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📧 Your Building Email</h3>
          <p className="text-sm text-blue-800 mb-2">Forward emails to this address to start processing them:</p>
          <div className="font-mono text-sm bg-white p-2 rounded border text-blue-900">
            {userData?.uniqueEmail || 'your-building@blocwise.email'}
          </div>
        </div>

        {/* Empty State KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Open Issues</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Waiting for data...</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Emails Processed</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Ready to process emails</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">No scheduled events</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">No documents uploaded</p>
          </div>
        </div>

        {/* Empty State Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No activity yet</p>
              <p className="text-xs text-gray-400 mt-1">Activity will appear here once you start processing emails</p>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">This Week</h3>
            </div>
            <div className="p-6 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No events scheduled</p>
              <p className="text-xs text-gray-400 mt-1">Calendar events will appear here</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Expiry Banner for documents expiring within 3 months */}
      <ExpiryBanner expiringItems={getExpiringDocuments()} />

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Building Overview</h2>
        <p className="text-gray-600">Centralised hub for issues, communications and scheduling</p>
      </div>

      {/* Top-Level KPIs - now with 4 modules */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={kpi.onClick}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                     <div className="flex items-center space-x-2">
                       <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                     </div>
                    <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                    <p className="text-xs text-gray-500">{kpi.description}</p>
                  </div>
                  <div className={`${kpi.bgColor} p-3 rounded-full`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>


      {/* Main Content Grid - improved mobile layout */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {/* 1. Live Issues with Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Building Issues</span>
              </div>
              <Button variant="outline" size="sm" className="self-start sm:self-auto" onClick={() => navigate('/dashboard?section=building-management&tab=tasks')}>
                View All <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600">Track and manage building issues</p>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="high">High Priority</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedTab} className="mt-4">
                <div className="space-y-4">
                  {getFilteredIssues().length === 0 ? (
                    <div className="text-center py-8">
                      <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm mb-3">{emptyDataMode ? 'No issues logged yet' : 'No issues for this filter'}</p>
                      {emptyDataMode && <p className="text-xs text-gray-400">Issues will be created automatically from emails or manually added</p>}
                      {emptyDataMode && (
                        <Button className="bg-blue-600 hover:bg-blue-700 mt-4">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Create Issue
                        </Button>
                      )}
                    </div>
                  ) : (
                    getFilteredIssues().map((issue) => {
                    const isNewSinceVisit = new Date(issue.date) > lastVisit;
                    return (
                        <div 
                        key={issue.id} 
                        className={`flex items-start space-x-4 p-4 rounded-lg cursor-pointer transition-all duration-200 relative ${
                          isNewSinceVisit ? 'bg-blue-50 border-2 border-blue-200 shadow-sm' : 'bg-gray-50'
                        }`}
                        onClick={() => handleIssueClick(issue)}
                      >
                       {isNewSinceVisit && (
                         <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
                       )}
                       <div className="flex-shrink-0">
                         <AlertTriangle className="h-4 w-4 text-blue-500" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-base font-semibold text-gray-900 truncate">
                              {issue.title}
                            </h3>
                             <div className="flex items-center space-x-2">
                               {/* Message bubble */}
                               <div className="relative">
                                 <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                 <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full"></div>
                               </div>
                                <Badge className={`${getStatusColor(issue.status)} text-base px-3 py-1`}>
                                  {issue.status}
                                </Badge>
                                <Badge className={`${getPriorityColor(issue.priority)} text-base px-3 py-1`}>
                                  {issue.priority}
                                </Badge>
                            </div>
                          </div>
                         <p className="text-sm text-gray-600 mb-2">{issue.summary}</p>
                         <Badge variant="outline" className="text-xs">
                           {issue.category}
                         </Badge>
                       </div>
                     </div>
                    );
                   })
                  )}
                 </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 2. Diary - Weekly View - mobile optimized */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>This Week's Diary</span>
              </div>
              <Button variant="outline" size="sm" className="self-start sm:self-auto" onClick={() => navigate('/dashboard?section=building-management&tab=calendar')}>
                View Calendar <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600">Scheduled appointments and maintenance for the building</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                const dayAppointments = (emptyDataMode ? [] : weeklyAppointments).filter(apt => apt.day === day);
                return (
                  <div key={day} className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 text-sm">{day}</h4>
                    <div className="space-y-2">
                      {dayAppointments.length > 0 ? (
                        dayAppointments.map((apt) => (
                          <div 
                            key={apt.id} 
                            className="bg-white rounded p-2 text-xs cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => setSelectedAppointment(apt)}
                          >
                            <div className="font-medium text-gray-900">{apt.time}</div>
                            <div className="text-gray-700 mb-1">{apt.title}</div>
                            <div className="flex flex-col space-y-1">
                              <Badge className={getAppointmentTypeColor(apt.type)} variant="outline">
                                {apt.type}
                              </Badge>
                              <span className="text-gray-500">{apt.duration}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-500 text-center py-2">{emptyDataMode ? 'Ready to schedule' : 'No appointments'}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Enhanced Issue Details Modal */}
      {selectedIssue && (
        <EnhancedIssueDetailsModal 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
        />
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <Dialog open={true} onOpenChange={() => setSelectedAppointment(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span>Appointment Details</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">{selectedAppointment.title}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{selectedAppointment.day} at {selectedAppointment.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ClockIcon className="h-4 w-4 text-gray-500" />
                      <span>{selectedAppointment.duration}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Repeat className="h-4 w-4 text-gray-500" />
                      <span>{selectedAppointment.frequency}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <Badge className={getAppointmentTypeColor(selectedAppointment.type)} variant="outline">
                    {selectedAppointment.type}
                  </Badge>
                </div>
              </div>

              {/* Contractor Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Contractor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">{selectedAppointment.contractor}</p>
                    <p className="text-sm text-gray-600">Contact: {selectedAppointment.contactPerson}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{selectedAppointment.contactPhone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MailIcon className="h-4 w-4 text-gray-500" />
                      <span>{selectedAppointment.contactEmail}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Schedule</h4>
                  <p className="text-sm text-gray-600">Frequency: {selectedAppointment.frequency}</p>
                  <p className="text-sm text-gray-600">Total time: {selectedAppointment.totalTime}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600">{selectedAppointment.notes}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Dashboard;
