import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface AnnualBudgetResponse {
  id: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageSpent: number;
  monthlyExpenses: unknown;
}

interface FinanceApiResponse {
  success: boolean;
  data?: AnnualBudgetResponse;
  error?: string;
  message?: string;
}

interface MonthlyExpenseItem {
  id: number;
  category: string;
  itemName: string;
  description: string;
  amount: number;
}

interface MonthlyExpense {
  id: number;
  month: string;
  totalSpent: number;
  totalItems: number;
  items: MonthlyExpenseItem[];
}

interface MonthlyFinanceResponse {
  id: number;
  year: number;
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  percentageSpent: number | null;
  monthlyExpenses: MonthlyExpense[];
}

interface MonthlyFinanceApiResponse {
  success: boolean;
  data?: MonthlyFinanceResponse;
  error?: string;
  message?: string;
}

interface SaveLineItemRequest {
  itemName: string;
  category?: string;
  description: string;
  amount: number;
}

interface SaveLineItemResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

interface UpdateLineItemRequest {
  itemName: string;
  category: string;
  description: string;
  amount: number;
}

interface UpdateLineItemResponse {
  success: boolean;
  data?: unknown;
  error?: string;
  message?: string;
}

interface YearData {
  financeId: number;
  year: number;
}

interface YearsApiResponse {
  success: boolean;
  data?: YearData[];
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
          id: 0,
          year: parseInt(year),
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          percentageSpent: 0,
          monthlyExpenses: null
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
          id: 0,
          year: parseInt(year),
          totalBudget: budget,
          totalSpent: 0,
          remainingBudget: budget,
          percentageSpent: 0,
          monthlyExpenses: null
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

  const updateAnnualBudget = useCallback(async (
    year: string,
    budget: number
  ): Promise<FinanceApiResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Updating annual budget for year: ${year} with budget: ${budget}`);
      const response = await api.put(`/api/finance/annual/${year}?budget=${budget}`);
      const responseData = response.data;
      
      console.log('Update annual budget API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to update annual budget';
        console.error('Update annual budget failed:', errorMessage);
        
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
          id: 0,
          year: parseInt(year),
          totalBudget: budget,
          totalSpent: responseData.data?.totalSpent || 0,
          remainingBudget: responseData.data?.remainingBudget || budget,
          percentageSpent: responseData.data?.percentageSpent || 0,
          monthlyExpenses: responseData.data?.monthlyExpenses || null
        }
      };

      console.log('Annual budget updated successfully:', successResponse);
      return successResponse;

    } catch (error: unknown) {
      console.error('Update annual budget error:', error);
      
      let errorMessage = 'Failed to update annual budget';
      
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

  const fetchMonthlyFinance = useCallback(async (
    year: string
  ): Promise<MonthlyFinanceApiResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Fetching monthly finance for year: ${year}`);
      const response = await api.get(`/api/finance/monthly/${year}`);
      const responseData = response.data;
      
      console.log('Monthly finance API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch monthly finance';
        console.error('Monthly finance fetch failed:', errorMessage);
        
        const errorResponse: MonthlyFinanceApiResponse = {
          success: false,
          error: errorMessage
        };
        
        return errorResponse;
      }

      // Success response
      const successResponse: MonthlyFinanceApiResponse = {
        success: true,
        data: responseData.data || {
          id: 0,
          year: parseInt(year),
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
          percentageSpent: null,
          monthlyExpenses: []
        }
      };

      console.log('Monthly finance fetched successfully:', successResponse);
      return successResponse;

    } catch (error: unknown) {
      console.error('Monthly finance fetch error:', error);
      
      let errorMessage = 'Failed to fetch monthly finance';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as { message: string };
        errorMessage = messageError.message;
      }

      const errorResponse: MonthlyFinanceApiResponse = {
        success: false,
        error: errorMessage
      };

      return errorResponse;

    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveLineItem = useCallback(async (
    financeId: number,
    monthId: string,
    lineItemsData: SaveLineItemRequest[]
  ): Promise<SaveLineItemResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Saving line items for financeId: ${financeId}, monthId: ${monthId}`, lineItemsData);
      const response = await api.post(`/api/finance/${financeId}/items/${monthId}`, lineItemsData);
      const responseData = response.data;
      
      console.log('Save line items API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to save line items';
        console.error('Save line items failed:', errorMessage);
        
        const errorResponse: SaveLineItemResponse = {
          success: false,
          error: errorMessage
        };
        
        return errorResponse;
      }

      // Success response
      const successResponse: SaveLineItemResponse = {
        success: true,
        data: responseData.data
      };

      console.log('Line items saved successfully:', successResponse);
      return successResponse;

    } catch (error: unknown) {
      console.error('Save line items error:', error);
      
      let errorMessage = 'Failed to save line items';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const apiError = error as { response?: { data?: { message?: string } } };
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        const messageError = error as { message: string };
        errorMessage = messageError.message;
      }

      const errorResponse: SaveLineItemResponse = {
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
    updateAnnualBudget,
    fetchMonthlyFinance,
    saveLineItem,
    fetchAvailableYears,
    isLoading
  };
};

export default useFinance;
