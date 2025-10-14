import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AnnualBudgetResponse {
  year: number;
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
}

interface FinanceApiResponse {
  success: boolean;
  data?: AnnualBudgetResponse;
  error?: string;
  message?: string;
}

interface YearsApiResponse {
  success: boolean;
  data?: string[];
  error?: string;
  message?: string;
}

export const useFinance = () => {
  const [isLoading, setIsLoading] = useState(false);

  const fetchAnnualBudget = useCallback(async (
    year: string
  ): Promise<FinanceApiResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Fetching annual budget for year: ${year}`);
      const response = await api.get(`/api/finance/annual/${year}`);
      const responseData = response.data;
      
      console.log('Annual budget API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch annual budget';
        console.error('Annual budget fetch failed:', errorMessage);
        
        const errorResponse: FinanceApiResponse = {
          success: false,
          error: errorMessage
        };
        
        return errorResponse;
      }

      // Success response
      const successResponse: FinanceApiResponse = {
        success: true,
        data: responseData.data || {
          year: parseInt(year),
          totalBudget: 0,
          totalExpenses: 0,
          remainingBudget: 0
        }
      };

      console.log('Annual budget fetched successfully:', successResponse);
      return successResponse;

    } catch (error: unknown) {
      console.error('Annual budget fetch error:', error);
      
      let errorMessage = 'Failed to fetch annual budget';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as { message: string };
        errorMessage = messageError.message;
      }

      const errorResponse: FinanceApiResponse = {
        success: false,
        error: errorMessage
      };

      return errorResponse;

    } finally {
      setIsLoading(false);
    }
  }, []);

  const createAnnualBudget = useCallback(async (
    year: string,
    budget: number
  ): Promise<FinanceApiResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Creating annual budget for year: ${year} with budget: ${budget}`);
      const response = await api.post(`/api/finance/annual/${year}`, {
        budget: budget
      });
      const responseData = response.data;
      
      console.log('Create annual budget API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create annual budget';
        console.error('Create annual budget failed:', errorMessage);
        
        const errorResponse: FinanceApiResponse = {
          success: false,
          error: errorMessage
        };
        
        return errorResponse;
      }

      // Success response
      const successResponse: FinanceApiResponse = {
        success: true,
        data: responseData.data || {
          year: parseInt(year),
          totalBudget: budget,
          totalExpenses: 0,
          remainingBudget: budget
        }
      };

      console.log('Annual budget created successfully:', successResponse);
      return successResponse;

    } catch (error: unknown) {
      console.error('Create annual budget error:', error);
      
      let errorMessage = 'Failed to create annual budget';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as { message: string };
        errorMessage = messageError.message;
      }

      const errorResponse: FinanceApiResponse = {
        success: false,
        error: errorMessage
      };

      return errorResponse;

    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAvailableYears = useCallback(async (): Promise<YearsApiResponse> => {
    setIsLoading(true);
    
    try {
      console.log('Fetching available years');
      const response = await api.get('/api/finance/years');
      const responseData = response.data;
      
      console.log('Available years API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch available years';
        console.error('Available years fetch failed:', errorMessage);
        
        const errorResponse: YearsApiResponse = {
          success: false,
          error: errorMessage
        };
        
        return errorResponse;
      }

      // Success response
      const successResponse: YearsApiResponse = {
        success: true,
        data: responseData.data || []
      };

      console.log('Available years fetched successfully:', successResponse);
      return successResponse;

    } catch (error: unknown) {
      console.error('Available years fetch error:', error);
      
      let errorMessage = 'Failed to fetch available years';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as { message: string };
        errorMessage = messageError.message;
      }

      const errorResponse: YearsApiResponse = {
        success: false,
        error: errorMessage
      };

      return errorResponse;

    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    fetchAnnualBudget,
    createAnnualBudget,
    fetchAvailableYears,
    isLoading
  };
};

export default useFinance;
