import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, clearError, setBuilding, clearBuilding } from '../store/buildingSlice';
import api from '../lib/api';

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

export const useBuilding = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { building, isLoading, error } = useSelector((state: RootState) => state.building);
  const { token } = useSelector((state: RootState) => state.auth);

  const fetchBuildingDetails = useCallback(async () => {
    console.log('fetchBuildingDetails called');
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Making API call to: /api/building/detail');
      const response = await api.get('/api/building/detail');
      const responseData = response.data;
      
      console.log('Building API response received:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch building details';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Store building data
      dispatch(setBuilding(responseData.data));
      return { success: true, building: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch building details');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch building details when hook is used and no building data exists
  useEffect(() => {
    console.log('useBuilding: Checking if should fetch building details', { 
      token: !!token, 
      isLoading, 
      hasBuilding: !!building 
    });
    // Only fetch if we have a token, not loading, and no building data
    if (token && !isLoading && !building) {
      console.log('useBuilding: Fetching building details');
      fetchBuildingDetails();
    }
  }, [token, isLoading, building]); // Depend on token, loading state, and building data

  const clearBuildingData = () => {
    dispatch(clearBuilding());
  };

  const clearBuildingError = () => {
    dispatch(clearError());
  };

  const forceRefresh = () => {
    console.log('Force refresh building details');
    dispatch(clearBuilding()); // Clear existing data first
    fetchBuildingDetails(); // Then fetch fresh data
  };

  return {
    building,
    isLoading,
    error,
    fetchBuildingDetails,
    forceRefresh,
    clearBuildingData,
    clearBuildingError,
  };
};
