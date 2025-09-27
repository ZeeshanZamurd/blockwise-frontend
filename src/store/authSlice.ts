import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  regBuilding: boolean;
  roleName: string;
  buildingId?: number;
  buildingName?: string;
  uniqueBuildingEmail?: string;
  userName?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
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
    setAuth: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError, setAuth, logout } = authSlice.actions;
export default authSlice.reducer;
