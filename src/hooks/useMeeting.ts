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

// Meeting types API returns an array of strings like
// ["AGM", "BOARD_MEETING", "GENERAL_MEETING", "COMMITTEE_MEETING"]

interface CreateMeetingData {
  title: string;
  type: string;
  date: string;
  time: string;
  attendees: string;
  status: string;
  transcript?: string;
  videoUrl?: string;
  notes?: string;
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
      
      // Map API response to Meeting interface
      const mappedMeetings: Meeting[] = responseData.data.map((apiMeeting: {
        id: number;
        title: string;
        type: string;
        date: string;
        time: string;
        attendees: string | null;
        status: string;
        transcript: string | null;
        videoUrl: string | null;
        notes: string | null;
      }) => ({
        id: apiMeeting.id,
        title: apiMeeting.title,
        type: apiMeeting.type,
        date: apiMeeting.date,
        time: apiMeeting.time,
        attendees: apiMeeting.attendees ? apiMeeting.attendees.split(',').map((a: string) => a.trim()) : [],
        status: apiMeeting.status,
        transcript: apiMeeting.transcript,
        videoUrl: apiMeeting.videoUrl,
        notes: apiMeeting.notes
      }));
      
      dispatch(setMeetings(mappedMeetings));
      return { success: true, meetings: mappedMeetings };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch meetings');
      console.error('Error fetching meetings:', error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchMeetingTypes = useCallback(async () => {
    try {
      console.log('Fetching meeting types...');
      const response = await api.get('/api/v1/meeting/types');
      const responseData = response.data;
      
      console.log('Meeting types API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch meeting types';
        return { success: false, error: errorMessage };
      }
      
      // responseData.data is string[] per spec
      return { success: true, meetingTypes: responseData.data as string[] };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch meeting types');
      console.error('Error fetching meeting types:', error);
      return { success: false, error: errorMessage };
    }
  }, []);

  const createMeeting = useCallback(async (meetingData: CreateMeetingData) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Creating meeting with data:', meetingData);
      console.log('Date value:', meetingData.date, 'Type:', typeof meetingData.date);
      
      // Try different date formats that the API might expect
      let formattedDate = meetingData.date;
      if (meetingData.date) {
        const dateObj = new Date(meetingData.date);
        if (!isNaN(dateObj.getTime())) {
          // Try multiple formats
          const formats = [
            dateObj.toISOString().split('T')[0], // YYYY-MM-DD
            dateObj.toISOString(), // Full ISO string
            dateObj.toLocaleDateString('en-CA'), // YYYY-MM-DD (alternative)
            dateObj.getTime().toString() // Timestamp
          ];
          
          console.log('Available date formats:', formats);
          // Use the standard YYYY-MM-DD format first
          formattedDate = formats[0];
        }
      }
      
      console.log('Formatted date:', formattedDate);
      
      const payload = {
        title: meetingData.title,
        type: meetingData.type,
        date: formattedDate,
        time: meetingData.time,
        attendees: meetingData.attendees,
        status: meetingData.status,
        transcript: meetingData.transcript || null,
        videoUrl: meetingData.videoUrl || null,
        notes: meetingData.notes || null
      };
      
      // Also try alternative payload structures
      const alternativePayloads = [
        payload, // Original
        { ...payload, date: new Date(meetingData.date).toISOString() }, // ISO string
        { ...payload, date: new Date(meetingData.date).getTime() }, // Timestamp
        { ...payload, meetingDate: formattedDate, date: formattedDate }, // Both field names
      ];
      
      console.log('API payload:', payload);
      console.log('Alternative payloads:', alternativePayloads);
      
      // Try the first payload first
      let response;
      try {
        response = await api.post('/api/v1/meeting', payload);
      } catch (error) {
        console.log('First payload failed, trying alternative...');
        // If the first fails, try the ISO string format
        response = await api.post('/api/v1/meeting', alternativePayloads[1]);
      }
      const responseData = response.data;
      
      console.log('Create meeting API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create meeting';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Map API response to Meeting interface
      const newMeeting: Meeting = {
        id: responseData.data.id,
        title: responseData.data.title,
        type: responseData.data.type,
        date: responseData.data.date,
        time: responseData.data.time,
        attendees: responseData.data.attendees ? responseData.data.attendees.split(',').map((a: string) => a.trim()) : [],
        status: responseData.data.status,
        transcript: responseData.data.transcript,
        videoUrl: responseData.data.videoUrl,
        notes: responseData.data.notes
      };
      
      dispatch(addMeeting(newMeeting));
      return { success: true, meeting: newMeeting };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to create meeting');
      console.error('Error creating meeting:', error);
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
    fetchMeetingTypes,
    createMeeting,
    updateMeeting: updateMeetingById,
    deleteMeeting,
    clearAllMeetings,
  };
};

export type { Meeting, CreateMeetingData };
