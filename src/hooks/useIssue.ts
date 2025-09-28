import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, clearError, addIssue, updateIssue, deleteIssue, setIssues, Issue } from '../store/issuesSlice';
import api from '../lib/api';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiError;
    return apiError.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

export const useIssue = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { issues, isLoading, error } = useSelector((state: RootState) => state.issues);

  const fetchIssues = async (buildingId: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get(`/issues/building/${buildingId}`);
      const responseData = response.data;
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Map API response to match our Issue interface
      const mappedIssues: Issue[] = responseData.data.map((apiIssue: {
        id: number;
        issueName: string;
        issueDesc: string;
        issueCategory: string;
        issuePriority: string;
        issueStatus: string;
      }) => ({
        id: apiIssue.id.toString(),
        title: apiIssue.issueName,
        summary: apiIssue.issueDesc,
        category: apiIssue.issueCategory,
        priority: apiIssue.issuePriority,
        status: apiIssue.issueStatus === 'NOT_STARTED' ? 'Not started' : 
                apiIssue.issueStatus === 'IN_PROGRESS' ? 'In progress' :
                apiIssue.issueStatus === 'IN_REVIEW' ? 'In review' :
                apiIssue.issueStatus === 'CLOSED' ? 'Closed' :
                apiIssue.issueStatus === 'PAUSED' ? 'Paused' : 'Not started',
        dateCreated: new Date().toISOString(), // API doesn't provide creation date
        lastUpdated: new Date().toISOString(), // API doesn't provide update date
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
      }));
      
      // Store issues in Redux
      dispatch(setIssues(mappedIssues));
      return { success: true, issues: mappedIssues };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createIssue = async (issueData: {
    buildingId: number;
    issueName: string;
    issueDesc: string;
    issueCategory: string;
    issuePriority: string;
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.post('/issues', issueData);
      const responseData = response.data;
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create issue';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Add the new issue to Redux store
      const newIssue = {
        id: responseData.data.id?.toString() || `ISS-${Date.now()}`,
        title: responseData.data.issueName,
        summary: responseData.data.issueDesc,
        status: (responseData.data.issueStatus || 'Not started') as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused',
        priority: responseData.data.issuePriority as 'Low' | 'Medium' | 'High' | 'Urgent',
        category: responseData.data.issueCategory,
        dateCreated: new Date().toISOString(),
        buildingId: responseData.data.buildingId,
        emailId: responseData.data.emailId
      };
      
      dispatch(addIssue(newIssue));
      return { success: true, issue: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to create issue');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIssuesByBuildingId = async (buildingId: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get(`/issues/building/${buildingId}`);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      dispatch(setIssues(responseData.data));
      return { success: true, issues: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIssuesByBuildingIdAndCategory = async (buildingId: number, category: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get(`/issues/building/${buildingId}/category/${category}`);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues by category';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      return { success: true, issues: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues by category');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIssuesByBuildingIdAndStatus = async (buildingId: number, status: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get(`/issues/building/${buildingId}/status/${status}`);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues by status';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      return { success: true, issues: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues by status');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIssuesByBuildingIdAndPriority = async (buildingId: number, priority: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get(`/issues/building/${buildingId}/priority/${priority}`);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues by priority';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      return { success: true, issues: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues by priority');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIssueById = async (issueId: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get(`/issues/${issueId}`);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issue';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      return { success: true, issue: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issue');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const editIssue = async (issueId: string, issueData: {
    issueName?: string;
    issueDesc?: string;
    issueCategory?: string;
    issuePriority?: string;
    issueStatus?: string;
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.put(`/issues/${issueId}`, issueData);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to update issue';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Update the issue in Redux store
      const updateData: Partial<Issue> & { id: string } = {
        id: issueId,
        lastUpdated: new Date().toISOString()
      };

      // Map API fields to Redux store fields
      if (issueData.issueName) updateData.title = issueData.issueName;
      if (issueData.issueDesc) updateData.summary = issueData.issueDesc;
      if (issueData.issueCategory) updateData.category = issueData.issueCategory;
      if (issueData.issuePriority) updateData.priority = issueData.issuePriority as 'Low' | 'Medium' | 'High' | 'Urgent';
      if (issueData.issueStatus) updateData.status = issueData.issueStatus as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused';

      dispatch(updateIssue(updateData));
      
      return { success: true, issue: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update issue');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getIssueStatusList = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get('/issues/status-list');
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issue status list';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      return { success: true, statusList: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch issue status list');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const clearIssueError = () => {
    dispatch(clearError());
  };

  return {
    issues,
    isLoading,
    error,
    fetchIssues,
    createIssue,
    getIssuesByBuildingId,
    getIssuesByBuildingIdAndCategory,
    getIssuesByBuildingIdAndStatus,
    getIssuesByBuildingIdAndPriority,
    getIssueById,
    editIssue,
    getIssueStatusList,
    clearIssueError,
  };
};
