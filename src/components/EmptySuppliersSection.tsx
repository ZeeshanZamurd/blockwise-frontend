import React from 'react';
import { Users } from 'lucide-react';
import { EmptyStateView } from './EmptyStateComponents';

export const EmptySuppliersSection = () => {
  return (
    <EmptyStateView
      title="Suppliers"
      description="Manage contractors, service providers, and building suppliers"
      icon={Users}
      showEmailTip={false}
      features={[
        'Contractor contact information and ratings',
        'Service history and performance tracking',
        'Quote comparison and management',
        'Certification and insurance verification',
        'Preferred supplier recommendations'
      ]}
    />
  );
};