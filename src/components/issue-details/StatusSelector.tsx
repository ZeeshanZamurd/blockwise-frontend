import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, AlertTriangle, XCircle, Pause, Eye } from 'lucide-react';

interface StatusSelectorProps {
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
}

const StatusSelector: React.FC<StatusSelectorProps> = ({ currentStatus, onStatusChange }) => {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not started': return <Clock className="h-4 w-4 text-gray-500" />;
      case 'in review': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'in progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'closed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-orange-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not started': return 'bg-gray-100 text-gray-800';
      case 'in review': return 'bg-yellow-100 text-yellow-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm font-medium text-gray-700">Status:</span>
      <Select value={currentStatus} onValueChange={onStatusChange}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Not started">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>Not started</span>
            </div>
          </SelectItem>
          <SelectItem value="In review">
            <div className="flex items-center space-x-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              <span>In review</span>
            </div>
          </SelectItem>
          <SelectItem value="In progress">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>In progress</span>
            </div>
          </SelectItem>
          <SelectItem value="Closed">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Closed</span>
            </div>
          </SelectItem>
          <SelectItem value="Paused">
            <div className="flex items-center space-x-2">
              <Pause className="h-4 w-4 text-orange-500" />
              <span>Paused</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StatusSelector;