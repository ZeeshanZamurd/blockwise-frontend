
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Copy, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface UniqueEmailStepProps {
  data: any;
  updateData: (data: any) => void;
  onNext: () => void;
  onPrev: () => void;
}

const UniqueEmailStep = ({ data, updateData, onNext, onPrev }: UniqueEmailStepProps) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  // Use the actual unique building email from the API response
  const uniqueEmail = user?.uniqueBuildingEmail || '';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Unique Building Email</h2>
        <p className="text-gray-600">This is the magic email address for {user?.buildingName}</p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
            <div className="flex-1">
              <p className="font-mono text-lg font-semibold text-blue-800">{uniqueEmail}</p>
            </div>
            <Button onClick={copyToClipboard} variant="outline" size="sm">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p className="font-semibold">📧 What to do next:</p>
            <ul className="space-y-2 ml-4">
              <li>• <strong>CC this email</strong> into every future building-related email</li>
              <li>• <strong>Forward existing emails</strong> to this address to start building your history</li>
              <li>• <strong>Share with your managing agent</strong> so they can CC it too</li>
              <li>• <strong>Use this email</strong> for all {user?.buildingName} communications</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">How it works:</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>✨ <strong>No change needed</strong> to how your managing agent works</p>
          <p>✨ <strong>No change needed</strong> to how you work (if email is your preferred method)</p>
          <p>✨ <strong>A bit of setup now</strong> saves hours later by building your building's golden thread</p>
          <p>✨ <strong>AI-powered insights</strong> will automatically organize everything for you</p>
        </div>
      </div>

      <div className="flex space-x-4">
        <Button onClick={onPrev} variant="outline" className="flex-1">
          Back
        </Button>
        <Button onClick={onNext} className="flex-1">
          Complete Setup
        </Button>
      </div>
    </div>
  );
};

export default UniqueEmailStep;
