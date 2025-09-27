import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ComplianceSection from './ComplianceSection';
import DocumentVault from './DocumentVault';

interface ComplianceHubProps {
  emptyDataMode?: boolean;
}

const ComplianceHub = ({ emptyDataMode = false }: ComplianceHubProps) => {
  const [activeTab, setActiveTab] = useState('compliance');

  // Always show compliance data regardless of emptyDataMode
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Compliance Hub</h2>
        <p className="text-gray-600">Track certificates, regulations and safety documentation</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="documents">Document Vault</TabsTrigger>
        </TabsList>
        
        <TabsContent value="compliance" className="mt-6">
          <ComplianceSection emptyDataMode={false} />
        </TabsContent>
        
        <TabsContent value="documents" className="mt-6">
          <DocumentVault emptyDataMode={emptyDataMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceHub;