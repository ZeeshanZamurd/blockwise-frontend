import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, User, Phone, Mail, Key, FileText, Edit, Plus, Upload, X, Building, Info, Copy, Users, Home, RefreshCw } from 'lucide-react';
import { useBuilding } from '@/hooks/useBuilding';

interface EditableField {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'phone' | 'code';
}

interface EditableSection {
  id: string;
  title: string;
  icon: React.ElementType;
  fields: EditableField[];
  documents?: { name: string; url?: string }[];
}

interface EditableBlockDetailsProps {
  emptyDataMode?: boolean;
}

const EditableBlockDetails = ({ emptyDataMode = false }: EditableBlockDetailsProps) => {
  const { building, isLoading, forceRefresh } = useBuilding();

  const copyToClipboard = () => {
    if (building?.uniqueEmail) {
      navigator.clipboard.writeText(building.uniqueEmail);
    }
  };

  // Generate sections based on real building data
  const generateSections = (): EditableSection[] => {
    if (!building) return [];

    const sections: EditableSection[] = [
      {
        id: 'building-info',
        title: 'Building Information',
        icon: Building,
        fields: [
          { id: 'building-name', label: 'Building Name', value: building.buildingName || '-', type: 'text' },
          { id: 'building-id', label: 'Building ID', value: building.buildingId?.toString() || '-', type: 'text' },
          { id: 'number-of-flats', label: 'Number of Flats', value: building.numberOfFlats?.toString() || '-', type: 'text' }
        ]
      },
      {
        id: 'address',
        title: 'Building Address',
        icon: MapPin,
        fields: [
          { id: 'address', label: 'Address', value: building.buildingAddress || '-', type: 'text' }
        ]
      },
      {
        id: 'directors',
        title: 'Directors',
        icon: Users,
        fields: building.users?.map((user, index) => ({
          id: `director-${user.id}`,
          label: `${user.firstName} ${user.lastName}`,
          value: user.email || '-',
          type: 'email' as const
        })) || []
      }
    ];

    // Add additional sections for missing data
    sections.push(
      {
        id: 'managing-agent',
        title: 'Managing Agent',
        icon: User,
        fields: [
          { id: 'company', label: 'Company', value: '-', type: 'text' },
          { id: 'manager', label: 'Building Manager', value: '-', type: 'text' },
          { id: 'phone', label: 'Phone', value: '-', type: 'phone' },
          { id: 'email', label: 'Email', value: '-', type: 'email' }
        ]
      },
      {
        id: 'building-codes',
        title: 'Building Codes / Lock Boxes',
        icon: Key,
        fields: [
          { id: 'main-gate', label: 'Main Gate Code', value: '-', type: 'code' },
          { id: 'side-gate', label: 'Side Gate Code', value: '-', type: 'code' },
          { id: 'emergency', label: 'Emergency Code', value: '-', type: 'code' }
        ]
      },
      {
        id: 'building-plans',
        title: 'Building Plans & Documents',
        icon: FileText,
        fields: [],
        documents: [
          { name: 'Floor Plan' },
          { name: 'Building Layout' },
          { name: 'Emergency Procedures' }
        ]
      }
    );

    return sections;
  };

  const [sections, setSections] = useState<EditableSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

  // Update sections when building data changes
  useEffect(() => {
    console.log('Building data changed, regenerating sections:', building);
    if (building) {
      setSections(generateSections());
    } else {
      // Clear sections when building data is null (logout scenario)
      setSections([]);
    }
    // Reset editing states when building changes
    setEditingSection(null);
    setEditingField(null);
  }, [building?.buildingId, building?.buildingName, building?.buildingAddress, building?.numberOfFlats, building?.uniqueEmail, building?.users]);

  const updateField = (sectionId: string, fieldId: string, newValue: string) => {
    setSections(sections.map(section => 
      section.id === sectionId 
        ? {
            ...section,
            fields: section.fields.map(field =>
              field.id === fieldId ? { ...field, value: newValue } : field
            )
          }
        : section
    ));
  };

  const addField = (sectionId: string) => {
    const newField: EditableField = {
      id: `field-${Date.now()}`,
      label: 'New Field',
      value: '',
      type: 'text'
    };

    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: [...section.fields, newField] }
        : section
    ));
  };

  const removeField = (sectionId: string, fieldId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? { ...section, fields: section.fields.filter(field => field.id !== fieldId) }
        : section
    ));
  };

  const addDocument = (sectionId: string) => {
    setSections(sections.map(section =>
      section.id === sectionId
        ? {
            ...section,
            documents: [...(section.documents || []), { name: 'New Document' }]
          }
        : section
    ));
  };

  const updateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections(sections.map(section =>
      section.id === sectionId ? { ...section, title: newTitle } : section
    ));
  };

  const addSection = () => {
    const newSection: EditableSection = {
      id: `section-${Date.now()}`,
      title: 'New Section',
      icon: FileText,
      fields: []
    };
    setSections([...sections, newSection]);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading building details...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no building data
  if (!building) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Building Data</h3>
            <p className="text-gray-600">Building details are not available.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Block Details</h2>
          <p className="text-muted-foreground">Comprehensive building information and management details</p>
        </div>
        
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => {
              console.log('Manual refresh triggered for building details');
              forceRefresh();
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
                Refresh Data
              </>
            )}
          </Button>
        </div>
        
        <Alert className="md:max-w-md mt-4 md:mt-0">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Building Email:</strong>
                <div className="text-sm font-mono">
                  {building?.uniqueEmail || '-'}
                </div>
              </div>
              {building?.uniqueEmail && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy email address</TooltipContent>
                </Tooltip>
              )}
            </div>
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex justify-end">
        <Button onClick={addSection} variant="outline">
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          const isEditingTitle = editingSection === section.id;
          
          return (
            <Card key={section.id} className={section.id === 'building-plans' ? 'lg:col-span-2' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {isEditingTitle ? (
                      <Input
                        value={section.title}
                        onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                        onBlur={() => setEditingSection(null)}
                        onKeyPress={(e) => e.key === 'Enter' && setEditingSection(null)}
                        className="text-lg font-semibold"
                        autoFocus
                      />
                    ) : (
                      <span 
                        className="cursor-pointer hover:text-blue-600"
                        onClick={() => setEditingSection(section.id)}
                      >
                        {section.title}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSection(isEditingTitle ? null : section.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addField(section.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.fields.length > 0 && (
                  <div className="space-y-3">
                    {section.fields.map((field) => {
                      const isEditing = editingField === `${section.id}-${field.id}`;
                      
                      return (
                        <div key={field.id} className="flex items-center justify-between group">
                          <div className="flex-1">
                            {isEditing ? (
                              <div className="space-y-2">
                                <Input
                                  value={field.label}
                                  onChange={(e) => {
                                    const updatedSections = sections.map(s =>
                                      s.id === section.id
                                        ? {
                                            ...s,
                                            fields: s.fields.map(f =>
                                              f.id === field.id ? { ...f, label: e.target.value } : f
                                            )
                                          }
                                        : s
                                    );
                                    setSections(updatedSections);
                                  }}
                                  placeholder="Field label"
                                  className="text-sm"
                                />
                                <Input
                                  value={field.value}
                                  onChange={(e) => updateField(section.id, field.id, e.target.value)}
                                  onBlur={() => setEditingField(null)}
                                  onKeyPress={(e) => e.key === 'Enter' && setEditingField(null)}
                                  placeholder="Field value"
                                  autoFocus
                                  className={field.type === 'code' ? 'font-mono' : ''}
                                />
                              </div>
                            ) : (
                              <div
                                className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                                onClick={() => setEditingField(`${section.id}-${field.id}`)}
                              >
                                <div className="flex justify-between">
                                  <span className="font-medium text-gray-700">{field.label}:</span>
                                  <span className={`${
                                    field.value === '-' ? 'text-gray-400 italic' :
                                    field.type === 'email' ? 'text-blue-600' : 
                                    field.type === 'code' ? 'font-mono bg-gray-100 px-2 py-1 rounded' : 
                                    ''
                                  }`}>
                                    {field.value}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeField(section.id, field.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {section.documents && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.documents.map((doc, index) => (
                        <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer group">
                          <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="font-medium text-gray-700">{doc.name}</p>
                          <div className="flex justify-center gap-2 mt-2">
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Upload className="h-4 w-4 mr-1" />
                              Upload
                            </Button>
                            {doc.url && (
                              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                View
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                      <div 
                        onClick={() => addDocument(section.id)}
                        className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      >
                        <Plus className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                        <p className="font-medium text-blue-600">Add Document</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default EditableBlockDetails;