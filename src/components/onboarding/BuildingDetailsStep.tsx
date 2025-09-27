
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, MapPin, Home } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BuildingDetailsStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const BuildingDetailsStep = ({ data, updateData, onNext, onPrev }: BuildingDetailsStepProps) => {
  const { createBuilding, isLoading, error, clearAuthError } = useAuth();
  
  const [buildingName, setBuildingName] = useState(data.buildingName || '');
  const [buildingAddress, setBuildingAddress] = useState(data.buildingAddress || '');
  const [numberOfFlats, setNumberOfFlats] = useState(data.numberOfFlats || '');

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthError();
    }
  }, [error, clearAuthError]);

  const handleNext = async () => {
    if (buildingName && buildingAddress && numberOfFlats) {
      const result = await createBuilding(buildingName, buildingAddress, parseInt(numberOfFlats));
      if (result.success) {
        toast.success('Building created successfully!');
        updateData({ buildingName, buildingAddress, numberOfFlats });
        onNext();
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Building Information</h2>
        <p className="text-gray-600">Tell us about your residential building</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="buildingName">Building Name</Label>
          <div className="relative">
            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="buildingName"
              placeholder="e.g., Alto Apartments, Riverside Gardens"
              value={buildingName}
              onChange={(e) => setBuildingName(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="buildingAddress">Building Address</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Textarea
              id="buildingAddress"
              placeholder="Full building address including postcode"
              value={buildingAddress}
              onChange={(e) => setBuildingAddress(e.target.value)}
              className="pl-10 min-h-[80px]"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="numberOfFlats">Number of Flats</Label>
          <div className="relative">
            <Home className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="numberOfFlats"
              type="number"
              placeholder="e.g., 24"
              value={numberOfFlats}
              onChange={(e) => setNumberOfFlats(e.target.value)}
              className="pl-10"
              min="1"
            />
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">
          Back
        </Button>
        <Button 
          onClick={handleNext} 
          className="flex-1"
          disabled={!buildingName || !buildingAddress || !numberOfFlats || isLoading}
        >
          {isLoading ? 'Creating Building...' : 'Continue'}
        </Button>
      </div>
    </div>
  );
};

export default BuildingDetailsStep;
