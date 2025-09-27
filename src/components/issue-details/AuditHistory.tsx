
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Mail, Calendar, Clock, MessageSquare } from 'lucide-react';

interface AuditHistoryProps {
  auditHistory?: any[];
}

const AuditHistory: React.FC<AuditHistoryProps> = ({ auditHistory = [] }) => {
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

  const history = auditHistory.length > 0 ? auditHistory : defaultAuditHistory;

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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Audit History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {history.map((entry) => (
            <div key={entry.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="mt-1">
                {getAuditIcon(entry.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-gray-900 text-sm">{entry.description}</h4>
                  <span className="text-xs text-gray-500">{entry.date}</span>
                </div>
                <p className="text-xs text-gray-600 mb-1">{entry.details}</p>
                <p className="text-xs text-gray-500">By: {entry.user}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditHistory;
