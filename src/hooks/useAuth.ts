import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, clearError, setAuth, logout } from '../store/authSlice';
import api from '../lib/api';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      dispatch(setAuth({ user, token }));
      return { success: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const signup = async (email: string, password: string, firstName: string, lastName: string, roleId: number = 1) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const signupData = { email, password, firstName, lastName, roleId };
      const response = await api.post('/api/signup/user', signupData);
      const responseData = response.data;
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Signup failed';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Store user data from signup response
      dispatch(setAuth({ user: responseData.data, token: null }));
      return { success: true, userData: responseData.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Signup failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const createBuilding = async (buildingName: string, buildingAddress: string, numberOfFlats: number) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const buildingData = {
        userId: user?.userId,
        buildingName,
        buildingAddress,
        numberOfFlats
      };
      
      const response = await api.post('api/signup/building/create', buildingData);
      const responseData = response.data;
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Building creation failed';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      // Store updated user data and token from building creation response
      const { data } = responseData;
      const updatedUser = {
        userId: data.userId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        regBuilding: true,
        roleName: data.roleName,
        buildingId: data.buildingId,
        buildingName: data.buildingName,
        uniqueBuildingEmail: data.uniqueBuildingEmail,
        userName: data.userName
      };
      
      dispatch(setAuth({ user: updatedUser, token: data.accessToken }));
      return { success: true, buildingData: data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Building creation failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const inviteDirectors = async (invitedEmails: string[]) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      const inviteData = {
        buildingId: user?.buildingId,
        invitedEmails
      };
      
      const response = await api.post('/api/signup/building/invite', inviteData);
      const responseData = response.data;
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Invite failed';
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
      
      return { success: true, inviteData: responseData.data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invite failed';
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Ignore logout API errors
    } finally {
      dispatch(logout());
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    token,
    isLoading,
    error,
    login,
    signup,
    createBuilding,
    inviteDirectors,
    logout,
    clearAuthError,
    isAuthenticated: !!token,
  };
};
