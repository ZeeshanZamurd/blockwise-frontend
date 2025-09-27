import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExampleDataBannerProps {
  onClearData: () => void;
  onDismiss: () => void;
}

const ExampleDataBanner = ({ onClearData, onDismiss }: ExampleDataBannerProps) => {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between w-full">
        <span className="text-amber-800">
          <strong>This is all example data.</strong> When you're ready to use the platform, you can clear this data and start processing your own emails.
        </span>
        <div className="flex items-center gap-2 ml-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={onClearData}
            className="bg-white border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            Clear Example Data
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onDismiss}
            className="text-amber-600 hover:bg-amber-100 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

export default ExampleDataBanner;