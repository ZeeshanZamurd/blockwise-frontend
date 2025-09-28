import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Issue {
  id: string;
  title: string;
  summary: string;
  status: 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  emailId?: string | null;
  dateCreated: string;
  category: string;
  hasUpdate?: boolean;
  lastUpdated?: string;
  linkedEmailIds?: string[];
  linkedIssueIds?: string[];
  buildingId?: number;
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

interface IssuesState {
  issues: Issue[];
  isLoading: boolean;
  error: string | null;
}

const initialState: IssuesState = {
  issues: [],
  isLoading: false,
  error: null,
};

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setIssues: (state, action: PayloadAction<Issue[]>) => {
      state.issues = action.payload;
      state.error = null;
    },
    addIssue: (state, action: PayloadAction<Issue>) => {
      state.issues.push(action.payload);
      state.error = null;
    },
    updateIssue: (state, action: PayloadAction<Partial<Issue> & { id: string }>) => {
      const index = state.issues.findIndex(issue => issue.id === action.payload.id);
      if (index !== -1) {
        state.issues[index] = {
          ...state.issues[index],
          ...action.payload,
          hasUpdate: true,
          lastUpdated: action.payload.lastUpdated || new Date().toISOString()
        };
      }
      state.error = null;
    },
    deleteIssue: (state, action: PayloadAction<string>) => {
      state.issues = state.issues.filter(issue => issue.id !== action.payload);
      state.error = null;
    },
    linkIssueToEmail: (state, action: PayloadAction<{ issueId: string; emailId: string }>) => {
      const issue = state.issues.find(issue => issue.id === action.payload.issueId);
      if (issue) {
        issue.linkedEmailIds = [...(issue.linkedEmailIds || []), action.payload.emailId];
      }
    },
    linkIssueToIssue: (state, action: PayloadAction<{ issueId: string; linkedIssueId: string }>) => {
      const issue = state.issues.find(issue => issue.id === action.payload.issueId);
      if (issue) {
        issue.linkedIssueIds = [...(issue.linkedIssueIds || []), action.payload.linkedIssueId];
      }
    },
    unlinkIssueFromEmail: (state, action: PayloadAction<{ issueId: string; emailId: string }>) => {
      const issue = state.issues.find(issue => issue.id === action.payload.issueId);
      if (issue) {
        issue.linkedEmailIds = (issue.linkedEmailIds || []).filter(id => id !== action.payload.emailId);
      }
    },
    unlinkIssueFromIssue: (state, action: PayloadAction<{ issueId: string; linkedIssueId: string }>) => {
      const issue = state.issues.find(issue => issue.id === action.payload.issueId);
      if (issue) {
        issue.linkedIssueIds = (issue.linkedIssueIds || []).filter(id => id !== action.payload.linkedIssueId);
      }
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setIssues,
  addIssue,
  updateIssue,
  deleteIssue,
  linkIssueToEmail,
  linkIssueToIssue,
  unlinkIssueFromEmail,
  unlinkIssueFromIssue,
} = issuesSlice.actions;

export default issuesSlice.reducer;
