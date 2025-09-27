import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, clearError, setRoles } from '../store/rolesSlice';
import api from '../lib/api';

export const useRoles = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { roles, isLoading, error } = useSelector((state: RootState) => state.roles);

  const fetchRoles = async () => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.get('/api/signup/roles');
      const responseData = response.data;
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch roles';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Store roles data
      dispatch(setRoles(responseData.data));
      return { success: true, roles: responseData.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch roles';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const clearRolesError = () => {
    dispatch(clearError());
  };

  return {
    roles,
    isLoading,
    error,
    fetchRoles,
    clearRolesError,
  };
};
