import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { Issue as ReduxIssue, addIssue as addIssueAction, updateIssue as updateIssueAction, deleteIssue as deleteIssueAction } from '../store/issuesSlice';

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
  assignedTo?: string | null;
  reporter?: string | null;
  comments?: unknown[];
  attachments?: unknown[];
  tags?: string[];
  dueDate?: string | null;
  estimatedHours?: number | null;
  actualHours?: number | null;
  linkedIssues?: { id: string; type: string }[];
  subTasks?: unknown[];
  auditHistory?: unknown[];
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
  const dispatch = useDispatch<AppDispatch>();
  const issues = useSelector((state: RootState) => state.issues.issues);

  const addIssue = (issueData: Omit<Issue, 'id'>): string => {
    const newId = `ISS-2024-${String(issues.length + 1).padStart(3, '0')}`;
    const newIssue = {
      id: newId,
      title: issueData.title,
      summary: issueData.summary,
      status: issueData.status,
      priority: issueData.priority,
      category: issueData.category,
      dateCreated: issueData.dateCreated,
      lastUpdated: issueData.lastUpdated,
      assignedTo: null,
      reporter: null,
      comments: [],
      attachments: [],
      tags: [],
      dueDate: null,
      estimatedHours: null,
      actualHours: null,
      linkedIssues: [],
      subTasks: [],
      auditHistory: []
    };
    dispatch(addIssueAction(newIssue));
    return newId;
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    const updateData: Partial<ReduxIssue> & { id: string } = {
      id,
      ...updates,
      lastUpdated: new Date().toISOString()
    };
    dispatch(updateIssueAction(updateData));
  };

  const deleteIssue = (id: string) => {
    dispatch(deleteIssueAction(id));
  };

  const getIssuesByEmail = (emailId: string): Issue[] => {
    return issues.filter(issue => issue.emailId === emailId);
  };

  const linkIssueToEmail = (issueId: string, emailId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      const updateData = {
        id: issueId,
        linkedIssues: [...(issue.linkedIssues || []), { id: emailId, type: 'email' }],
        lastUpdated: new Date().toISOString()
      };
      dispatch(updateIssueAction(updateData));
    }
  };

  const linkIssueToIssue = (issueId: string, linkedIssueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      const updateData = {
        id: issueId,
        linkedIssues: [...(issue.linkedIssues || []), { id: linkedIssueId, type: 'issue' }],
        lastUpdated: new Date().toISOString()
      };
      dispatch(updateIssueAction(updateData));
    }
  };

  const unlinkIssueFromEmail = (issueId: string, emailId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      const updateData = {
        id: issueId,
        linkedIssues: (issue.linkedIssues || []).filter(link => !(link.id === emailId && link.type === 'email')),
        lastUpdated: new Date().toISOString()
      };
      dispatch(updateIssueAction(updateData));
    }
  };

  const unlinkIssueFromIssue = (issueId: string, linkedIssueId: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (issue) {
      const updateData = {
        id: issueId,
        linkedIssues: (issue.linkedIssues || []).filter(link => !(link.id === linkedIssueId && link.type === 'issue')),
        lastUpdated: new Date().toISOString()
      };
      dispatch(updateIssueAction(updateData));
    }
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