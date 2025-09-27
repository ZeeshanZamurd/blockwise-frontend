import React from 'react';
import { Archive } from 'lucide-react';
import { EmptyStateView } from './EmptyStateComponents';

export const EmptyMeetingsSection = () => {
  return (
    <EmptyStateView
      title="Meetings & AGMs"
      description="Organize board meetings, AGMs, and resident assemblies"
      icon={Archive}
      showEmailTip={false}
      features={[
        'Meeting scheduling and agenda management',
        'Board resolutions and voting records',
        'Annual General Meeting organization',
        'Meeting minutes and documentation',
        'Resident participation tracking'
      ]}
    />
  );
};