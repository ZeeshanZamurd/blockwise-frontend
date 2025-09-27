
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import BuildingManagement from '@/components/BuildingManagement';
import ComplianceHub from '@/components/ComplianceHub';
import Governance from '@/components/Governance';
import Financials from '@/components/Financials';
import EditableBlockDetails from '@/components/EditableBlockDetails';
import ExampleDataBanner from '@/components/ExampleDataBanner';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('home');
  const [emptyDataMode, setEmptyDataMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true); // Start collapsed on mobile
  const [showExampleDataBanner, setShowExampleDataBanner] = useState(true);
  const [hasExampleData, setHasExampleData] = useState(true);
  
  // User data from onboarding - in real app this would come from auth/context
  const [userData] = useState({
    email: 'director@example.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'rmc-director',
    buildingName: 'Alto Residential',
    buildingAddress: '123 Example Street, London, E1 6AN',
    numberOfFlats: '24',
    uniqueEmail: 'alto-residential-e16an@blocwise.email'
  });
  
  const { toast } = useToast();

  // Handle section changes from URL params
  useEffect(() => {
    const section = searchParams.get('section');
    if (section) {
      setActiveSection(section);
    }
  }, [searchParams]);

  const handleClearExampleData = () => {
    setHasExampleData(false);
    setEmptyDataMode(true);
    setShowExampleDataBanner(false);
    toast({
      title: "Example data cleared",
      description: "You can now start using BlocWise with your own data. Forward emails to begin!",
    });
  };

  const handleDismissBanner = () => {
    setShowExampleDataBanner(false);
  };

  const renderContent = () => {
    const props = { emptyDataMode: emptyDataMode || !hasExampleData, userData };
    
    switch (activeSection) {
      case 'home':
        return <Dashboard {...props} />;
      case 'building-management':
        return <BuildingManagement {...props} />;
      case 'compliance-hub':
        return <ComplianceHub {...props} />;
      case 'governance':
        return <Governance {...props} />;
      case 'financials':
        return <Financials {...props} />;
      case 'building-info':
        return <EditableBlockDetails {...props} />;
      default:
        return <Dashboard {...props} />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header emptyDataMode={emptyDataMode} onToggleEmptyMode={() => setEmptyDataMode(!emptyDataMode)} />
      {emptyDataMode && showExampleDataBanner && (
        <ExampleDataBanner 
          onClearData={handleClearExampleData}
          onDismiss={handleDismissBanner}
        />
      )}
      <div className="flex flex-1 h-[calc(100vh-80px)]">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
