import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect, useState } from 'react';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, clearError, setBuilding, clearBuilding } from '../store/buildingSlice';
import { logout as logoutAction } from '../store/authSlice';
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
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

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
      // Check if it's a 403 error (token expired)
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 403) {
          console.log('Building API returned 403 - token expired, logging out user');
          // Clear auth and building data
          dispatch(logoutAction());
          dispatch(clearBuilding());
          // Redirect to login page
          window.location.href = '/auth';
          return { success: false, error: 'Token expired' };
        }
      }
      
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
      hasBuilding: !!building,
      hasAttemptedFetch
    });
    // Only fetch if we have a token, not loading, no building data, and haven't attempted fetch yet
    if (token && !isLoading && !building && !hasAttemptedFetch) {
      console.log('useBuilding: Fetching building details');
      setHasAttemptedFetch(true);
      fetchBuildingDetails();
    }
  }, [token, isLoading, building, hasAttemptedFetch]); // Depend on token, loading state, building data, and fetch attempt flag

  const clearBuildingData = () => {
    dispatch(clearBuilding());
  };

  const clearBuildingError = () => {
    dispatch(clearError());
  };

  const forceRefresh = () => {
    console.log('Force refresh building details');
    setHasAttemptedFetch(false); // Reset the attempt flag
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
