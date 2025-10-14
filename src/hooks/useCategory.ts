import { useState, useCallback } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';

interface Category {
  id: number;
  name: string;
}

interface CategoryApiResponse {
  success: boolean;
  message: string;
  data: Category[];
}

const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const apiError = error as { response?: { data?: { message?: string } } };
    return apiError.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
};

export const useCategory = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching categories from API...');
      const response = await api.get('/api/suppliers/category');
      const responseData: CategoryApiResponse = response.data;
      
      console.log('Categories API response:', responseData);
      
      // Handle the API response format where success: false but data exists
      if (responseData.success === false && !responseData.data) {
        const errorMessage = responseData.message || 'Failed to fetch categories';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
      
      // If data exists, treat it as successful regardless of success flag
      if (responseData.data && Array.isArray(responseData.data)) {
        setCategories(responseData.data);
        return { success: true, categories: responseData.data };
      }
      
      const errorMessage = responseData.message || 'No categories found';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch categories');
      console.error('Error fetching categories:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories
  };
};
