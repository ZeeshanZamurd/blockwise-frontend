import axios from 'axios';

// Use relative URL in development (with proxy) or absolute URL in production
const API_BASE_URL = import.meta.env.DEV ? '' : 'http://51.20.85.220:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from Redux Persist storage first
    const persistedState = localStorage.getItem('persist:root');
    if (persistedState) {
      try {
        const parsedState = JSON.parse(persistedState);
        const authState = JSON.parse(parsedState.auth);
        if (authState.token) {
          config.headers.Authorization = `Bearer ${authState.token}`;
        }
      } catch (error) {
        console.warn('Failed to parse persisted auth state:', error);
      }
    }
    
    // Fallback to direct localStorage token (for backward compatibility)
    const token = localStorage.getItem('authToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh and logout
api.interceptors.response.use(
  (response) => response,
  async (error) => {
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
