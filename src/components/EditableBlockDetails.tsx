import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { MapPin, User, Phone, Mail, Key, FileText, Edit, Plus, Upload, X, Building, Info, Copy } from 'lucide-react';

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
  const uniqueEmail = "alto-apartments-j4k9@blocwise.com";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueEmail);
  };

  // Always show the functional interface
  const [sections, setSections] = useState<EditableSection[]>([
    {
      id: 'address',
      title: 'Block Address',
      icon: MapPin,
      fields: [
        { id: 'address1', label: 'Address Line 1', value: '8 Sylvan Hill', type: 'text' },
        { id: 'address2', label: 'Address Line 2', value: 'London, SE19 2QF', type: 'text' }
      ]
    },
    {
      id: 'managing-agent',
      title: 'Managing Agent',
      icon: User,
      fields: [
        { id: 'company', label: 'Company', value: 'Encore Estate Services', type: 'text' },
        { id: 'manager', label: 'Building Manager', value: 'Rob Cox', type: 'text' },
        { id: 'phone', label: 'Phone', value: '0207 426 4970', type: 'phone' },
        { id: 'email', label: 'Email', value: 'Rob.Cox@encoregroup.co.uk', type: 'email' }
      ]
    },
    {
      id: 'directors',
      title: 'Directors',
      icon: User,
      fields: [
        { id: 'zeeshan', label: 'Zeeshan', value: 'zeeshan.uk@gmail.com', type: 'email' },
        { id: 'chris', label: 'Chris', value: 'christopherallanson@gmail.com', type: 'email' },
        { id: 'mei', label: 'Mei', value: 'mei.lim@reachfoundation.org.uk', type: 'email' },
        { id: 'jonny', label: 'Jonny', value: 'jonnyzimber@gmail.com', type: 'email' },
        { id: 'shared-inbox', label: 'Shared Inbox', value: 'altosylvanhill@gmail.com', type: 'email' }
      ]
    },
    {
      id: 'building-codes',
      title: 'Building Codes / Lock Boxes',
      icon: Key,
      fields: [
        { id: 'side-gates', label: 'Side gates', value: '1066', type: 'code' },
        { id: 'pedestrian-gate', label: 'Pedestrian gate', value: '1769', type: 'code' }
      ]
    },
    {
      id: 'building-plans',
      title: 'Building Plans',
      icon: FileText,
      fields: [],
      documents: [
        { name: 'Floor Plan' },
        { name: 'Building and Ground Map' }
      ]
    }
  ]);

  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);

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

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Block Details</h2>
          <p className="text-muted-foreground">Comprehensive building information and management details</p>
        </div>
        
        <Alert className="md:max-w-md mt-4 md:mt-0">
          <Mail className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Building Email:</strong>
                <div className="text-sm font-mono">{uniqueEmail}</div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy email address</TooltipContent>
              </Tooltip>
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