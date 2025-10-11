
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileText, Search, Download, Eye, Calendar, User, Upload, Plus, Shield, Building, AlertTriangle, FileCheck, Edit, Grid, List, Folder, Archive, RefreshCw } from 'lucide-react';
import { useDocument } from '@/hooks/useDocument';
import { toast } from 'sonner';

interface DocumentVaultProps {
  emptyDataMode?: boolean;
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

const DocumentVault = ({ emptyDataMode }: DocumentVaultProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [tempExpiryDate, setTempExpiryDate] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const { uploadDocument, uploadMultipleDocuments, fetchDocuments, isUploading, uploadProgress, isLoading } = useDocument();

  // Initialize with empty array - will be populated from API
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([
    { id: 'f-fire', name: 'Fire Safety' },
  ]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  // Fetch documents from API on component mount
  useEffect(() => {
    const loadDocuments = async () => {
      if (!emptyDataMode) {
        console.log('Loading documents from API...');
        const result = await fetchDocuments();
        if (result.success && result.data) {
          console.log('Documents loaded successfully:', result.data);
          setDocuments(result.data);
        } else {
          console.error('Failed to load documents:', result.error);
          toast.error(`Failed to load documents: ${result.error}`);
        }
      }
    };
    
    loadDocuments();
  }, [emptyDataMode, fetchDocuments]);

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const id = crypto.randomUUID ? crypto.randomUUID() : `f-${Date.now()}`;
    setFolders((prev) => [...prev, { id, name }]);
    setNewFolderName('');
  };

  const handleRenameFolder = (id: string, name: string) => {
    setFolders((prev) => prev.map((f) => (f.id === id ? { ...f, name } : f)));
  };

  const handleMoveDocument = (docId: number, folderId: string | null) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, folderId } : d)));
  };

  const handleToggleArchive = (docId: number, force?: boolean) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, archived: force !== undefined ? force : !d.archived } : d)));
  };

  const handleTitleSave = (docId: number) => {
    setDocuments((prev) => prev.map((d) => (d.id === docId ? { ...d, title: tempTitle } : d)));
    setEditingTitleId(null);
    setTempTitle('');
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    switch (category.toLowerCase()) {
      case 'legal': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-red-100 text-red-800';
      case 'safety': return 'bg-green-100 text-green-800';
      case 'insurance': return 'bg-indigo-100 text-indigo-800';
      case 'plans': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'current': return 'bg-green-100 text-green-800';
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expiring soon': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

const filteredDocuments = documents
    .filter((doc) => (activeFolderId ? doc.folderId === activeFolderId : true))
    .filter((doc) => (showArchived ? true : !doc.archived))
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.category && doc.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.tags && doc.tags.length > 0 && doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

  const getDaysUntilExpiry = (expiryDate: string | null) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleExpiryEdit = (documentId: string, currentDate: string | null) => {
    setEditingExpiry(documentId);
    setTempExpiryDate(currentDate || '');
  };

  const handleExpirySave = (documentId: string) => {
    // In a real app, this would update the database
    console.log(`Updated expiry date for document ${documentId} to ${tempExpiryDate}`);
    setEditingExpiry(null);
    setTempExpiryDate('');
  };

  // Certificate stats for summary cards
  const getCertificateStats = () => {
    const certificateDocuments = documents.filter(doc => 
      doc.category.toLowerCase() === 'compliance' || 
      doc.category.toLowerCase() === 'safety'
    );
    
    const now = new Date();
    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setMonth(now.getMonth() + 6);
    const twelveMonthsFromNow = new Date();
    twelveMonthsFromNow.setMonth(now.getMonth() + 12);
    
    let valid = 0;
    let expired = 0;
    let expiringSoon = 0;
    
    certificateDocuments.forEach(doc => {
      if (!doc.expiryDate) {
        valid++; // Documents without expiry are considered valid
        return;
      }
      
      const expiryDate = new Date(doc.expiryDate);
      if (expiryDate < now) {
        expired++;
      } else if (expiryDate <= twelveMonthsFromNow) {
        expiringSoon++;
      } else {
        valid++;
      }
    });
    
    return { valid, expired, expiringSoon, total: certificateDocuments.length };
  };

  const certificateStats = getCertificateStats();

  const handleFileUpload = async (file: File) => {
    try {
      const result = await uploadDocument(file, {
        onSuccess: async (response) => {
          console.log('Document uploaded successfully:', response);
          toast.success(`Document "${file.name}" uploaded successfully!`);
          
          // Refresh the documents list from API
          const result = await fetchDocuments();
          if (result.success && result.data) {
            setDocuments(result.data);
          }
        },
        onError: (error) => {
          console.error('Document upload failed:', error);
          toast.error(`Failed to upload document: ${error}`);
        }
      });

      return result;
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('An error occurred during upload');
    }
  };

  const handleMultipleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    try {
      const results = await uploadMultipleDocuments(fileArray, {
        onSuccess: async (response) => {
          console.log('Multiple documents uploaded successfully:', response);
          toast.success(`${fileArray.length} documents uploaded successfully!`);
          
          // Refresh the documents list from API
          const result = await fetchDocuments();
          if (result.success && result.data) {
            setDocuments(result.data);
          }
        },
        onError: (error) => {
          console.error('Multiple document upload failed:', error);
          toast.error(`Failed to upload documents: ${error}`);
        }
      });

      return results;
    } catch (error) {
      console.error('Multiple upload error:', error);
      toast.error('An error occurred during upload');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Certificate Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valid Certificates</CardTitle>
            <FileCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{certificateStats.valid}</div>
            <p className="text-xs text-muted-foreground">
              {certificateStats.total > 0 ? ((certificateStats.valid / certificateStats.total) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{certificateStats.expiringSoon}</div>
            <p className="text-xs text-muted-foreground">
              Within 6-12 months
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{certificateStats.expired}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Document Vault</h2>
          <p className="text-gray-600">Secure storage for all building-related documents</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            onClick={async () => {
              console.log('Manual refresh triggered');
              const result = await fetchDocuments();
              if (result.success && result.data) {
                setDocuments(result.data);
                toast.success('Documents refreshed successfully!');
              } else {
                toast.error(`Failed to refresh documents: ${result.error}`);
              }
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              // Create file input element
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files && files.length > 0) {
                  console.log('Files selected:', files);
                  if (files.length === 1) {
                    handleFileUpload(files[0]);
                  } else {
                    handleMultipleFileUpload(files);
                  }
                }
              };
              input.click();
            }}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading... ({uploadProgress}%)
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Upload Progress Indicator */}
      {isUploading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div className="flex-1">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Uploading document...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simple Folder Organization */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Organize Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Folder</label>
              <Select value={activeFolderId ?? 'all'} onValueChange={(v) => setActiveFolderId(v === 'all' ? null : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Documents" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  <SelectItem value="all">All Documents</SelectItem>
                  {folders.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Actions</label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const name = prompt('Enter folder name:');
                    if (name?.trim()) {
                      setNewFolderName(name.trim());
                      handleCreateFolder();
                    }
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Folder
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Show</label>
              <div className="flex items-center gap-2">
                <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                <label htmlFor="show-archived" className="text-sm">Archived</label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Folder Overview Cards */}
      {folders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Folder Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  activeFolderId === null ? 'bg-primary/10 border-primary' : 'bg-muted/50 hover:bg-muted/70'
                }`}
                onClick={() => setActiveFolderId(null)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="h-5 w-5 text-primary" />
                  <span className="font-medium">All Documents</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {documents.filter(doc => !doc.archived).length} documents
                </p>
              </div>
              {folders.map((folder) => {
                const folderDocs = documents.filter(doc => doc.folderId === folder.id && !doc.archived);
                return (
                  <div 
                    key={folder.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      activeFolderId === folder.id ? 'bg-primary/10 border-primary' : 'bg-muted/50 hover:bg-muted/70'
                    }`}
                    onClick={() => setActiveFolderId(folder.id)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Folder className="h-5 w-5 text-primary" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {folderDocs.length} documents
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-gray-600">Loading documents...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents View */}
      {!isLoading && viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => {
            const Icon = document.icon;
            const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
            
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDocument(document)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${document.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{document.title}</CardTitle>
                        <Badge className={getCategoryColor(document.category)} variant="outline">
                          {document.category || 'General'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 line-clamp-2">{document.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{document.type}</span>
                      <span>{document.size}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                      {daysUntilExpiry !== null && (
                        <div className="flex items-center space-x-1">
                          <span className={`text-xs ${daysUntilExpiry < 30 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpiryEdit(document.id.toString(), document.expiryDate);
                            }}
                            className="h-4 w-4 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      <div>Uploaded: {document.uploadDate}</div>
                      <div>By: {document.uploadedBy}</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !isLoading ? (
        <div className="space-y-2">
          {filteredDocuments.map((document) => {
            const Icon = document.icon;
            const daysUntilExpiry = getDaysUntilExpiry(document.expiryDate);
            
            return (
              <Card key={document.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedDocument(document)}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${document.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{document.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{document.type}</span>
                          <span>•</span>
                          <span>{document.size}</span>
                          <span>•</span>
                          <span>Uploaded: {document.uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getCategoryColor(document.category)} variant="outline">
                        {document.category || 'General'}
                      </Badge>
                      <Badge className={getStatusColor(document.status)}>
                        {document.status}
                      </Badge>
                       {daysUntilExpiry !== null && (
                         <div className="text-xs text-gray-500">
                           <span>Expiry: {document.expiryDate}</span>
                           <span className={`ml-2 ${daysUntilExpiry < 30 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                             • {daysUntilExpiry < 0 ? 'Expired' : `${daysUntilExpiry} days left`}
                           </span>
                         </div>
                       )}
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : null}

      {/* Document Details Modal */}
      {selectedDocument && (
        <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <selectedDocument.icon className="h-5 w-5" />
                  {editingTitleId === selectedDocument.id.toString() ? (
                    <div className="flex items-center gap-2">
                      <Input value={tempTitle} onChange={(e) => setTempTitle(e.target.value)} className="h-8 w-64" />
                      <Button size="sm" variant="outline" onClick={() => handleTitleSave(selectedDocument.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingTitleId(null); setTempTitle(''); }}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span>{selectedDocument.title}</span>
                      <Button variant="ghost" size="sm" className="h-6" onClick={() => { setEditingTitleId(selectedDocument.id.toString()); setTempTitle(selectedDocument.title); }}>
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Folder className="h-4 w-4 text-gray-400" />
                    <Select value={selectedDocument.folderId ?? 'none'} onValueChange={(v) => handleMoveDocument(selectedDocument.id, v === 'none' ? null : v)}>
                      <SelectTrigger className="h-8 w-40">
                        <SelectValue placeholder="Assign folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No folder</SelectItem>
                        {folders.map((f) => (
                          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleToggleArchive(selectedDocument.id, !selectedDocument.archived)}>
                    <Archive className="h-4 w-4 mr-1" />
                    {selectedDocument.archived ? 'Unarchive' : 'Archive'}
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Document Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Type:</span>
                        <span>{selectedDocument.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Size:</span>
                        <span>{selectedDocument.size}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <Badge className={getCategoryColor(selectedDocument.category)} variant="outline">
                          {selectedDocument.category || 'General'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge className={getStatusColor(selectedDocument.status)}>
                          {selectedDocument.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dates</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Uploaded: {selectedDocument.uploadDate}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span>By: {selectedDocument.uploadedBy}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {editingExpiry === selectedDocument.id.toString() ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type="date"
                              value={tempExpiryDate}
                              onChange={(e) => setTempExpiryDate(e.target.value)}
                              className="h-6 text-xs"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExpirySave(selectedDocument.id.toString())}
                              className="h-6 px-2 text-xs"
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <span>Expires: {selectedDocument.expiryDate || 'No expiry date'}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExpiryEdit(selectedDocument.id.toString(), selectedDocument.expiryDate)}
                              className="h-4 w-4 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600">{selectedDocument.description || 'No description available'}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags && selectedDocument.tags.length > 0 ? (
                    selectedDocument.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Document
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setSelectedDocument(null)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Manage Folders Dialog */}
      <Dialog open={isManageFoldersOpen} onOpenChange={setIsManageFoldersOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Folders</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input 
                placeholder="New folder name" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <Button onClick={handleCreateFolder}>
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Existing Folders</h4>
              {folders.length === 0 ? (
                <p className="text-sm text-gray-500">No folders created yet</p>
              ) : (
                folders.map((folder) => (
                  <div key={folder.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{folder.name}</span>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm(`Delete folder "${folder.name}"? Documents will be moved to "No folder".`)) {
                          setFolders(prev => prev.filter(f => f.id !== folder.id));
                          setDocuments(prev => prev.map(d => d.folderId === folder.id ? {...d, folderId: null} : d));
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentVault;
