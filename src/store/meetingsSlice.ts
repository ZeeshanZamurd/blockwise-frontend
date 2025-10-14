import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Meeting {
  id: number;
  title: string;
  type: string;
  date: string | null;
  time: string | null;
  attendees: string[] | null;
  status: string;
  transcript: string | null;
  videoUrl: string | null;
  notes: string | null;
  documentId: number | null;
}

interface MeetingsState {
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;
}

const initialState: MeetingsState = {
  meetings: [],
  isLoading: false,
  error: null,
};

const meetingsSlice = createSlice({
  name: 'meetings',
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
    setMeetings: (state, action: PayloadAction<Meeting[]>) => {
      state.meetings = action.payload;
    },
    addMeeting: (state, action: PayloadAction<Meeting>) => {
      state.meetings.push(action.payload);
    },
    updateMeeting: (state, action: PayloadAction<{ id: number; updates: Partial<Meeting> }>) => {
      const index = state.meetings.findIndex(meeting => meeting.id === action.payload.id);
      if (index !== -1) {
        state.meetings[index] = { ...state.meetings[index], ...action.payload.updates };
      }
    },
    removeMeeting: (state, action: PayloadAction<number>) => {
      state.meetings = state.meetings.filter(meeting => meeting.id !== action.payload);
    },
    clearMeetings: (state) => {
      state.meetings = [];
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setMeetings,
  addMeeting,
  updateMeeting,
  removeMeeting,
  clearMeetings,
} = meetingsSlice.actions;

export default meetingsSlice.reducer;
