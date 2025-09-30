import axios from 'axios';

// Use direct API URL for both development and production
const API_BASE_URL = 'http://51.20.85.220:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log('=== API REQUEST DEBUG ===');
    console.log('Full URL:', `${config.baseURL}${config.url}`);
    console.log('Method:', config.method);
    console.log('Headers before:', config.headers);
    console.log('Data:', config.data);
    
    // Don't add Authorization header for login/signup endpoints
    const isAuthEndpoint = config.url?.includes('/auth/login') || 
                          config.url?.includes('/signup') ||
                          config.url?.includes('/api/auth/login') ||
                          config.url?.includes('/api/signup');
    
    if (!isAuthEndpoint) {
      console.log('Adding Authorization header...');
      // Try to get token from Redux Persist storage first
      const persistedState = localStorage.getItem('persist:root');
      if (persistedState) {
        try {
          const parsedState = JSON.parse(persistedState);
          const authState = JSON.parse(parsedState.auth);
          if (authState.token) {
            config.headers.Authorization = `Bearer ${authState.token}`;
            console.log('Token added from Redux Persist:', authState.token.substring(0, 20) + '...');
          }
        } catch (error) {
          console.warn('Failed to parse persisted auth state:', error);
        }
      }
      
      // Fallback to direct localStorage token (for backward compatibility)
      const token = localStorage.getItem('authToken');
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added from localStorage:', token.substring(0, 20) + '...');
      }
    } else {
      console.log('Skipping Authorization header for auth endpoint:', config.url);
    }
    
    console.log('Final headers:', config.headers);
    console.log('=== END REQUEST DEBUG ===');
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and logout
api.interceptors.response.use(
  (response) => {
    console.log('=== API RESPONSE SUCCESS ===');
    console.log('URL:', response.config.url);
    console.log('Status:', response.status);
    console.log('Data:', response.data);
    console.log('=== END RESPONSE SUCCESS ===');
    return response;
  },
  async (error) => {
    console.log('=== API RESPONSE ERROR ===');
    console.log('URL:', error.config?.url);
    console.log('Status:', error.response?.status);
    console.log('Status Text:', error.response?.statusText);
    console.log('Error Data:', error.response?.data);
    console.log('Error Message:', error.message);
    console.log('Request Headers:', error.config?.headers);
    console.log('Request Data:', error.config?.data);
    console.log('=== END RESPONSE ERROR ===');
    
    // Only logout on auth-related endpoints or specific authentication errors
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                          error.config?.url?.includes('/auth/logout') ||
                          error.config?.url?.includes('/auth/refresh');
    
    // Check if it's a genuine authentication error
    const isAuthError = error.response?.status === 401 && 
                       (isAuthEndpoint || 
                        error.response?.data?.message?.toLowerCase().includes('token') ||
                        error.response?.data?.message?.toLowerCase().includes('unauthorized') ||
                        error.response?.data?.message?.toLowerCase().includes('authentication'));
    
    // Only logout for genuine authentication errors, not for other 401/403 errors
    if (isAuthError) {
      console.log('Authentication error detected - logging out user');
      // Clear Redux Persist storage
      localStorage.removeItem('persist:root');
      // Clear any direct token storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Redirect to auth page
      window.location.href = '/auth';
    }
    
    return Promise.reject(error);
  }
);

export default api;
