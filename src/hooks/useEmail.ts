import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { RootState, AppDispatch } from '../store/store';
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

export interface Email {
  messageId: string;
  inReplyTo: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml: string;
  summary: string;
  issueCreationStatus: string | null;
  associatedIssues: {
    id: number;
    issueName: string;
    issueDesc: string;
    issueCategory: string;
    issueStatus: string;
    issuePriority: string;
    createdDate: string;
  }[];
}

export const useEmail = () => {
  const dispatch = useDispatch<AppDispatch>();

  const fetchEmails = useCallback(async () => {
    console.log('fetchEmails called');
    try {
      console.log('Making API call to: /email');
      const response = await api.get('/email');
      const responseData = response.data;

      console.log('Email API response received:', responseData);

      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch emails';
        console.error('Email API error:', errorMessage);
        return { success: false, error: errorMessage };
      }

      // Map API response to match our Email interface
      const mappedEmails: Email[] = responseData.data.map((apiEmail: any) => ({
        messageId: apiEmail.messageId,
        inReplyTo: apiEmail.inReplyTo || '',
        fromEmail: apiEmail.fromEmail,
        toEmail: apiEmail.toEmail,
        subject: apiEmail.subject,
        bodyText: apiEmail.bodyText,
        bodyHtml: apiEmail.bodyHtml,
        summary: apiEmail.summary,
        issueCreationStatus: apiEmail.issueCreationStatus,
        associatedIssues: apiEmail.associatedIssues || []
      }));

      return { success: true, emails: mappedEmails };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch emails');
      console.error('Email API error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    fetchEmails,
  };
};
