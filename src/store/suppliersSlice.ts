import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Supplier {
  id: number;
  name: string;
  category: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  rating: number;
  lastService: string;
  nextService: string;
  status: string;
  services: string[];
  notes: string;
  totalJobs: number;
  description: string;
}

interface SuppliersState {
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;
  hasAttemptedFetch: boolean;
}

const initialState: SuppliersState = {
  suppliers: [],
  isLoading: false,
  error: null,
  hasAttemptedFetch: false,
};

const suppliersSlice = createSlice({
  name: 'suppliers',
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
    setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
      state.suppliers = action.payload;
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload);
    },
    updateSupplier: (state, action: PayloadAction<{ id: number; updates: Partial<Supplier> }>) => {
      const index = state.suppliers.findIndex(supplier => supplier.id === action.payload.id);
      if (index !== -1) {
        state.suppliers[index] = { ...state.suppliers[index], ...action.payload.updates };
      }
    },
    removeSupplier: (state, action: PayloadAction<number>) => {
      state.suppliers = state.suppliers.filter(supplier => supplier.id !== action.payload);
    },
    clearSuppliers: (state) => {
      state.suppliers = [];
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
  setSuppliers,
  addSupplier,
  updateSupplier,
  removeSupplier,
  clearSuppliers,
  setHasAttemptedFetch,
} = suppliersSlice.actions;

export default suppliersSlice.reducer;
