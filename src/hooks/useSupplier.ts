import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../lib/api';
import { 
  setLoading, 
  setError, 
  clearError, 
  setSuppliers, 
  addSupplier, 
  updateSupplier, 
  removeSupplier, 
  clearSuppliers,
  setHasAttemptedFetch,
  Supplier 
} from '../store/suppliersSlice';
import { RootState, AppDispatch } from '../store/store';
import { useBuilding } from './useBuilding';

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

export const useSupplier = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { suppliers, isLoading, error, hasAttemptedFetch } = useSelector((state: RootState) => state.suppliers);
  const { building } = useBuilding();

  const fetchSuppliers = useCallback(async (buildingId?: number) => {
    const targetBuildingId = buildingId || building?.buildingId;
    
    if (!targetBuildingId) {
      console.warn('No building ID available for fetching suppliers');
      return { success: false, error: 'No building ID available' };
    }

    // Prevent infinite calls
    if (hasAttemptedFetch && !isLoading) {
      console.log('Suppliers already fetched, skipping API call');
      return { success: true, suppliers };
    }

    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      dispatch(setHasAttemptedFetch(true));
      
      console.log('Fetching suppliers for buildingId:', targetBuildingId);
      const response = await api.get(`/api/suppliers`);
      const responseData = response.data;
      
      console.log('Suppliers API response:', responseData);
      
      // Handle direct array response (no wrapper object)
      let suppliersData;
      if (Array.isArray(responseData)) {
        suppliersData = responseData;
      } else if (responseData.success === false && !responseData.data) {
        // Only treat as error if there's no data and success is false
        const errorMessage = responseData.message || 'Failed to fetch suppliers';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      } else {
        // Handle both success: true and success: false with data
        suppliersData = responseData.data || responseData;
      }
      
      dispatch(setSuppliers(suppliersData));
      return { success: true, suppliers: suppliersData };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch suppliers');
      console.error('Error fetching suppliers:', error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, building?.buildingId, hasAttemptedFetch, isLoading, suppliers]);

  const createSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Creating supplier with data:', supplierData);
      
      const response = await api.post('/api/suppliers', supplierData);
      const responseData = response.data;
      
      console.log('Create supplier API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create supplier';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Handle direct object response or wrapped response
      const newSupplier = responseData.data || responseData;
      dispatch(addSupplier(newSupplier));
      return { success: true, supplier: newSupplier };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to create supplier');
      console.error('Error creating supplier:', error);
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const updateSupplierById = useCallback(async (id: number, updates: Partial<Supplier>) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      dispatch(updateSupplier({ id, updates }));
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to update supplier');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const deleteSupplier = useCallback(async (id: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      dispatch(removeSupplier(id));
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to delete supplier');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const clearAllSuppliers = useCallback(() => {
    dispatch(clearSuppliers());
    dispatch(setHasAttemptedFetch(false));
  }, [dispatch]);

  const forceRefresh = useCallback(async () => {
    dispatch(setHasAttemptedFetch(false));
    dispatch(clearSuppliers());
    return await fetchSuppliers();
  }, [dispatch, fetchSuppliers]);

  return {
    suppliers,
    isLoading,
    error,
    hasAttemptedFetch,
    fetchSuppliers,
    createSupplier,
    updateSupplier: updateSupplierById,
    deleteSupplier,
    clearAllSuppliers,
    forceRefresh,
  };
};

export type { Supplier };
