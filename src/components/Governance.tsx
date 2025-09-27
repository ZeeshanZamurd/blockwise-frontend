import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Archive, Users, ClipboardList } from 'lucide-react';
import MeetingsSection from './MeetingsSection';
import DirectorsSection from './DirectorsSection';
import GovernanceAudit from './GovernanceAudit';

interface GovernanceProps {
  emptyDataMode?: boolean;
  userData?: any;
}

const Governance = ({ emptyDataMode = false, userData }: GovernanceProps) => {
  const [activeTab, setActiveTab] = useState('meetings');

  if (emptyDataMode) {
    return (
      <div className="p-3 md:p-6 space-y-4 md:space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Boardroom</h2>
          <p className="text-gray-600">Meeting management and supplier coordination</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="meetings" className="flex items-center gap-2">
              <Archive className="h-4 w-4" />
              Meetings & AGMs
            </TabsTrigger>
            <TabsTrigger value="directors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Directors
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4" />
              Audit Trail
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="meetings" className="mt-6">
            <MeetingsSection emptyDataMode={true} />
          </TabsContent>
          
          <TabsContent value="directors" className="mt-6">
            <DirectorsSection emptyDataMode={true} userData={userData} />
          </TabsContent>
          
          <TabsContent value="audit" className="mt-6">
            <GovernanceAudit emptyDataMode={true} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Boardroom</h2>
        <p className="text-gray-600">Meeting management and supplier coordination</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meetings" className="flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Meetings & AGMs
          </TabsTrigger>
          <TabsTrigger value="directors" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Directors
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="meetings" className="mt-6">
          <MeetingsSection emptyDataMode={emptyDataMode} />
        </TabsContent>
        
        <TabsContent value="directors" className="mt-6">
          <DirectorsSection emptyDataMode={emptyDataMode} userData={userData} />
        </TabsContent>
        
        <TabsContent value="audit" className="mt-6">
          <GovernanceAudit emptyDataMode={emptyDataMode} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Governance;