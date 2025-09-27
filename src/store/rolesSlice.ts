import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Role {
  id: number;
  roleName: string;
  status: boolean;
  roleDesc: string;
  createdAt: string;
  updatedAt: string;
}

interface RolesState {
  roles: Role[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RolesState = {
  roles: [],
  isLoading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: 'roles',
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
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
      state.error = null;
    },
  },
});

export const { setLoading, setError, clearError, setRoles } = rolesSlice.actions;
export default rolesSlice.reducer;
