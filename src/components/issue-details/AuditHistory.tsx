
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Mail, Calendar, Clock, MessageSquare } from 'lucide-react';

interface AuditHistoryProps {
  auditHistory?: AuditEntry[];
}

interface AuditEntry {
  id: number;
  actionName?: string;
  actionDescription?: string;
  createdDate?: string;
  performedBy?: string;
  // Default format fields
  type?: string;
  date?: string;
  user?: string;
  description?: string;
  details?: string;
}

const AuditHistory: React.FC<AuditHistoryProps> = ({ auditHistory = [] }) => {
  const [showAll, setShowAll] = useState(false);
  const defaultAuditHistory = [
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

  // Use API audit history if available, otherwise fallback to default
  const history = auditHistory.length > 0 ? auditHistory : defaultAuditHistory;
  
  // Show only first 3 items unless showAll is true
  const displayedHistory = showAll ? history : history.slice(0, 3);
  const hasMoreItems = history.length > 3;

  const getAuditIcon = (entry: AuditEntry) => {
    // Handle API format
    if (entry.actionName) {
      const actionName = entry.actionName.toLowerCase();
      if (actionName.includes('created')) return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      if (actionName.includes('status') || actionName.includes('change')) return <Clock className="h-4 w-4 text-yellow-500" />;
      if (actionName.includes('comment')) return <MessageSquare className="h-4 w-4 text-green-500" />;
      if (actionName.includes('update')) return <Mail className="h-4 w-4 text-purple-500" />;
      return <Calendar className="h-4 w-4 text-gray-500" />;
    }
    
    // Handle default format
    switch (entry.type) {
      case 'created': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'status_change': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-green-500" />;
      case 'update': return <Mail className="h-4 w-4 text-purple-500" />;
      default: return <Calendar className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Audit History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedHistory.map((entry) => {
            // Handle API format vs default format
            const isApiFormat = entry.actionName;
            const displayData = isApiFormat ? {
              id: entry.id,
              description: entry.actionName,
              details: entry.actionDescription,
              date: entry.createdDate,
              user: entry.performedBy
            } : {
              id: entry.id,
              description: entry.description,
              details: entry.details,
              date: entry.date,
              user: entry.user
            };

            return (
              <div key={displayData.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="mt-1">
                  {getAuditIcon(entry)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">{displayData.description}</h4>
                    <span className="text-xs text-gray-500">
                      {displayData.date ? new Date(displayData.date).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{displayData.details}</p>
                  <p className="text-xs text-gray-500">By: {displayData.user}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Show All Button */}
        {hasMoreItems && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAll(!showAll)}
              className="w-full"
            >
              {showAll ? 'Show Less' : `Show All (${history.length})`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditHistory;
