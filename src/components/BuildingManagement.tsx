import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GanttChart, Mail, Calendar, Users, ClipboardList } from 'lucide-react';
import EnhancedIssueLog from './EnhancedIssueLog';
import EnhancedCommunicationsPanel from './EnhancedCommunicationsPanel';
import CalendarSection from './CalendarSection';
import SuppliersSection from './SuppliersSection';


interface BuildingManagementProps {
  emptyDataMode?: boolean;
  userData?: any;
}

const BuildingManagement = ({ emptyDataMode = false, userData }: BuildingManagementProps) => {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('tasks');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['tasks', 'emails', 'calendar', 'suppliers'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  
  // Mock data for demonstration - would come from actual state/API
  const hasEmailsNeedingReview = true;
  const hasCalendarEvents = true;

  if (emptyDataMode) {
    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Building Management</h2>
          <p className="text-gray-600">Centralized hub for tasks, communications, and scheduling</p>
        </div>

        {/* Unique Email Display */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📧 Your Building Email</h3>
          <p className="text-sm text-blue-800 mb-2">Forward emails to this address to start processing them:</p>
          <div className="font-mono text-sm bg-white p-2 rounded border text-blue-900">
            {userData?.uniqueEmail || 'your-building@blocwise.email'}
          </div>
        </div>

        {/* Tabs with functional content */}
        <Tabs defaultValue="issues" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="communications">Communications</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="issues" className="mt-6">
            <EnhancedIssueLog emptyDataMode={true} />
          </TabsContent>
          
          <TabsContent value="communications" className="mt-6">
            <EnhancedCommunicationsPanel emptyDataMode={true} />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-6">
            <CalendarSection emptyDataMode={true} />
          </TabsContent>
          
          <TabsContent value="suppliers" className="mt-6">
            <SuppliersSection emptyDataMode={true} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Building Management</h2>
        <p className="text-gray-600">Centralised hub for issues, communications and scheduling</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <GanttChart className="h-4 w-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="emails" className="flex items-center gap-2 relative">
            <Mail className="h-4 w-4" />
            Emails
            {hasEmailsNeedingReview && (
              <div className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2 relative">
            <Calendar className="h-4 w-4" />
            Calendar
            {hasCalendarEvents && (
              <div className="ml-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </TabsTrigger>
          <TabsTrigger value="suppliers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suppliers
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks" className="mt-6">
          <EnhancedIssueLog emptyDataMode={emptyDataMode} />
        </TabsContent>
        
        <TabsContent value="emails" className="mt-6">
          <EnhancedCommunicationsPanel emptyDataMode={emptyDataMode} />
        </TabsContent>
        
        <TabsContent value="calendar" className="mt-6">
          <CalendarSection emptyDataMode={emptyDataMode} />
        </TabsContent>
        
        <TabsContent value="suppliers" className="mt-6">
          <SuppliersSection emptyDataMode={emptyDataMode} />
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default BuildingManagement;