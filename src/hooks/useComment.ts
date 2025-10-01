import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store/store';
import api from '../lib/api';

interface Comment {
  id: number;
  directorId: number;
  directorName?: string;
  directorUsername?: string;
  comment: string;
  createdDate?: string;
  issueId: number;
}

interface PostCommentData {
  issueId: number;
  directorId: number;
  comment: string;
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

export const useComment = () => {
  const dispatch = useDispatch<AppDispatch>();

  const postComment = useCallback(async (commentData: PostCommentData) => {
    try {
      console.log('Posting comment:', commentData);
      
      const response = await api.post('/api/director', commentData);
      const responseData = response.data;
      
      console.log('Comment API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to post comment';
        return { success: false, error: errorMessage };
      }
      
      return { success: true, comment: responseData.data };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to post comment');
      console.error('Error posting comment:', error);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    postComment,
  };
};
