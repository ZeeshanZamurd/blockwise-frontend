import React from 'react';
import { Calendar } from 'lucide-react';
import { EmptyStateView } from './EmptyStateComponents';

export const EmptyCalendarSection = () => {
  return (
    <EmptyStateView
      title="Calendar"
      description="Schedule and manage building events, maintenance, and meetings"
      icon={Calendar}
      showEmailTip={false}
      features={[
        'Maintenance scheduling and reminders',
        'Board meetings and AGM planning',
        'Contractor appointment booking',
        'Resident event coordination',
        'Certificate expiry tracking'
      ]}
    />
  );
};