
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, MapPin, Star, Calendar, FileText, Plus, Grid, List, Users } from 'lucide-react';

interface SuppliersSectionProps {
  emptyDataMode?: boolean;
}

const SuppliersSection = ({ emptyDataMode }: SuppliersSectionProps) => {
  if (emptyDataMode) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Suppliers</h2>
          <p className="text-muted-foreground mb-6">
            Manage contractors, service providers, and building suppliers
          </p>
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-3">What you'll see here:</h3>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Contractor contact information and ratings</li>
              <li>• Service history and performance tracking</li>
              <li>• Quote comparison and management</li>
              <li>• Certification and insurance verification</li>
              <li>• Preferred supplier recommendations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const suppliers = [
    {
      id: 1,
      name: 'Thames Valley Lifts',
      category: 'Boiler and Heat Management',
      contact: 'Mark Thompson',
      phone: '0208 123 4567',
      email: 'mark@thamesvalleylifts.co.uk',
      address: '45 Industrial Estate, Kingston, KT2 7NH',
      rating: 4.8,
      lastService: '2024-05-15',
      nextService: '2024-11-15',
      status: 'Active',
      services: ['Annual Boiler Service', 'Emergency Repairs', 'Safety Certificates'],
      notes: 'Reliable service provider. Always punctual and professional.',
      totalJobs: 12,
      description: 'Specializes in commercial boiler maintenance and heating system management for residential buildings.'
    },
    {
      id: 2,
      name: 'Cier Gardening',
      category: 'Gardeners',
      contact: 'Sarah Chen',
      phone: '0207 456 7890',
      email: 'info@ciergardening.com',
      address: '23 Green Lane, Croydon, CR0 4BX',
      rating: 4.6,
      lastService: '2024-06-20',
      nextService: '2024-07-20',
      status: 'Active',
      services: ['Monthly Garden Maintenance', 'Hedge Trimming', 'Seasonal Planting'],
      notes: 'Excellent attention to detail. Residents frequently compliment their work.',
      totalJobs: 8,
      description: 'Professional gardening service specializing in communal garden maintenance and landscaping.'
    },
    {
      id: 3,
      name: 'Jo Cleaners',
      category: 'Cleaning Company',
      contact: 'Joanna Smith',
      phone: '0208 789 0123',
      email: 'jo@jocleaners.co.uk',
      address: '12 High Street, Wimbledon, SW19 1AB',
      rating: 4.9,
      lastService: '2024-06-25',
      nextService: '2024-07-02',
      status: 'Active',
      services: ['Weekly Common Area Cleaning', 'Stairwell Deep Clean', 'Window Cleaning'],
      notes: 'Outstanding service quality. Never missed a scheduled clean.',
      totalJobs: 24,
      description: 'Comprehensive cleaning services for residential buildings and commercial properties.'
    },
    {
      id: 4,
      name: 'Pearly Gates',
      category: 'Gate Repair',
      contact: 'David Wilson',
      phone: '0207 234 5678',
      email: 'repairs@pearlygates.co.uk',
      address: '78 Workshop Road, Croydon, CR0 2EF',
      rating: 4.4,
      lastService: '2024-04-10',
      nextService: 'On-call',
      status: 'Active',
      services: ['Gate Repairs', 'Access System Maintenance', 'Security Upgrades'],
      notes: 'Quick response time for emergency repairs. Competitive pricing.',
      totalJobs: 5,
      description: 'Specialist in automated gate systems, repairs, and security access control for residential properties.'
    },
    {
      id: 5,
      name: 'JKC Japanese Knotweed Control',
      category: 'Japanese Knotweed',
      contact: 'Michael Brown',
      phone: '0208 345 6789',
      email: 'control@jkc-specialist.com',
      address: '156 Commercial Drive, London, SE15 3QR',
      rating: 4.7,
      lastService: '2024-03-15',
      nextService: '2024-09-15',
      status: 'Active',
      services: ['Knotweed Treatment', 'Site Surveys', 'Management Plans'],
      notes: 'Certified specialists. Provide comprehensive treatment plans and guarantees.',
      totalJobs: 3,
      description: 'Certified Japanese Knotweed specialists providing treatment, surveys, and long-term management solutions.'
    },
    {
      id: 6,
      name: 'Clean Bin Solutions',
      category: 'Bin Store Cleaning',
      contact: 'Lisa Taylor',
      phone: '0207 567 8901',
      email: 'info@cleanbinsolutions.co.uk',
      address: '89 Service Lane, Mitcham, CR4 1PQ',
      rating: 4.5,
      lastService: '2024-06-15',
      nextService: '2024-07-15',
      status: 'Active',
      services: ['Bin Store Deep Clean', 'Disinfection', 'Odor Control'],
      notes: 'Specialized service for bin store maintenance. Very thorough and hygienic approach.',
      totalJobs: 6,
      description: 'Specialized cleaning service for waste storage areas, focusing on hygiene and odor control.'
    },
    {
      id: 7,
      name: 'Crystal Clear Windows',
      category: 'Window Cleaners',
      contact: 'Robert Johnson',
      phone: '0208 678 9012',
      email: 'rob@crystalclearwindows.com',
      address: '34 Tower Hill, London, SE19 3XY',
      rating: 4.6,
      lastService: '2024-06-12',
      nextService: '2024-08-12',
      status: 'Active',
      services: ['External Window Cleaning', 'Gutter Cleaning', 'Pressure Washing'],
      notes: 'Professional window cleaning service. Good value for money and reliable scheduling.',
      totalJobs: 4,
      description: 'Professional window cleaning service for residential and commercial buildings, including high-rise work.'
    }
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Boiler and Heat Management': 'bg-red-100 text-red-800',
      'Gardeners': 'bg-green-100 text-green-800',
      'Cleaning Company': 'bg-blue-100 text-blue-800',
      'Gate Repair': 'bg-orange-100 text-orange-800',
      'Japanese Knotweed': 'bg-purple-100 text-purple-800',
      'Bin Store Cleaning': 'bg-teal-100 text-teal-800',
      'Window Cleaners': 'bg-cyan-100 text-cyan-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Suppliers</h2>
          <p className="text-gray-600">Building contractors and service providers</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSupplier(supplier)}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{supplier.name}</CardTitle>
                    <Badge className={getCategoryColor(supplier.category)} variant="outline">
                      {supplier.category}
                    </Badge>
                  </div>
                  <Badge className={getStatusColor(supplier.status)}>
                    {supplier.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                    <span className="text-sm text-gray-500">{supplier.totalJobs} jobs</span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <div className="text-xs text-gray-500">
                      <div>Last Service: {supplier.lastService}</div>
                      <div>Next Service: {supplier.nextService}</div>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {suppliers.map((supplier) => (
            <Card key={supplier.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedSupplier(supplier)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{supplier.rating}</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{supplier.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{supplier.contact}</span>
                        <span>•</span>
                        <span>{supplier.phone}</span>
                        <span>•</span>
                        <span>Last Service: {supplier.lastService}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(supplier.category)} variant="outline">
                      {supplier.category}
                    </Badge>
                    <Badge className={getStatusColor(supplier.status)}>
                      {supplier.status}
                    </Badge>
                    <span className="text-sm text-gray-500">{supplier.totalJobs} jobs</span>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Supplier Details Modal */}
      {selectedSupplier && (
        <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedSupplier.name}</span>
                <Badge className={getStatusColor(selectedSupplier.status)}>
                  {selectedSupplier.status}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{selectedSupplier.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{selectedSupplier.email}</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                        <span>{selectedSupplier.address}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Service History</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Last Service: {selectedSupplier.lastService}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>Next Service: {selectedSupplier.nextService}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span>Total Jobs: {selectedSupplier.totalJobs}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Services Provided</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.services.map((service, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Rating & Performance</h4>
                    <div className="flex items-center space-x-2 mb-2">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="font-medium">{selectedSupplier.rating}/5.0</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-sm text-gray-600 mb-4">{selectedSupplier.description}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">{selectedSupplier.notes}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Documents</h4>
                <div className="space-y-2">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <FileText className="h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-600">Upload contracts, invoices, quotes</p>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center p-2 border rounded">
                      <FileText className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      <span>Contracts</span>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <FileText className="h-4 w-4 mx-auto mb-1 text-green-500" />
                      <span>Invoices</span>
                    </div>
                    <div className="text-center p-2 border rounded">
                      <FileText className="h-4 w-4 mx-auto mb-1 text-orange-500" />
                      <span>Quotes</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">Edit Supplier</Button>
                <Button variant="outline">Contact</Button>
                <Button variant="outline" onClick={() => setSelectedSupplier(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default SuppliersSection;
