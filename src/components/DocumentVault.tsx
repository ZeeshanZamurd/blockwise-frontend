
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileText, Search, Download, Eye, Calendar, User, Upload, Plus, Shield, Building, AlertTriangle, FileCheck, Edit, Grid, List, Folder, Archive } from 'lucide-react';

interface DocumentVaultProps {
  emptyDataMode?: boolean;
}

const DocumentVault = ({ emptyDataMode }: DocumentVaultProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [editingExpiry, setEditingExpiry] = useState<string | null>(null);
  const [tempExpiryDate, setTempExpiryDate] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const initialDocuments = [
    {
      id: 1,
      title: 'Building Leasehold Document',
      category: 'Legal',
      type: 'PDF',
      size: '2.4 MB',
      uploadDate: '2024-01-15',
      lastModified: '2024-01-15',
      uploadedBy: 'Rob Cox',
      description: 'Original leasehold agreement for the building including all terms and conditions',
      tags: ['leasehold', 'legal', 'agreement'],
      status: 'Current',
      expiryDate: null,
      icon: Building,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 2,
      title: 'Fire Safety Certificate',
      category: 'Compliance',
      type: 'PDF',
      size: '845 KB',
      uploadDate: '2024-06-01',
      lastModified: '2024-06-01',
      uploadedBy: 'Fire Safety Compliance Ltd',
      description: 'Annual fire safety certificate confirming building compliance with fire regulations',
      tags: ['fire safety', 'compliance', 'certificate'],
      status: 'Valid',
      expiryDate: '2025-06-01',
      icon: Shield,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 3,
      title: 'Gas Safety Certificate',
      category: 'Compliance',
      type: 'PDF',
      size: '512 KB',
      uploadDate: '2024-05-20',
      lastModified: '2024-05-20',
      uploadedBy: 'Thames Valley Lifts',
      description: 'Annual gas safety inspection certificate for all communal gas installations',
      tags: ['gas safety', 'compliance', 'certificate'],
      status: 'Expiring Soon',
      expiryDate: '2024-07-15',
      icon: AlertTriangle,
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      id: 4,
      title: 'EWS1 Form - External Wall Survey',
      category: 'Safety',
      type: 'PDF',
      size: '1.8 MB',
      uploadDate: '2024-03-10',
      lastModified: '2024-03-10',
      uploadedBy: 'Building Safety Surveyors Ltd',
      description: 'External Wall System survey form confirming building safety for mortgage and insurance purposes',
      tags: ['EWS1', 'building safety', 'survey', 'mortgage'],
      status: 'Current',
      expiryDate: '2026-03-10',
      icon: FileCheck,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 5,
      title: 'Electrical Installation Certificate',
      category: 'Safety',
      type: 'PDF',
      size: '634 KB',
      uploadDate: '2024-04-05',
      lastModified: '2024-04-05',
      uploadedBy: 'PowerTech Electrical',
      description: 'Electrical installation safety certificate for communal areas and systems',
      tags: ['electrical', 'safety', 'installation'],
      status: 'Current',
      expiryDate: '2029-04-05',
      icon: Shield,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 6,
      title: 'Building Insurance Policy',
      category: 'Insurance',
      type: 'PDF',
      size: '3.2 MB',
      uploadDate: '2024-02-28',
      lastModified: '2024-02-28',
      uploadedBy: 'Metro Insurance Brokers',
      description: 'Comprehensive building insurance policy covering structure, public liability, and management liability',
      tags: ['insurance', 'policy', 'coverage'],
      status: 'Current',
      expiryDate: '2025-02-28',
      icon: Shield,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 7,
      title: 'Building Floor Plans',
      category: 'Plans',
      type: 'PDF',
      size: '4.7 MB',
      uploadDate: '2024-01-20',
      lastModified: '2024-01-20',
      uploadedBy: 'Architectural Plans Ltd',
      description: 'Detailed floor plans showing all levels, units, and communal areas of the building',
      tags: ['floor plans', 'architecture', 'layout'],
      status: 'Current',
      expiryDate: null,
      icon: Building,
      color: 'bg-teal-100 text-teal-800'
    },
    {
      id: 8,
      title: 'Site and Grounds Map',
      category: 'Plans',
      type: 'PDF',
      size: '2.1 MB',
      uploadDate: '2024-01-20',
      lastModified: '2024-01-20',
      uploadedBy: 'Architectural Plans Ltd',
      description: 'Comprehensive site map showing building location, boundaries, gardens, and parking areas',
      tags: ['site map', 'grounds', 'boundaries'],
      status: 'Current',
      expiryDate: null,
      icon: Building,
      color: 'bg-teal-100 text-teal-800'
    }
];

  // Empty data adjustments
  const emptyDocuments = emptyDataMode ? [] : initialDocuments;
  const [documents, setDocuments] = useState<any[]>(emptyDocuments.map((d) => ({ ...d, folderId: null as string | null, archived: false })));
  const [folders, setFolders] = useState<{ id: string; name: string }[]>([
    { id: 'f-fire', name: 'Fire Safety' },
  ]);
  const [activeFolderId, setActiveFolderId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isManageFoldersOpen, setIsManageFoldersOpen] = useState(false);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  const handleCreateFolder = () => {
    const name = newFolderName.trim();
    if (!name) return;
    const id = (crypto as any).randomUUID ? (crypto as any).randomUUID() : `f-${Date.now()}`;
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

  const getCategoryColor = (category: string) => {
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
      doc.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
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
              input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  console.log('Files selected:', files);
                  // In a real app, handle file upload here
                }
              };
              input.click();
            }}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </div>

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

      {/* Documents View */}
      {viewMode === 'grid' ? (
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
                          {document.category}
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
      ) : (
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
                        {document.category}
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
      )}

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
                          {selectedDocument.category}
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
                <p className="text-sm text-gray-600">{selectedDocument.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDocument.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
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
