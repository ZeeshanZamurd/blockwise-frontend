import React, { useState } from 'react';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExpiryItem {
  id: string;
  title: string;
  expiryDate: string;
  daysUntilExpiry: number;
  type: 'document' | 'certificate' | 'insurance';
}

interface ExpiryBannerProps {
  expiringItems: ExpiryItem[];
}

const ExpiryBanner: React.FC<ExpiryBannerProps> = ({ expiringItems }) => {
  const [dismissedItems, setDismissedItems] = useState<Set<string>>(new Set());
  const [snoozedItems, setSnoozedItems] = useState<Set<string>>(new Set());

  const visibleItems = expiringItems.filter(item => 
    !dismissedItems.has(item.id) && !snoozedItems.has(item.id)
  );

  const handleDismiss = (itemId: string) => {
    setDismissedItems(prev => new Set([...prev, itemId]));
  };

  const handleSnooze = (itemId: string) => {
    setSnoozedItems(prev => new Set([...prev, itemId]));
    // In a real app, this would set a reminder for 1 week from now
    console.log(`Snoozed item ${itemId} for 1 week`);
  };

  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {visibleItems.map((item) => (
        <Card key={item.id} className="border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {item.title} expires in {item.daysUntilExpiry} days
                  </p>
                  <p className="text-xs text-red-600">
                    Due: {new Date(item.expiryDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSnooze(item.id)}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  Remind in 1 week
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDismiss(item.id)}
                  className="text-red-700 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ExpiryBanner;