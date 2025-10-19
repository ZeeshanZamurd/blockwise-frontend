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
  folderId: number | null;
  isArchived: boolean;
  fileUrl?: string;
  filePath?: string;
}

interface DocumentsResponse {
  success: boolean;
  data?: Document[];
  error?: string;
  message?: string;
}

interface DocumentUrlResponse {
  success: boolean;
  data?: string;
  error?: string;
  message?: string;
}

interface Folder {
  id: number;
  folderName: string;
  parentFolderId: number | null;
}

interface FoldersResponse {
  success: boolean;
  data?: Folder[];
  error?: string;
  message?: string;
}

interface UpdateDocumentRequest {
  title?: string;
  category?: string;
  folderId?: number;
  expiryDate?: string;
}

interface UpdateDocumentResponse {
  success: boolean;
  data?: Document;
  error?: string;
  message?: string;
}

interface CreateFolderRequest {
  folderName: string;
}

interface CreateFolderResponse {
  success: boolean;
  data?: Folder;
  error?: string;
  message?: string;
}

interface UpdateArchiveRequest {
  isArchived: boolean;
}

interface UpdateArchiveResponse {
  success: boolean;
  data?: Document;
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

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
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

  const fetchDocuments = useCallback(async (isArchived?: boolean): Promise<DocumentsResponse> => {
    setIsLoading(true);
    
    try {
      console.log('FETCH DOCUMENTS API CALL:', { isArchived });
      
      // Build URL with query parameter if isArchived is specified
      let url = '/api/v1/document';
      if (isArchived !== undefined) {
        url += `?isArchived=${isArchived}`;
      }
      
      console.log('API URL:', url);
      
      const response = await api.get(url);
      const responseData = response.data;
      
      console.log('API Response:', responseData);
      
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
      const transformedDocuments: Document[] = (responseData.data || []).map((apiDoc: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
        id: apiDoc.id,
        title: apiDoc.title,
        category: apiDoc.category || 'General',
        type: apiDoc.type?.toUpperCase() || 'FILE',
        size: apiDoc.size || 'Unknown',
        uploadDate: apiDoc.uploadDate,
        lastModified: apiDoc.lastModified,
        uploadedBy: apiDoc.uploadedBy || 'Unknown',
        description: apiDoc.description || `Document: ${apiDoc.title}`,
        tags: apiDoc.tags || ['document'],
        status: apiDoc.status || 'Current',
        expiryDate: apiDoc.expiryDate,
        icon: FileText,
        color: 'bg-gray-100 text-gray-800',
        folderId: apiDoc.folderId,
        isArchived: apiDoc.isArchived || false,
        fileUrl: apiDoc.filePath,
        filePath: apiDoc.filePath
      }));

      const successResponse: DocumentsResponse = {
        success: true,
        data: transformedDocuments
      };

      console.log('Documents fetched successfully:', successResponse);
      return successResponse;

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
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

  const getDocumentUrl = useCallback(async (documentId: number): Promise<DocumentUrlResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Getting document URL for ID: ${documentId}`);
      const response = await api.get(`/api/v1/document/view/${documentId}`);
      const responseData = response.data;
      
      console.log(!responseData.url,'Document URL API response:', responseData.url);
      
      if(responseData.url){
        return {
          success: true,
          data: responseData.url
        };
      }
      
      const errorMessage = !responseData.url ? 'Failed to get document URL' : responseData.message;
      console.error('Document URL fetch failed:', errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };


   

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Document URL fetch error:', error);
      
      let errorMessage = 'Failed to get document URL';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFolders = useCallback(async (): Promise<FoldersResponse> => {
    setIsLoading(true);
    
    try {
      console.log('Fetching folders from API...');
      const response = await api.get('/api/v1/document/folder');
      const responseData = response.data;
      
      console.log('Folders API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to fetch folders';
        console.error('Folders fetch failed:', errorMessage);
        
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data: responseData.data || []
      };

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Folders fetch error:', error);
      
      let errorMessage = 'Failed to fetch folders';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateDocument = useCallback(async (
    documentId: number,
    updateData: UpdateDocumentRequest
  ): Promise<UpdateDocumentResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Updating document ${documentId} with data:`, updateData);
      const response = await api.put(`/api/v1/document/${documentId}`, updateData);
      const responseData = response.data;
      
      console.log('Update document API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to update document';
        console.error('Document update failed:', errorMessage);
        
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Document update error:', error);
      
      let errorMessage = 'Failed to update document';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFolder = useCallback(async (
    folderName: string
  ): Promise<CreateFolderResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Creating folder: ${folderName}`);
      const response = await api.post('/api/v1/document/folder', {
        folderName: folderName
      });
      const responseData = response.data;
      
      console.log('Create folder API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to create folder';
        console.error('Folder creation failed:', errorMessage);
        
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Folder creation error:', error);
      
      let errorMessage = 'Failed to create folder';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateArchive = useCallback(async (
    documentId: number,
    isArchived: boolean
  ): Promise<UpdateArchiveResponse> => {
    setIsLoading(true);
    
    try {
      console.log(`Updating archive status for document ${documentId} to ${isArchived}`);
      const response = await api.put(`/api/v1/document/${documentId}/archive`, {
        isArchived
      });
      const responseData = response.data;
      
      console.log('Update archive API response:', responseData);
      
      if (responseData.success === false) {
        const errorMessage = responseData.message || 'Failed to update archive status';
        console.error('Archive update failed:', errorMessage);
        
        return {
          success: false,
          error: errorMessage
        };
      }

      return {
        success: true,
        data: responseData.data
      };

    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.error('Archive update error:', error);
      
      let errorMessage = 'Failed to update archive status';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage
      };

    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    uploadDocument,
    uploadMultipleDocuments,
    fetchDocuments,
    getDocumentUrl,
    fetchFolders,
    updateDocument,
    createFolder,
    updateArchive,
    isUploading,
    uploadProgress,
    isLoading
  };
};

export default useDocument;
