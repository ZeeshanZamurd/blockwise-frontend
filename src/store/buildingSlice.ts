import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  roleName: string;
}

export interface Building {
  buildingId: number;
  buildingName: string;
  buildingAddress: string;
  numberOfFlats: number;
  uniqueEmail: string;
  users: User[];
}

interface BuildingState {
  building: Building | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BuildingState = {
  building: null,
  isLoading: false,
  error: null,
};

const buildingSlice = createSlice({
  name: 'building',
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
    setBuilding: (state, action: PayloadAction<Building>) => {
      state.building = action.payload;
      state.error = null;
    },
    clearBuilding: (state) => {
      state.building = null;
      state.error = null;
    },
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setBuilding,
  clearBuilding,
} = buildingSlice.actions;

export default buildingSlice.reducer;