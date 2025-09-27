
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, Search, Filter, Paperclip, Star, Archive } from 'lucide-react';

const CommunicationsPanel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const communications = [
    {
      id: 1,
      subject: 'Monthly Maintenance Report - June 2024',
      from: 'Sarah Johnson, Managing Agent',
      category: 'Reports',
      date: '2024-06-27',
      time: '14:30',
      hasAttachment: true,
      isStarred: true,
      preview: 'Please find attached the monthly maintenance report covering all building activities...',
      status: 'unread'
    },
    {
      id: 2,
      subject: 'Fire Safety Inspection - Action Required',
      from: 'Fire Safety Compliance Ltd',
      category: 'Compliance',
      date: '2024-06-26',
      time: '09:15',
      hasAttachment: true,
      isStarred: false,
      preview: 'Following our inspection on 24th June, we have identified several items requiring attention...',
      status: 'read'
    },
    {
      id: 3,
      subject: 'Elevator Service Completion Notice',
      from: 'Thames Valley Lifts',
      category: 'Maintenance',
      date: '2024-06-25',
      time: '16:45',
      hasAttachment: false,
      isStarred: false,
      preview: 'We have completed the scheduled maintenance on Elevator #1. All systems are operational...',
      status: 'read'
    },
    {
      id: 4,
      subject: 'Insurance Policy Renewal Reminder',
      from: 'Metro Insurance Brokers',
      category: 'Administration',
      date: '2024-06-24',
      time: '11:20',
      hasAttachment: true,
      isStarred: false,
      preview: 'Your building insurance policy is due for renewal on 31st July 2024...',
      status: 'read'
    },
    {
      id: 5,
      subject: 'Roof Leak Investigation Update',
      from: 'BuildTech Contractors',
      category: 'Repairs',
      date: '2024-06-23',
      time: '13:10',
      hasAttachment: true,
      isStarred: true,
      preview: 'We have investigated the reported leak in Block A and identified the source...',
      status: 'unread'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'reports': return 'bg-blue-100 text-blue-800';
      case 'compliance': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      case 'administration': return 'bg-purple-100 text-purple-800';
      case 'repairs': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = comm.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comm.preview.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || comm.category.toLowerCase() === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Communications</h2>
        <p className="text-gray-600">Email threads and building-related communications</p>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="reports">Reports</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="administration">Administration</SelectItem>
                <SelectItem value="repairs">Repairs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Communications List */}
      <div className="space-y-3">
        {filteredCommunications.map((comm) => (
          <Card key={comm.id} className={`hover:shadow-md transition-shadow cursor-pointer ${comm.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className={`h-4 w-4 ${comm.status === 'unread' ? 'text-blue-600' : 'text-gray-400'}`} />
                    <h3 className={`font-medium ${comm.status === 'unread' ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                      {comm.subject}
                    </h3>
                    {comm.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {comm.hasAttachment && <Paperclip className="h-4 w-4 text-gray-400" />}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm text-gray-600">From: {comm.from}</span>
                    <Badge className={getCategoryColor(comm.category)}>
                      {comm.category}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{comm.preview}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{comm.date} at {comm.time}</span>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CommunicationsPanel;
