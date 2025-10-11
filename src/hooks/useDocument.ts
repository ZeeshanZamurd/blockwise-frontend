import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { FileText } from 'lucide-react';

interface DocumentUploadResponse {
  success: boolean;
  data?: {
    id: number;
    title: string;
    category: string | null;
    type: string;
    size: string | null;
    uploadedBy: string;
    description: string | null;
    tags: string[] | null;
    status: string;
    folder: string;
    filePath: string;
    uploadDate: string;
    lastModified: string;
    expiryDate: string | null;
  };
  error?: string;
  message?: string;
}

interface DocumentUploadOptions {
  onSuccess?: (response: DocumentUploadResponse) => void;
  onError?: (error: string) => void;
}

interface Document {
  id: number;
  title: string;
  category: string | null;
  type: string;
  size: string | null;
  uploadDate: string;
  lastModified: string;
  uploadedBy: string;
  description: string | null;
  tags: string[] | null;
  status: string;
  expiryDate: string | null;
  icon: React.ElementType;
  color: string;
  folderId: string | null;
  archived: boolean;
  fileUrl?: string;
  filePath?: string;
}

interface DocumentsResponse {
  success: boolean;
  data?: Document[];
  error?: string;
  message?: string;
}

export const useDocument = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const uploadDocument = useCallback(async (
    file: File,
    options?: DocumentUploadOptions
  ): Promise<DocumentUploadResponse> => {
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('file', file);

      console.log('Uploading document:', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

      // Make API call with progress tracking
      const response = await api.post('/api/v1/document', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        },
      });

      const responseData = response.data;
      console.log('Document upload response:', responseData);

      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to upload document';
        console.error('Document upload failed:', errorMessage);
        
        const errorResponse: DocumentUploadResponse = {
          success: false,
          error: errorMessage
        };

        options?.onError?.(errorMessage);
        return errorResponse;
      }

      // Success response
      const successResponse: DocumentUploadResponse = {
        success: true,
        data: responseData.data
      };

      console.log('Document uploaded successfully:', successResponse);
      options?.onSuccess?.(successResponse);
      return successResponse;

    } catch (error: any) {
      console.error('Document upload error:', error);
      
      let errorMessage = 'Failed to upload document';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorResponse: DocumentUploadResponse = {
        success: false,
        error: errorMessage
      };

      options?.onError?.(errorMessage);
      return errorResponse;

    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const uploadMultipleDocuments = useCallback(async (
    files: File[],
    options?: DocumentUploadOptions
  ): Promise<DocumentUploadResponse[]> => {
    console.log(`Uploading ${files.length} documents...`);
    
    const uploadPromises = files.map(file => uploadDocument(file, options));
    const results = await Promise.allSettled(uploadPromises);
    
    return results.map(result => 
      result.status === 'fulfilled' 
        ? result.value 
        : { success: false, error: 'Upload failed' }
    );
  }, [uploadDocument]);

  const fetchDocuments = useCallback(async (): Promise<DocumentsResponse> => {
    setIsLoading(true);
    
    try {
      console.log('Fetching documents from API...');
      const response = await api.get('/api/v1/document');
      const responseData = response.data;
      
      console.log('Documents API response:', responseData);
      
      // Check if the API response indicates success
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch documents';
        console.error('Documents fetch failed:', errorMessage);
        
        const errorResponse: DocumentsResponse = {
          success: false,
          error: errorMessage
        };
        
        return errorResponse;
      }

      // Transform API data to match our Document interface
      const transformedDocuments: Document[] = (responseData.data || []).map((apiDoc: any) => ({
        id: apiDoc.id,
        title: apiDoc.title,
        category: apiDoc.category || 'General',
        type: apiDoc.type?.toUpperCase() || 'FILE',
        size: apiDoc.size || 'Unknown',
        uploadDate: new Date(apiDoc.uploadDate).toLocaleDateString(),
        lastModified: new Date(apiDoc.lastModified).toLocaleDateString(),
        uploadedBy: apiDoc.uploadedBy || 'Unknown',
        description: apiDoc.description || `Document: ${apiDoc.title}`,
        tags: apiDoc.tags || ['document'],
        status: apiDoc.status || 'Current',
        expiryDate: apiDoc.expiryDate,
        icon: FileText,
        color: 'bg-gray-100 text-gray-800',
        folderId: null,
        archived: false,
        fileUrl: apiDoc.filePath,
        filePath: apiDoc.filePath
      }));

      const successResponse: DocumentsResponse = {
        success: true,
        data: transformedDocuments
      };

      console.log('Documents fetched successfully:', successResponse);
      return successResponse;

    } catch (error: any) {
      console.error('Documents fetch error:', error);
      
      let errorMessage = 'Failed to fetch documents';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      const errorResponse: DocumentsResponse = {
        success: false,
        error: errorMessage
      };

      return errorResponse;

    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    uploadDocument,
    uploadMultipleDocuments,
    fetchDocuments,
    isUploading,
    uploadProgress,
    isLoading
  };
};

export default useDocument;
