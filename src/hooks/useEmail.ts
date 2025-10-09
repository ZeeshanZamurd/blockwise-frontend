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
  // Optional fields that might be added by backend in the future
  id?: number;
  emailId?: number;
  [key: string]: any; // Allow for additional fields
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
        associatedIssues: apiEmail.associatedIssues || [],
        // Include any additional fields that might be added by backend in the future
        ...(apiEmail.id && { id: apiEmail.id }),
        ...(apiEmail.emailId && { emailId: apiEmail.emailId })
      }));

      return { success: true, emails: mappedEmails };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch emails');
      console.error('Email API error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const fetchEmailById = useCallback(async (emailId: string) => {
    console.log('fetchEmailById called with emailId:', emailId);
    try {
      console.log('Making API call to: /email/' + emailId);
      const response = await api.get(`/email/${emailId}`);
      const responseData = response.data;

      console.log('Email by ID API response received:', responseData);

      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch email';
        console.error('Email by ID API error:', errorMessage);
        return { success: false, error: errorMessage };
      }

      // Map API response to match our Email interface
      const apiEmail = responseData.data;
      console.log('Mapping single email:', apiEmail);
      
      const mappedEmail: Email = {
        messageId: apiEmail.messageId,
        inReplyTo: apiEmail.inReplyTo || '',
        fromEmail: apiEmail.fromEmail,
        toEmail: apiEmail.toEmail,
        subject: apiEmail.subject,
        bodyText: apiEmail.bodyText,
        bodyHtml: apiEmail.bodyHtml,
        summary: apiEmail.summary,
        issueCreationStatus: apiEmail.issueCreationStatus,
        associatedIssues: apiEmail.associatedIssues || [],
        // Include any additional fields that might be added by backend in the future
        ...(apiEmail.id && { id: apiEmail.id }),
        ...(apiEmail.emailId && { emailId: apiEmail.emailId })
      };
      
      console.log('Mapped email:', mappedEmail);

      return { success: true, email: mappedEmail };
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, 'Failed to fetch email');
      console.error('Email by ID API error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  return {
    fetchEmails,
    fetchEmailById,
  };
};
