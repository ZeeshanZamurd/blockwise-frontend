import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../lib/api';
import { 
  setLoading, 
  setError, 
  clearError, 
  setEvents, 
  addEvent, 
  updateEvent, 
  removeEvent, 
  clearEvents,
  setHasAttemptedFetch,
  CalendarEvent 
} from '../store/calendarSlice';
import { RootState, AppDispatch } from '../store/store';
import { useBuilding } from './useBuilding';

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
  };
}

interface CreateEventData {
  title: string;
  date: string;
  time: string;
  duration?: string;
  type: string;
  location?: string;
  contact?: string;
  contactPhone?: string;
  contactEmail?: string;
  description?: string;
  schedule?: string;
  scheduleDetails?: string;
  contractor?: string;
  cost?: string;
  notes?: string;
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as ApiError;
    return apiError.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

export const useCalendar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { events, isLoading, error, hasAttemptedFetch } = useSelector((state: RootState) => state.calendar);
  const { building } = useBuilding();

  const fetchEvents = useCallback(async (buildingId?: number) => {
    const targetBuildingId = buildingId || building?.buildingId;
    
    if (!targetBuildingId) {
      console.warn('No building ID available for fetching calendar events');
      return { success: false, error: 'No building ID available' };
    }

    // Prevent infinite calls
    if (hasAttemptedFetch && !isLoading) {
      console.log('Calendar events already fetched, skipping API call');
      return { success: true, events };
    }

    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      dispatch(setHasAttemptedFetch(true));
      
      console.log('Fetching calendar events for buildingId:', targetBuildingId);
      
      const response = await api.get(`/api/v1/meeting/calendar`);
      const responseData = response.data;
      
      console.log('Calendar API response:', responseData);
      console.log('Calendar API response data:', responseData.data);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch calendar events';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Extract meetings from the nested structure
      const meetingsData = responseData.data?.monthlyMeetings?.meetings || [];
      console.log('Extracted meetings data:', meetingsData);
      
      // Map API response to CalendarEvent interface
      const mappedEvents: CalendarEvent[] = meetingsData.map((apiEvent: any) => ({
        id: apiEvent.id,
        title: apiEvent.title,
        date: apiEvent.date,
        time: apiEvent.time,
        duration: apiEvent.duration || null,
        type: apiEvent.type,
        location: apiEvent.location || null,
        contact: apiEvent.contact || null,
        contactPhone: apiEvent.contactPhone || null,
        contactEmail: apiEvent.contactEmail || null,
        description: apiEvent.description || null,
        schedule: apiEvent.schedule || null,
        scheduleDetails: apiEvent.scheduleDetails || null,
        contractor: apiEvent.contractor || null,
        cost: apiEvent.cost || null,
        notes: apiEvent.notes
      }));
      
      dispatch(setEvents(mappedEvents));
      return { success: true, events: mappedEvents };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch calendar events');
      console.error('Error fetching calendar events:', error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, building?.buildingId, hasAttemptedFetch, isLoading, events]);

  const createEvent = useCallback(async (eventData: CreateEventData) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Creating calendar event with data:', eventData);
      
      // TODO: Replace with actual API endpoint when provided
      const response = await api.post('/api/calendar', eventData);
      const responseData = response.data;
      
      console.log('Create calendar event API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create calendar event';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Map API response to CalendarEvent interface
      const newEvent: CalendarEvent = {
        id: responseData.data.id,
        title: responseData.data.title,
        date: responseData.data.date,
        time: responseData.data.time,
        duration: responseData.data.duration,
        type: responseData.data.type,
        location: responseData.data.location,
        contact: responseData.data.contact,
        contactPhone: responseData.data.contactPhone,
        contactEmail: responseData.data.contactEmail,
        description: responseData.data.description,
        schedule: responseData.data.schedule,
        scheduleDetails: responseData.data.scheduleDetails,
        contractor: responseData.data.contractor,
        cost: responseData.data.cost,
        notes: responseData.data.notes
      };
      
      dispatch(addEvent(newEvent));
      return { success: true, event: newEvent };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to create calendar event');
      console.error('Error creating calendar event:', error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateEventById = useCallback(async (id: number, updates: Partial<CalendarEvent>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      dispatch(updateEvent({ id, updates }));
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update calendar event');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteEvent = useCallback(async (id: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      dispatch(removeEvent(id));
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to delete calendar event');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const clearAllEvents = useCallback(() => {
    dispatch(clearEvents());
    dispatch(setHasAttemptedFetch(false));
  }, [dispatch]);

  const forceRefresh = useCallback(async () => {
    dispatch(setHasAttemptedFetch(false));
    dispatch(clearEvents());
    return await fetchEvents();
  }, [dispatch, fetchEvents]);

  return {
    events,
    isLoading,
    error,
    hasAttemptedFetch,
    fetchEvents,
    createEvent,
    updateEvent: updateEventById,
    deleteEvent,
    clearAllEvents,
    forceRefresh,
  };
};

export type { CalendarEvent, CreateEventData };
