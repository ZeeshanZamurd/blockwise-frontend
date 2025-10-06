import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, UserPlus, UserMinus, Plus, User, Loader2 } from 'lucide-react';
import { useDirector } from '@/hooks/useDirector';
import { useBuilding } from '@/hooks/useBuilding';
import { toast } from 'sonner';

interface Director {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  roleName: string;
}

interface DirectorsSectionProps {
  emptyDataMode?: boolean;
  userData?: any;
}

const DirectorsSection = ({ emptyDataMode, userData }: DirectorsSectionProps) => {
  const { getDirectorsByBuildingId, isLoading } = useDirector();
  const { building } = useBuilding();
  const [directors, setDirectors] = useState<Director[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch directors when component mounts
  useEffect(() => {
    const loadDirectors = async () => {
      if (!building?.buildingId) return;
      
      const result = await getDirectorsByBuildingId(building.buildingId);
      if (result.success) {
        setDirectors(result.directors || []);
        setError(null);
      } else {
        setError(result.error || 'Failed to load directors');
        toast.error('Failed to load directors');
      }
    };

    if (!emptyDataMode) {
      loadDirectors();
    }
  }, [emptyDataMode, building?.buildingId, getDirectorsByBuildingId]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Board Directors</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span>Loading directors...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Board Directors</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error loading directors: {error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </div>
    );
  }

  if (emptyDataMode && userData) {
    // Show the registered user as the first director
    const currentDirector = {
      id: 1,
      name: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      role: userData.role === 'rmc-director' ? 'RMC Director' : 
            userData.role === 'rtm-member' ? 'RTM Board Member' :
            userData.role === 'managing-agent' ? 'Managing Agent' :
            userData.role === 'building-manager' ? 'Building Manager' : 'Director',
      joinDate: new Date().toLocaleDateString(),
      status: 'Active'
    };

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Directors</h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Director
          </Button>
        </div>

        <div className="grid gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{currentDirector.name}</h4>
                    <p className="text-sm text-gray-600">{currentDirector.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{currentDirector.role}</p>
                  <p className="text-xs text-gray-500">{currentDirector.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <Users className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Add more directors to your board</p>
            <p className="text-xs text-gray-400 mt-1">Invite additional directors to collaborate</p>
          </div>
        </div>
      </div>
    );
  }

  if (emptyDataMode) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Directors</h3>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Director
          </Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No directors added yet</p>
            <p className="text-xs text-gray-400 mt-1">Add directors to manage your building</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Board Directors</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Director
        </Button>
      </div>

      {directors.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {directors.map((director) => (
            <Card key={director.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{director.firstName} {director.lastName}</CardTitle>
                    <p className="text-sm text-gray-600 font-medium">{director.roleName}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    Active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Email: {director.email}</p>
                    <p className="text-sm text-gray-600">Username: {director.username}</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <UserMinus className="h-3 w-3 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Directors Found</h3>
          <p className="text-gray-600 mb-4">No directors have been added to this building yet.</p>
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            Add First Director
          </Button>
        </div>
      )}
    </div>
  );
};

export default DirectorsSection;