import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setLoading, setError, clearError, setAuth, logout as logoutAction } from '../store/authSlice';
import { clearBuilding } from '../store/buildingSlice';
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

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isLoading, error } = useSelector((state: RootState) => state.auth);

  const login = async (email: string, password: string) => {
    try {
      dispatch(setLoading(true));
      dispatch(clearError());
      
      console.log('Attempting login with email:', email);
      const response = await api.post('/api/auth/login', { email, password });
      const responseData = response.data;
      
      console.log('Login API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.token && !responseData.error) {
        // Successful login - extract user info from JWT token
        try {
          // Decode JWT token to get user information
          const tokenPayload = JSON.parse(atob(responseData.token.split('.')[1]));
          console.log('Decoded token payload:', tokenPayload);
          
          const user = {
            userId: tokenPayload.userId || 14,
            firstName: tokenPayload.firstName || 'User',
            lastName: tokenPayload.lastName || 'Name',
            email: tokenPayload.sub || email,
            regBuilding: tokenPayload.buildingId ? true : false,
            roleName: tokenPayload.role || 'USER',
            buildingId: tokenPayload.buildingId,
            buildingName: tokenPayload.buildingName,
            uniqueBuildingEmail: tokenPayload.buildingEmail,
            userName: tokenPayload.username
          };
          
          dispatch(setAuth({ user, token: responseData.token }));
          console.log('Login successful with user:', user);
          return { success: true };
        } catch (tokenError) {
          console.error('Error decoding token:', tokenError);
          // Fallback to basic user object
          const user = {
            userId: 14,
            firstName: 'User',
            lastName: 'Name',
            email: email,
            regBuilding: false,
            roleName: 'USER'
          };
          dispatch(setAuth({ user, token: responseData.token }));
          console.log('Login successful with fallback user');
          return { success: true };
        }
      } else if (responseData.error) {
        // API returned an error message
        const errorMessage = responseData.error || 'Invalid email or password';
        console.log('Login failed with error:', errorMessage);
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      } else {
        // Unexpected response format
        const errorMessage = 'Invalid response from server';
        console.log('Unexpected login response format:', responseData);
        dispatch(setError(errorMessage));
        return { success: false, error: errorMessage };
      }
    } catch (error: unknown) {
      console.error('Login error:', error);
      const errorMessage = getErrorMessage(error, 'Login failed');
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Signup failed');
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Building creation failed');
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
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Invite failed');
      dispatch(setError(errorMessage));
      return { success: false, error: errorMessage };
    } finally {
      dispatch(setLoading(false));
    }
  };

  const logout = () => {
    // Clear auth data
    dispatch(logoutAction());
    // Clear building data to prevent showing previous account's data
    dispatch(clearBuilding());
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
