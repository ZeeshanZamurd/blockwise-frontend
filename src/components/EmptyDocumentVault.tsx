import React from 'react';
import { FileText } from 'lucide-react';
import { EmptyStateView } from './EmptyStateComponents';

export const EmptyDocumentVault = () => {
  return (
    <EmptyStateView
      title="Document Vault"
      description="Secure storage and management of all building documents"
      icon={FileText}
      showEmailTip={false}
      features={[
        'Certificates and compliance documents',
        'Building plans and specifications',
        'Insurance policies and warranties',
        'Financial reports and statements',
        'Meeting minutes and resolutions'
      ]}
    />
  );
};