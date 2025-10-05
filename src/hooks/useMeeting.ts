import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../lib/api';
import { 
  setLoading, 
  setError, 
  clearError, 
  setMeetings, 
  addMeeting, 
  updateMeeting, 
  removeMeeting, 
  clearMeetings,
  Meeting 
} from '../store/meetingsSlice';
import { RootState, AppDispatch } from '../store/store';

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

export const useMeeting = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { meetings, isLoading, error } = useSelector((state: RootState) => state.meetings);

  const fetchMeetings = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Fetching meetings from API...');
      const response = await api.get('/api/v1/meeting');
      const responseData = response.data;
      
      console.log('Meetings API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch meetings';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      dispatch(setMeetings(responseData.data));
      return { success: true, meetings: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch meetings');
      console.error('Error fetching meetings:', error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createMeeting = useCallback(async (meetingData: Omit<Meeting, 'id'>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      // For now, we'll add it locally since we don't have a create API
      const newMeeting: Meeting = {
        id: Date.now(), // Temporary ID
        ...meetingData
      };
      
      dispatch(addMeeting(newMeeting));
      return { success: true, meeting: newMeeting };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to create meeting');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateMeetingById = useCallback(async (id: number, updates: Partial<Meeting>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      dispatch(updateMeeting({ id, updates }));
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update meeting');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteMeeting = useCallback(async (id: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      dispatch(removeMeeting(id));
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to delete meeting');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const clearAllMeetings = useCallback(() => {
    dispatch(clearMeetings());
  }, [dispatch]);

  return {
    meetings,
    isLoading,
    error,
    fetchMeetings,
    createMeeting,
    updateMeeting: updateMeetingById,
    deleteMeeting,
    clearAllMeetings,
  };
};

export type { Meeting };
