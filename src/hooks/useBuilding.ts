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

  // Auto-fetch building details when hook is used and no building data exists
  useEffect(() => {
    if (!building && !isLoading) {
      console.log('useBuilding: Auto-fetching building details');
      fetchBuildingDetails();
    }
  }, [building, isLoading, fetchBuildingDetails]);

  const clearBuildingData = () => {
    dispatch(clearBuilding());
  };

  const clearBuildingError = () => {
    dispatch(clearError());
  };

  return {
    building,
    isLoading,
    error,
    fetchBuildingDetails,
    clearBuildingData,
    clearBuildingError,
  };
};
