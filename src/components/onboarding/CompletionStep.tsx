
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Mail, Users, Building2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface CompletionStepProps {
  data: any;
}

const CompletionStep = ({ data }: CompletionStepProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to BlocWise, {user?.firstName}!</h2>
        <p className="text-gray-600">Your building management platform is ready</p>
      </div>

      <div className="grid gap-4">
        {/* User Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">{user?.firstName} {user?.lastName}</h3>
                <p className="text-sm text-gray-600">{user?.roleName} • {user?.userName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Building Information */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Building2 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">{user?.buildingName}</h3>
                <p className="text-sm text-gray-600">Building ID: {user?.buildingId}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Unique Building Email */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Your Building Email</h3>
                <p className="text-sm text-gray-600 font-mono bg-gray-100 p-2 rounded mt-1">
                  {user?.uniqueBuildingEmail}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Use this email to forward building-related communications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Directors Invited */}
        {data.directorEmails && data.directorEmails.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-orange-600" />
                <div>
                  <h3 className="font-semibold">Directors Invited</h3>
                  <p className="text-sm text-gray-600">{data.directorEmails.length} invitation(s) sent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📧 Email Confirmation Required</h3>
        <p className="text-sm text-blue-800 mb-3">
          We've sent a confirmation email to <strong>{user?.email}</strong>. Please check your inbox and click the confirmation link before you can access your dashboard.
        </p>
        <p className="text-sm text-blue-800">
          The email includes:
        </p>
        <ul className="text-sm text-blue-800 mt-2 ml-4 space-y-1">
          <li>• Confirmation link to activate your account</li>
          <li>• Your unique building email: <strong className="font-mono">{user?.uniqueBuildingEmail}</strong></li>
          <li>• Step-by-step setup guide</li>
          <li>• Tips for getting the most out of BlocWise</li>
        </ul>
      </div>

      {/* How BlocWise Works Section */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">How BlocWise Works</h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p><strong>Key Features:</strong></p>
          <ul className="ml-4 space-y-1 text-sm">
            <li>• <strong>Email Processing:</strong> Forward or copy emails - our system synthesizes, classifies and shows each issue</li>
            <li>• <strong>Issue Tracking:</strong> Current and historical issues in one organized space</li>
            <li>• <strong>Golden Thread:</strong> Keep historical messages and tasks connected to building issues</li>
            <li>• <strong>Calendar & Suppliers:</strong> Manage meetings, AGMs, and supplier contacts</li>
            <li>• <strong>Document Vault:</strong> Store all your building safety documents securely</li>
          </ul>
        </div>
      </div>

      <Button onClick={handleGetStarted} className="w-full" size="lg">
        Enter Your Dashboard
      </Button>
    </div>
  );
};

export default CompletionStep;
