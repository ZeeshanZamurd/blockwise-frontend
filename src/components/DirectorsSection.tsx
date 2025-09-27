import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Calendar, UserPlus, UserMinus, Plus, User } from 'lucide-react';

interface Director {
  id: string;
  name: string;
  position: string;
  joinedDate: string;
  email: string;
  phone?: string;
  status: 'Active' | 'Inactive';
}

const mockDirectors: Director[] = [
  {
    id: '1',
    name: 'John Smith',
    position: 'Chairman',
    joinedDate: '2020-03-15',
    email: 'john.smith@building.com',
    phone: '+44 7123 456789',
    status: 'Active'
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    position: 'Vice Chairman',
    joinedDate: '2021-06-20',
    email: 'sarah.johnson@building.com',
    phone: '+44 7987 654321',
    status: 'Active'
  },
  {
    id: '3',
    name: 'Michael Brown',
    position: 'Treasurer',
    joinedDate: '2019-11-10',
    email: 'michael.brown@building.com',
    status: 'Active'
  },
  {
    id: '4',
    name: 'Emily Davis',
    position: 'Secretary',
    joinedDate: '2022-01-08',
    email: 'emily.davis@building.com',
    phone: '+44 7555 123456',
    status: 'Active'
  }
];

interface DirectorsSectionProps {
  emptyDataMode?: boolean;
  userData?: any;
}

const DirectorsSection = ({ emptyDataMode, userData }: DirectorsSectionProps) => {
  const [directors] = useState<Director[]>(mockDirectors);

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

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months > 0 ? `${months} month${months > 1 ? 's' : ''}` : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Board Directors</h1>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Director
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {directors.map((director) => (
          <Card key={director.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{director.name}</CardTitle>
                  <p className="text-sm text-gray-600 font-medium">{director.position}</p>
                </div>
                <Badge 
                  variant={director.status === 'Active' ? 'default' : 'secondary'}
                  className={director.status === 'Active' ? 'bg-green-100 text-green-700' : ''}
                >
                  {director.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Email: {director.email}</p>
                  {director.phone && (
                    <p className="text-sm text-gray-600">Phone: {director.phone}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {new Date(director.joinedDate).toLocaleDateString('en-GB')}</span>
                  <span className="text-gray-400">•</span>
                  <span>Tenure: {formatJoinDate(director.joinedDate)}</span>
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
    </div>
  );
};

export default DirectorsSection;