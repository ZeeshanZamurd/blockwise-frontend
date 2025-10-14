
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Mail, MapPin, Star, Calendar, FileText, Plus, Grid, List, Users, Loader2 } from 'lucide-react';
import { useSupplier, Supplier } from '@/hooks/useSupplier';
import { useBuilding } from '@/hooks/useBuilding';
import { useCategory } from '@/hooks/useCategory';
import { toast } from 'sonner';

interface SuppliersSectionProps {
  emptyDataMode?: boolean;
}

const SuppliersSection = ({ emptyDataMode }: SuppliersSectionProps) => {
  const { suppliers, isLoading, error, fetchSuppliers, forceRefresh, createSupplier } = useSupplier();
  const { building } = useBuilding();
  const { categories, isLoading: categoriesLoading, fetchCategories } = useCategory();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    category: '',
    categoryId: 0,
    contact: '',
    phone: '',
    email: '',
    address: '',
    rating: 0,
    lastService: '',
    nextService: '',
    status: 'Active',
    services: [] as string[],
    servicesInput: '',
    notes: '',
    totalJobs: 0,
    description: '',
    buildingId: building?.buildingId || 0
  });

  // Fetch suppliers and categories when component mounts
  useEffect(() => {
    const loadData = async () => {
      const [suppliersResult, categoriesResult] = await Promise.all([
        fetchSuppliers(),
        fetchCategories()
      ]);
      
      if (!suppliersResult.success) {
        console.error('Failed to fetch suppliers:', suppliersResult.error);
        toast.error('Failed to load suppliers');
      }
      
      if (!categoriesResult.success) {
        console.error('Failed to fetch categories:', categoriesResult.error);
        toast.error('Failed to load categories');
      }
    };

    if (!emptyDataMode) {
      loadData();
    }
  }, [emptyDataMode, fetchSuppliers, fetchCategories]);

  // Update buildingId when building changes
  useEffect(() => {
    if (building?.buildingId) {
      setNewSupplier(prev => ({ ...prev, buildingId: building.buildingId }));
    }
  }, [building?.buildingId]);

  const handleCreateSupplier = async () => {
    if (!newSupplier.name || !newSupplier.categoryId || !newSupplier.contact) {
      toast.error('Please fill in required fields (Name, Category, Contact)');
      return;
    }

    setIsCreating(true);
    try {
      const result = await createSupplier(newSupplier);
      if (result.success) {
        toast.success('Supplier created successfully!');
        setShowAddDialog(false);
        setNewSupplier({
          name: '',
          category: '',
          categoryId: 0,
          contact: '',
          phone: '',
          email: '',
          address: '',
          rating: 0,
          lastService: '',
          nextService: '',
          status: 'Active',
          services: [],
          servicesInput: '',
          notes: '',
          totalJobs: 0,
          description: '',
          buildingId: building?.buildingId || 0
        });
      } else {
        toast.error(result.error || 'Failed to create supplier');
      }
    } catch (error) {
      console.error('Error creating supplier:', error);
      toast.error('Failed to create supplier');
    } finally {
      setIsCreating(false);
    }
  };

  const handleServiceChange = (value: string) => {
    const services = value.split(',').map(s => s.trim()).filter(s => s);
    setNewSupplier(prev => ({ ...prev, services }));
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewSupplier(prev => ({ ...prev, servicesInput: value }));
  };

  const handleServiceInputBlur = () => {
    const services = newSupplier.servicesInput.split(',').map(s => s.trim()).filter(s => s);
    setNewSupplier(prev => ({ ...prev, services, servicesInput: '' }));
  };

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
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suppliers?.map((supplier) => (
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
          {suppliers?.map((supplier) => (
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

      {/* Add Supplier Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Supplier name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select value={newSupplier.categoryId.toString()} onValueChange={(value) => {
                  const categoryId = parseInt(value);
                  const selectedCategory = categories.find(cat => cat.id === categoryId);
                  setNewSupplier(prev => ({ 
                    ...prev, 
                    categoryId: categoryId,
                    category: selectedCategory?.name || ''
                  }));
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Contact Person *</label>
                <Input
                  value={newSupplier.contact}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, contact: e.target.value }))}
                  placeholder="Contact person name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={newSupplier.phone}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newSupplier.status} onValueChange={(value) => setNewSupplier(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Address</label>
              <Textarea
                value={newSupplier.address}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Full address"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Rating</label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={newSupplier.rating}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Total Jobs</label>
                <Input
                  type="number"
                  min="0"
                  value={newSupplier.totalJobs}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, totalJobs: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Last Service Date</label>
                <Input
                  type="date"
                  value={newSupplier.lastService}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, lastService: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Next Service Date</label>
              <Input
                type="date"
                value={newSupplier.nextService}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, nextService: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Services (comma-separated)</label>
              <Input
                value={newSupplier.servicesInput}
                onChange={handleServiceInputChange}
                onBlur={handleServiceInputBlur}
                placeholder="Service 1, Service 2, Service 3"
              />
              {newSupplier.services.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {newSupplier.services.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newSupplier.description}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Supplier description"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                value={newSupplier.notes}
                onChange={(e) => setNewSupplier(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes"
                rows={2}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateSupplier} 
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Supplier'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SuppliersSection;
