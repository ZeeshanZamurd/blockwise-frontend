import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CalendarEvent {
  id: number;
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

interface CalendarState {
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  hasAttemptedFetch: boolean;
}

const initialState: CalendarState = {
  events: [],
  isLoading: false,
  error: null,
  hasAttemptedFetch: false,
};

const calendarSlice = createSlice({
  name: 'calendar',
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
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<{ id: number; updates: Partial<CalendarEvent> }>) => {
      const index = state.events.findIndex(event => event.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = { ...state.events[index], ...action.payload.updates };
      }
    },
    removeEvent: (state, action: PayloadAction<number>) => {
      state.events = state.events.filter(event => event.id !== action.payload);
    },
    clearEvents: (state) => {
      state.events = [];
    },
    setHasAttemptedFetch: (state, action: PayloadAction<boolean>) => {
      state.hasAttemptedFetch = action.payload;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setEvents,
  addEvent,
  updateEvent,
  removeEvent,
  clearEvents,
  setHasAttemptedFetch,
} = calendarSlice.actions;

export default calendarSlice.reducer;
