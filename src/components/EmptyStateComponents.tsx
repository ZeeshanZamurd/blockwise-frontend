import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, Mail, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateComponentsProps {
  title: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  showEmailTip?: boolean;
}

export const EmptyStateView = ({ 
  title, 
  description, 
  icon: Icon, 
  features, 
  showEmailTip = false 
}: EmptyStateComponentsProps) => {
  const uniqueEmail = "alto-apartments-j4k9@blocwise.com";

  const copyToClipboard = () => {
    navigator.clipboard.writeText(uniqueEmail);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="text-center py-12">
        <Icon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        {showEmailTip && (
          <Alert className="max-w-md mx-auto mb-6">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Get started:</strong> Forward building-related emails to{' '}
              <div className="flex items-center justify-center space-x-2 mt-2">
                <code className="bg-muted px-2 py-1 rounded text-sm">{uniqueEmail}</code>
                <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              The system will automatically create issues and organize information.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
          <h3 className="font-semibold mb-3">What you'll see here:</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            {features.map((feature, index) => (
              <li key={index}>• {feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};