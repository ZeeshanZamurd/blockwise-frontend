import { useState, useCallback } from 'react';
import api from '../lib/api';

interface Director {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleName: string;
}

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

export const useDirector = () => {
  const [isLoading, setIsLoading] = useState(false);

  const getDirectorsByBuildingId = useCallback(async (buildingId: number) => {
    try {
      setIsLoading(true);
      console.log('Fetching directors for buildingId:', buildingId);
      
      const response = await api.get(`/api/building/director/${buildingId}`);
      const responseData = response.data;
      
      console.log('Directors API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch directors';
        return { success: false, error: errorMessage };
      }
      
      return { success: true, directors: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch directors');
      console.error('Error fetching directors:', error);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getDirectorsByBuildingId,
    isLoading,
  };
};
