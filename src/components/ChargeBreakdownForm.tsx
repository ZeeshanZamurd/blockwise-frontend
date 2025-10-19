import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

interface Charge {
  id: string;
  description: string;
  amount: number;
  category: string;
}

interface ChargeBreakdownFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItemDescription: string;
  lineItemAmount: number;
  lineItemCategory?: string;
  onSave: (updatedData: { description: string; amount: number; category: string }) => void;
  isNewItem: boolean;
}

const ChargeBreakdownForm = ({
  open,
  onOpenChange,
  lineItemDescription,
  lineItemAmount,
  lineItemCategory = '',
  onSave,
  isNewItem
}: ChargeBreakdownFormProps) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);
  const [category, setCategory] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Populate form with line item data when modal opens
  useEffect(() => {
    if (open) {
      console.log('ChargeBreakdownForm - Populating form:', {
        lineItemDescription,
        lineItemAmount,
        lineItemCategory,
        isNewItem
      });
      
      setDescription(lineItemDescription);
      setAmount(lineItemAmount);
      setCategory(lineItemCategory || 'General');
      setHasChanges(false);
    }
  }, [open, lineItemDescription, lineItemAmount, lineItemCategory, isNewItem]);

  // Track changes
  useEffect(() => {
    const hasDescriptionChanged = description !== lineItemDescription;
    const hasAmountChanged = amount !== lineItemAmount;
    const hasCategoryChanged = category !== lineItemCategory;
    
    setHasChanges(hasDescriptionChanged || hasAmountChanged || hasCategoryChanged);
  }, [description, amount, category, lineItemDescription, lineItemAmount, lineItemCategory]);

  const handleSave = () => {
    const updatedData = {
      description,
      amount,
      category
    };
    
    console.log('ChargeBreakdownForm - Saving data:', updatedData);
    
    onSave(updatedData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Line Item</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {isNewItem ? 'New Item' : 'Existing Item'} • Total Amount: £{lineItemAmount.toLocaleString()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter item description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g. Maintenance, Utilities..."
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                    className="pl-6"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!hasChanges}
              className={hasChanges ? 'bg-blue-600 hover:bg-blue-700' : ''}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChargeBreakdownForm;