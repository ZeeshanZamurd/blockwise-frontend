import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, UserPlus, UserMinus, Calendar, User } from 'lucide-react';

interface AuditEntry {
  id: string;
  type: 'Director Joined' | 'Director Left' | 'Position Change' | 'Meeting' | 'Resolution';
  date: string;
  description: string;
  directorName?: string;
  previousPosition?: string;
  newPosition?: string;
  details?: string;
}

const mockAuditEntries: AuditEntry[] = [
  {
    id: '1',
    type: 'Director Joined',
    date: '2024-01-15',
    description: 'Emily Davis appointed as Secretary',
    directorName: 'Emily Davis',
    newPosition: 'Secretary',
    details: 'Unanimous vote by board members'
  },
  {
    id: '2',
    type: 'Position Change',
    date: '2023-11-20',
    description: 'Sarah Johnson promoted to Vice Chairman',
    directorName: 'Sarah Johnson',
    previousPosition: 'Board Member',
    newPosition: 'Vice Chairman',
    details: 'Following retirement of previous Vice Chairman'
  },
  {
    id: '3',
    type: 'Director Left',
    date: '2023-11-15',
    description: 'Robert Wilson stepped down as Vice Chairman',
    directorName: 'Robert Wilson',
    previousPosition: 'Vice Chairman',
    details: 'Personal reasons - moved abroad'
  },
  {
    id: '4',
    type: 'Meeting',
    date: '2023-10-10',
    description: 'Annual General Meeting - Board elections held',
    details: 'All current positions confirmed for another term'
  },
  {
    id: '5',
    type: 'Director Joined',
    date: '2023-06-01',
    description: 'Michael Brown appointed as Treasurer',
    directorName: 'Michael Brown',
    newPosition: 'Treasurer',
    details: 'Replacing interim treasurer arrangement'
  }
];

interface GovernanceAuditProps {
  emptyDataMode?: boolean;
}

const GovernanceAudit = ({ emptyDataMode }: GovernanceAuditProps) => {
  const [auditEntries] = useState<AuditEntry[]>(mockAuditEntries);

  if (emptyDataMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <ClipboardList className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Governance Audit</h2>
          <p className="text-muted-foreground mb-6">
            Track all governance changes and director movements
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">What you'll see here:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Director appointments and departures</li>
              <li>• Position changes and promotions</li>
              <li>• Board meeting records</li>
              <li>• Governance decision timeline</li>
              <li>• Compliance audit trail</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const getAuditIcon = (type: string) => {
    switch (type) {
      case 'Director Joined':
        return <UserPlus className="h-4 w-4 text-green-600" />;
      case 'Director Left':
        return <UserMinus className="h-4 w-4 text-red-600" />;
      case 'Position Change':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'Meeting':
        return <Calendar className="h-4 w-4 text-purple-600" />;
      case 'Resolution':
        return <ClipboardList className="h-4 w-4 text-orange-600" />;
      default:
        return <ClipboardList className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAuditBadge = (type: string) => {
    switch (type) {
      case 'Director Joined':
        return <Badge className="bg-green-100 text-green-700">Joined</Badge>;
      case 'Director Left':
        return <Badge className="bg-red-100 text-red-700">Left</Badge>;
      case 'Position Change':
        return <Badge className="bg-blue-100 text-blue-700">Change</Badge>;
      case 'Meeting':
        return <Badge className="bg-purple-100 text-purple-700">Meeting</Badge>;
      case 'Resolution':
        return <Badge className="bg-orange-100 text-orange-700">Resolution</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Governance Audit Trail</h1>
        <Button>Add Entry</Button>
      </div>

      <div className="space-y-4">
        {auditEntries.map((entry) => (
          <Card key={entry.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getAuditIcon(entry.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{entry.description}</h3>
                      {getAuditBadge(entry.type)}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      {new Date(entry.date).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  
                  {entry.directorName && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Director:</strong> {entry.directorName}
                      {entry.previousPosition && entry.newPosition && (
                        <span> • {entry.previousPosition} → {entry.newPosition}</span>
                      )}
                      {entry.newPosition && !entry.previousPosition && (
                        <span> • Position: {entry.newPosition}</span>
                      )}
                      {entry.previousPosition && !entry.newPosition && (
                        <span> • Former: {entry.previousPosition}</span>
                      )}
                    </div>
                  )}
                  
                  {entry.details && (
                    <p className="text-sm text-gray-700 mt-2 bg-gray-50 p-3 rounded-lg">
                      {entry.details}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GovernanceAudit;