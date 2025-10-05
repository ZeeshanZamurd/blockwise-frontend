
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, MapPin, Star, Calendar, FileText, Plus, Grid, List, Users, Loader2 } from 'lucide-react';
import { useSupplier, Supplier } from '@/hooks/useSupplier';
import { toast } from 'sonner';

interface SuppliersSectionProps {
  emptyDataMode?: boolean;
}

const SuppliersSection = ({ emptyDataMode }: SuppliersSectionProps) => {
  const { suppliers, isLoading, error, fetchSuppliers, forceRefresh } = useSupplier();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Fetch suppliers when component mounts
  useEffect(() => {
    const loadSuppliers = async () => {
      const result = await fetchSuppliers();
      if (!result.success) {
        console.error('Failed to fetch suppliers:', result.error);
        toast.error('Failed to load suppliers');
      }
    };

    if (!emptyDataMode) {
      loadSuppliers();
    }
  }, [emptyDataMode, fetchSuppliers]);

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Suppliers</h2>
            <p className="text-gray-600">Building contractors and service providers</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading suppliers...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Suppliers</h2>
            <p className="text-gray-600">Building contractors and service providers</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading suppliers: {error}</p>
            <Button onClick={() => forceRefresh()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

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
