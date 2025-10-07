import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
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

  const fetchIssues = useCallback(async (buildingId: number) => {
    console.log('fetchIssues called with buildingId:', buildingId);
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Making API call to:', `/issues/building/${buildingId}`);
      const response = await api.get(`/issues/building/${buildingId}`);
      const responseData = response.data;
      
      console.log('API response received:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Map API response to match our Issue interface
      const mappedIssues: Issue[] = responseData.data.map((apiIssue: {
        id: number;
        buildingId: number;
        emailId: number | null;
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
        emailId: apiIssue.emailId, // Add emailId mapping
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
  }, [dispatch]);

  const createIssue = async (issueData: {
    buildingId: number;
    issueName: string;
    issueDesc: string;
    issueCategory: string;
    issuePriority: string;
    emailId?: number;
  }) => {
    console.log('createIssue called with data:', issueData);
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Making API call to /issues with data:', issueData);
      const response = await api.post('/issues', issueData);
      const responseData = response.data;
      
      console.log('API response received:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create issue';
        console.log('API returned error:', errorMessage);
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
        emailId: responseData.data.emailId, // Add emailId mapping
        dateCreated: new Date().toISOString(),
        buildingId: responseData.data.buildingId,
      };
      
      dispatch(addIssue(newIssue));
      console.log('Issue created successfully, returning:', { success: true, issue: responseData.data });
      return { success: true, issue: responseData.data };
    } catch (error: unknown) {
      console.error('Error in createIssue:', error);
      const errorMessage = getErrorMessage(error, 'Failed to create issue');
      console.log('Error message:', errorMessage);
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

  const getIssuesByBuildingIdAndStatus = useCallback(async (buildingId: number, status: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // Map display status to API status format - use exact API status names
      const apiStatus = status === 'live' ? 'NOT_STARTED' : // Map 'live' to NOT_STARTED for active issues
                       status; // Use status as-is since it's now the exact API value
      
      console.log('Status filter:', status, '-> API Status:', apiStatus);
      console.log('Making API call to:', `/issues/building/${buildingId}/status/${apiStatus}`);
      console.log('Full URL will be:', `${api.defaults.baseURL}/issues/building/${buildingId}/status/${apiStatus}`);
      const response = await api.get(`/issues/building/${buildingId}/status/${apiStatus}`);
      const responseData = response.data;
      
      console.log('Status API response received:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues by status';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Map API response to match our Issue interface
      const mappedIssues: Issue[] = responseData.data.map((apiIssue: {
        id: number;
        buildingId: number;
        emailId: number | null;
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
        emailId: apiIssue.emailId, // Add emailId mapping
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
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
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues by status');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const getIssuesByBuildingIdAndPriority = useCallback(async (buildingId: number, priority: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // Capitalize the first letter of priority (high -> High, medium -> Medium, low -> Low)
      const capitalizedPriority = priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
      
      console.log('Priority filter:', priority, '-> Capitalized:', capitalizedPriority);
      console.log('Making API call to:', `/issues/building/${buildingId}/priority/${capitalizedPriority}`);
      console.log('Full URL will be:', `${api.defaults.baseURL}/issues/building/${buildingId}/priority/${capitalizedPriority}`);
      const response = await api.get(`/issues/building/${buildingId}/priority/${capitalizedPriority}`);
      const responseData = response.data;
      
      console.log('Priority API response received:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch issues by priority';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Map API response to match our Issue interface
      const mappedIssues: Issue[] = responseData.data.map((apiIssue: {
        id: number;
        buildingId: number;
        emailId: number | null;
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
        emailId: apiIssue.emailId, // Add emailId mapping
        dateCreated: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
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
      const errorMessage = getErrorMessage(error, 'Failed to fetch issues by priority');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const getIssueById = useCallback(async (issueId: string) => {
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
  }, [dispatch]);

  const updateIssueDetails = useCallback(async (issueId: string, updateData: {
    issueName?: string;
    issueDesc?: string;
    statusId?: number;
    latestUpdate?: string;
  }) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.put(`/issues/${issueId}`, updateData);
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to update issue';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Update the issue in Redux store
      const reduxUpdateData: Partial<Issue> & { id: string } = {
        id: issueId,
        lastUpdated: new Date().toISOString()
      };

      // Map API fields to Redux fields
      if (updateData.issueName) reduxUpdateData.title = updateData.issueName;
      if (updateData.issueDesc) reduxUpdateData.summary = updateData.issueDesc;
      // Note: latestUpdate is not stored in Redux Issue interface, it's handled separately
      
      // Map statusId to status if provided (based on API response)
      if (updateData.statusId) {
        const statusMap: { [key: number]: string } = {
          1: 'Not started',    // NOT_STARTED
          2: 'In progress',    // IN_PROGRESS
          3: 'In review',      // IN_REVIEW
          4: 'Closed',         // CLOSED
          5: 'Paused'          // PAUSED
        };
        reduxUpdateData.status = statusMap[updateData.statusId] as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused';
      }

      dispatch(updateIssue(reduxUpdateData));
      
      return { success: true, issue: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update issue');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateIssueStatus = useCallback(async (issueId: string, newStatus: string, buildingId?: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // Map display status to statusId (based on API response)
      const statusId = newStatus === 'Not started' ? 1 :    // NOT_STARTED
                      newStatus === 'In progress' ? 2 :    // IN_PROGRESS
                      newStatus === 'In review' ? 3 :       // IN_REVIEW
                      newStatus === 'Closed' ? 4 :          // CLOSED
                      newStatus === 'Paused' ? 5 :          // PAUSED
                      1; // Default to NOT_STARTED
      
      const response = await api.put(`/issues/${issueId}`, { statusId });
      const responseData = response.data;
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to update issue status';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Update the issue in Redux store
      const updateData: Partial<Issue> & { id: string } = {
        id: issueId,
        status: newStatus as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused',
        lastUpdated: new Date().toISOString()
      };

      dispatch(updateIssue(updateData));
      
      // Refresh the issues list in the background if buildingId is provided
      if (buildingId) {
        console.log('Refreshing issues list after status update for building:', buildingId);
        // Don't show loading state for this background refresh
        try {
          const refreshResponse = await api.get(`/issues/building/${buildingId}`);
          const refreshData = refreshResponse.data;
          
          if (refreshData.success !== false) {
            // Map API response to match our Issue interface
            const mappedIssues: Issue[] = refreshData.data.map((apiIssue: {
              id: number;
              buildingId: number;
              emailId: number | null;
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
              emailId: apiIssue.emailId, // Add emailId mapping
        dateCreated: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
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
            
            // Update the issues list silently
            dispatch(setIssues(mappedIssues));
            console.log('Issues list refreshed successfully');
          }
        } catch (refreshError) {
          console.warn('Failed to refresh issues list after status update:', refreshError);
          // Don't throw error - this is a background operation
        }
      }
      
      return { success: true, issue: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update issue status');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const editIssue = async (issueId: string, issueData: {
    issueName?: string;
    issueDesc?: string;
    issueCategory?: string;
    issuePriority?: string;
    statusId?: number;
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
      
      // Map statusId to status if provided (based on API response)
      if (issueData.statusId) {
        const statusMap: { [key: number]: string } = {
          1: 'Not started',    // NOT_STARTED
          2: 'In progress',    // IN_PROGRESS
          3: 'In review',      // IN_REVIEW
          4: 'Closed',         // CLOSED
          5: 'Paused'          // PAUSED
        };
        updateData.status = statusMap[issueData.statusId] as 'Not started' | 'In review' | 'In progress' | 'Closed' | 'Paused';
      }

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
    updateIssueDetails,
    updateIssueStatus,
    editIssue,
    getIssueStatusList,
    clearIssueError,
  };
};
