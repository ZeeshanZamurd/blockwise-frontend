import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  body: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Unread' | 'Read' | 'Needs Review' | 'Completed';
  aiSummary?: string;
  linkedIssueIds?: string[];
  tags?: string[];
}

interface EmailsContextType {
  emails: Email[];
  addEmail: (email: Omit<Email, 'id'>) => string;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  deleteEmail: (id: string) => void;
  getEmailById: (id: string) => Email | undefined;
  linkEmailToIssue: (emailId: string, issueId: string) => void;
  unlinkEmailFromIssue: (emailId: string, issueId: string) => void;
}

const EmailsContext = createContext<EmailsContextType | undefined>(undefined);

export const useEmails = () => {
  const context = useContext(EmailsContext);
  if (!context) {
    throw new Error('useEmails must be used within an EmailsProvider');
  }
  return context;
};

interface EmailsProviderProps {
  children: ReactNode;
}

export const EmailsProvider = ({ children }: EmailsProviderProps) => {
  const [emails, setEmails] = useState<Email[]>([
    {
      id: 'EML-2024-001',
      subject: 'Water leak in flat 3B ceiling - urgent repair needed',
      from: 'resident.3b@buildingmail.com',
      to: 'management@property.com',
      date: '2024-01-15T09:30:00Z',
      body: 'Dear Management Team,\n\nI am writing to report a serious water leak in my flat 3B. Water is dripping from the ceiling in the living room, and it appears to be coming from the flat above. This started yesterday evening and has gotten worse overnight.\n\nI have placed buckets to catch the water, but this is causing damage to my property. Please arrange for immediate inspection and repair.\n\nBest regards,\nSarah Johnson\nFlat 3B',
      priority: 'High',
      status: 'Completed',
      aiSummary: 'Resident reports urgent water leak from ceiling in flat 3B, likely from flat above. Requires immediate plumber inspection.',
      linkedIssueIds: ['ISS-2024-001']
    },
    {
      id: 'EML-2024-002',
      subject: 'Broken door lock on main entrance',
      from: 'security@buildingmail.com',
      to: 'management@property.com',
      date: '2024-01-14T14:20:00Z',
      body: 'Management Team,\n\nDuring our evening security check, we discovered that the main entrance door lock is malfunctioning. The electronic mechanism is not engaging properly, which is a serious security concern.\n\nWe have temporarily secured the building but this needs immediate attention.\n\nRegards,\nSecurity Team',
      priority: 'Medium',
      status: 'Completed',
      aiSummary: 'Security team reports malfunctioning main entrance door lock, creating security risk. Needs locksmith immediately.',
      linkedIssueIds: ['ISS-2024-002']
    },
    {
      id: 'EML-2024-003',
      subject: 'Central heating system not working - multiple complaints',
      from: 'maintenance@buildingmail.com',
      to: 'management@property.com',
      date: '2024-01-13T08:45:00Z',
      body: 'Dear Management,\n\nWe have received multiple complaints from residents about the central heating system not working properly. The boiler appears to be functioning but heat is not reaching several flats on floors 2-4.\n\nThis requires urgent attention given the cold weather. Please arrange for heating engineer inspection.\n\nMaintenance Team',
      priority: 'Urgent',
      status: 'Completed',
      aiSummary: 'Multiple residents complaining about heating system failure affecting floors 2-4. Boiler working but heat not distributing properly.',
      linkedIssueIds: ['ISS-2024-003']
    },
    {
      id: 'EML-2024-004',
      subject: 'Elevator maintenance scheduling - Annual service due',
      from: 'elevator.service@thamesvalley.com',
      to: 'management@property.com',
      date: '2024-01-12T11:15:00Z',
      body: 'Dear Property Manager,\n\nThis is a reminder that your building\'s elevator annual maintenance service is due this month. We can schedule this for next week if convenient.\n\nThe service includes full safety inspection, mechanical checks, and certification renewal.\n\nPlease confirm your preferred date and time.\n\nBest regards,\nThames Valley Elevators',
      priority: 'Medium',
      status: 'Needs Review',
      aiSummary: '',
      linkedIssueIds: []
    },
    {
      id: 'EML-2024-005',
      subject: 'Noise complaint - Flat 5A',
      from: 'resident.2c@buildingmail.com',
      to: 'management@property.com',
      date: '2024-01-11T22:30:00Z',
      body: 'Hello,\n\nI am writing to complain about excessive noise coming from Flat 5A. This has been ongoing for several nights now, with loud music and voices continuing until very late.\n\nI have tried speaking to them directly but they are not responsive. Can you please address this issue?\n\nThank you,\nMichael Chen\nFlat 2C',
      priority: 'Low',
      status: 'Needs Review',
      aiSummary: '',
      linkedIssueIds: []
    }
  ]);

  const addEmail = (emailData: Omit<Email, 'id'>): string => {
    const newId = `EML-2024-${String(emails.length + 1).padStart(3, '0')}`;
    const newEmail: Email = {
      ...emailData,
      id: newId
    };
    setEmails(prev => [...prev, newEmail]);
    return newId;
  };

  const updateEmail = (id: string, updates: Partial<Email>) => {
    setEmails(prev => prev.map(email => 
      email.id === id ? { ...email, ...updates } : email
    ));
  };

  const deleteEmail = (id: string) => {
    setEmails(prev => prev.filter(email => email.id !== id));
  };

  const getEmailById = (id: string): Email | undefined => {
    return emails.find(email => email.id === id);
  };

  const linkEmailToIssue = (emailId: string, issueId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { 
            ...email, 
            linkedIssueIds: [...(email.linkedIssueIds || []), issueId],
            status: 'Completed' as const
          }
        : email
    ));
  };

  const unlinkEmailFromIssue = (emailId: string, issueId: string) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId 
        ? { 
            ...email, 
            linkedIssueIds: (email.linkedIssueIds || []).filter(id => id !== issueId)
          }
        : email
    ));
  };

  return (
    <EmailsContext.Provider value={{
      emails,
      addEmail,
      updateEmail,
      deleteEmail,
      getEmailById,
      linkEmailToIssue,
      unlinkEmailFromIssue
    }}>
      {children}
    </EmailsContext.Provider>
  );
};