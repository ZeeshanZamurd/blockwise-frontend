
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, User, Phone, Mail, Key, FileText } from 'lucide-react';

const BlockDetails = () => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">Block Details</h2>
      <p className="text-gray-600 mb-8">Building information, floor plans, and managing agent details</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Block Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Block Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">8 Sylvan Hill</p>
            <p className="text-gray-600">London, SE19 2QF</p>
          </CardContent>
        </Card>

        {/* Managing Agent */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Managing Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Encore Estate Services</p>
            <div className="mt-3 space-y-2">
              <div>
                <p className="text-sm font-medium text-gray-700">Building Manager</p>
                <p>Rob Cox</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-500" />
                <span>0207 426 4970</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>Rob.Cox@encoregroup.co.uk</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Directors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Directors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <span className="font-medium">Zeeshan:</span>
                  <span className="text-blue-600">zeeshan.uk@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Chris:</span>
                  <span className="text-blue-600">christopherallanson@gmail.com</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Mei:</span>
                  <span className="text-blue-600">mei.lim@reachfoundation.org.uk</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Jonny:</span>
                  <span className="text-blue-600">jonnyzimber@gmail.com</span>
                </div>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm font-medium text-gray-700 mb-1">Shared Inbox</p>
                <span className="text-blue-600">altosylvanhill@gmail.com</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Building Codes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Building Codes / Lock Boxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Side gates:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">1066</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Pedestrian gate:</span>
                <span className="font-mono bg-gray-100 px-2 py-1 rounded">1769</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Building Plans */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Building Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium text-gray-700">Floor Plan</p>
                <p className="text-sm text-gray-500">Click to view or upload</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
                <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="font-medium text-gray-700">Building and Ground Map</p>
                <p className="text-sm text-gray-500">Click to view or upload</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BlockDetails;
