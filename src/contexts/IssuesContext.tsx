import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Issue {
  id: string;
  title: string;
  summary: string;
  status: 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  emailId?: string;
  dateCreated: string;
  category: string;
  hasUpdate?: boolean;
  lastUpdated?: string;
  linkedEmailIds?: string[];
  linkedIssueIds?: string[];
}

interface IssuesContextType {
  issues: Issue[];
  addIssue: (issue: Omit<Issue, 'id'>) => string;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  getIssuesByEmail: (emailId: string) => Issue[];
  linkIssueToEmail: (issueId: string, emailId: string) => void;
  linkIssueToIssue: (issueId: string, linkedIssueId: string) => void;
  unlinkIssueFromEmail: (issueId: string, emailId: string) => void;
  unlinkIssueFromIssue: (issueId: string, linkedIssueId: string) => void;
}

const IssuesContext = createContext<IssuesContextType | undefined>(undefined);

export const useIssues = () => {
  const context = useContext(IssuesContext);
  if (!context) {
    throw new Error('useIssues must be used within an IssuesProvider');
  }
  return context;
};

interface IssuesProviderProps {
  children: ReactNode;
}

export const IssuesProvider = ({ children }: IssuesProviderProps) => {
  const [issues, setIssues] = useState<Issue[]>([
    {
      id: 'ISS-2024-001',
      title: 'Water leak in flat 3B ceiling',
      summary: 'Resident reports water dripping from ceiling, likely from flat above',
      status: 'Not started',
      priority: 'High',
      dateCreated: '2024-01-15',
      category: 'Maintenance',
      emailId: 'email-1',
      linkedEmailIds: ['EML-2024-001'],
      hasUpdate: true,
      lastUpdated: '2024-01-15T14:30:00Z'
    },
    {
      id: 'ISS-2024-002',
      title: 'Broken door lock on main entrance',
      summary: 'Front door lock mechanism is faulty, affecting security',
      status: 'In progress',
      priority: 'Medium',
      dateCreated: '2024-01-14',
      category: 'Security',
      emailId: 'email-2',
      linkedEmailIds: ['EML-2024-002']
    },
    {
      id: 'ISS-2024-003',
      title: 'Heating system malfunction',
      summary: 'Central heating not working properly in building',
      status: 'Not started',
      priority: 'Urgent',
      dateCreated: '2024-01-13',
      category: 'Utilities',
      emailId: 'email-3',
      linkedEmailIds: ['EML-2024-003']
    },
    {
      id: 'ISS-2024-004',
      title: 'Lift out of service - floor 5',
      summary: 'Main elevator stopped working, residents unable to access upper floors',
      status: 'In progress',
      priority: 'High',
      dateCreated: '2024-01-12',
      category: 'Maintenance',
      hasUpdate: true,
      lastUpdated: '2024-01-12T09:15:00Z'
    },
    {
      id: 'ISS-2024-005',
      title: 'Parking permit system malfunction',
      summary: 'Electronic parking barriers not recognizing resident permits',
      status: 'Not started',
      priority: 'Medium',
      dateCreated: '2024-01-11',
      category: 'Security'
    },
    {
      id: 'ISS-2024-006',
      title: 'Communal garden lighting failure',
      summary: 'Several streetlights in the garden area are not working, safety concern',
      status: 'Paused',
      priority: 'Medium',
      dateCreated: '2024-01-10',
      category: 'Maintenance'
    },
    {
      id: 'ISS-2024-007',
      title: 'Waste collection access issue',
      summary: 'Refuse trucks unable to access bins due to blocked service road',
      status: 'Not started',
      priority: 'Low',
      dateCreated: '2024-01-09',
      category: 'Management'
    },
    {
      id: 'ISS-2024-008',
      title: 'Intercom system interference',
      summary: 'Video intercom system has static interference affecting communication',
      status: 'In review',
      priority: 'Low',
      dateCreated: '2024-01-08',
      category: 'Security',
      hasUpdate: true,
      lastUpdated: '2024-01-08T16:45:00Z'
    },
    // Demo issues with current timestamps for blue highlighting
    {
      id: 'ISS-2024-009',
      title: 'Emergency lighting system failure',
      summary: 'Emergency exit lighting not functioning properly, requires immediate attention',
      status: 'Not started',
      priority: 'High',
      dateCreated: new Date().toISOString(),
      category: 'Safety'
    },
    {
      id: 'ISS-2024-010',
      title: 'HVAC system temperature control',
      summary: 'Temperature regulation issues reported in multiple units',
      status: 'In progress',
      priority: 'Medium',
      dateCreated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      category: 'Utilities',
      hasUpdate: true,
      lastUpdated: new Date().toISOString()
    }
  ]);

  const addIssue = (issueData: Omit<Issue, 'id'>): string => {
    const newId = `ISS-2024-${String(issues.length + 1).padStart(3, '0')}`;
    const newIssue: Issue = {
      ...issueData,
      id: newId
    };
    setIssues(prev => [...prev, newIssue]);
    return newId;
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues(prev => prev.map(issue => 
      issue.id === id ? { 
        ...issue, 
        ...updates, 
        hasUpdate: true, 
        lastUpdated: new Date().toISOString() 
      } : issue
    ));
  };

  const deleteIssue = (id: string) => {
    setIssues(prev => prev.filter(issue => issue.id !== id));
  };

  const getIssuesByEmail = (emailId: string): Issue[] => {
    return issues.filter(issue => issue.emailId === emailId);
  };

  const linkIssueToEmail = (issueId: string, emailId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            linkedEmailIds: [...(issue.linkedEmailIds || []), emailId]
          }
        : issue
    ));
  };

  const linkIssueToIssue = (issueId: string, linkedIssueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            linkedIssueIds: [...(issue.linkedIssueIds || []), linkedIssueId]
          }
        : issue
    ));
  };

  const unlinkIssueFromEmail = (issueId: string, emailId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            linkedEmailIds: (issue.linkedEmailIds || []).filter(id => id !== emailId)
          }
        : issue
    ));
  };

  const unlinkIssueFromIssue = (issueId: string, linkedIssueId: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId 
        ? { 
            ...issue, 
            linkedIssueIds: (issue.linkedIssueIds || []).filter(id => id !== linkedIssueId)
          }
        : issue
    ));
  };

  return (
    <IssuesContext.Provider value={{
      issues,
      addIssue,
      updateIssue,
      deleteIssue,
      getIssuesByEmail,
      linkIssueToEmail,
      linkIssueToIssue,
      unlinkIssueFromEmail,
      unlinkIssueFromIssue
    }}>
      {children}
    </IssuesContext.Provider>
  );
};