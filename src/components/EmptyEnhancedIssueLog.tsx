import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { EmptyStateView } from './EmptyStateComponents';

export const EmptyEnhancedIssueLog = () => {
  return (
    <EmptyStateView
      title="Issue Log"
      description="Track and manage all building issues, maintenance requests, and service problems"
      icon={AlertTriangle}
      showEmailTip={true}
      features={[
        'Automatically created issues from emails',
        'Priority and status tracking',
        'Assignment to contractors and suppliers',
        'Progress updates and communication history',
        'Due dates and overdue notifications'
      ]}
    />
  );
};