import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Upload, Paperclip, X } from 'lucide-react';

interface Charge {
  id: string;
  description: string;
  amount: number;
  category: string;
  documents: { fileName: string; fileUrl: string }[];
}

interface ChargeBreakdownFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lineItemDescription: string;
  lineItemAmount: number;
  onSave: (charges: Charge[]) => void;
  initialCharges?: Charge[];
}

const ChargeBreakdownForm = ({
  open,
  onOpenChange,
  lineItemDescription,
  lineItemAmount,
  onSave,
  initialCharges = []
}: ChargeBreakdownFormProps) => {
  const [charges, setCharges] = useState<Charge[]>(
    initialCharges.length > 0 ? initialCharges : [{
      id: Date.now().toString(),
      description: '',
      amount: 0,
      category: '',
      documents: []
    }]
  );

  const addCharge = () => {
    const newCharge: Charge = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      category: '',
      documents: []
    };
    setCharges([...charges, newCharge]);
  };

  const updateCharge = (id: string, field: keyof Charge, value: any) => {
    setCharges(charges.map(charge =>
      charge.id === id ? { ...charge, [field]: value } : charge
    ));
  };

  const removeCharge = (id: string) => {
    if (charges.length > 1) {
      setCharges(charges.filter(charge => charge.id !== id));
    }
  };

  const handleFileUpload = (chargeId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Mock file upload - in real app, upload to server
    const mockFileUrl = URL.createObjectURL(file);
    const document = {
      fileName: file.name,
      fileUrl: mockFileUrl
    };

    updateCharge(chargeId, 'documents', [
      ...charges.find(c => c.id === chargeId)?.documents || [],
      document
    ]);
  };

  const removeDocument = (chargeId: string, fileName: string) => {
    const charge = charges.find(c => c.id === chargeId);
    if (charge) {
      updateCharge(chargeId, 'documents', 
        charge.documents.filter(doc => doc.fileName !== fileName)
      );
    }
  };

  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
  const difference = lineItemAmount - totalCharges;

  const handleSave = () => {
    onSave(charges);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Charge Breakdown - {lineItemDescription}</DialogTitle>
          <div className="text-sm text-muted-foreground">
            Total Amount: £{lineItemAmount.toLocaleString()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-semibold">£{totalCharges.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Charges</div>
            </div>
            <div className="text-center">
              <div className={`text-lg font-semibold ${difference === 0 ? 'text-green-600' : difference > 0 ? 'text-orange-600' : 'text-red-600'}`}>
                £{Math.abs(difference).toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {difference === 0 ? 'Balanced' : difference > 0 ? 'Remaining' : 'Over Budget'}
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{charges.length}</div>
              <div className="text-sm text-muted-foreground">Charges</div>
            </div>
          </div>

          {/* Charges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Individual Charges</h3>
              <Button onClick={addCharge} variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Charge
              </Button>
            </div>

            {charges.map((charge, index) => (
              <div key={charge.id} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Charge {index + 1}</h4>
                  {charges.length > 1 && (
                    <Button
                      onClick={() => removeCharge(charge.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`description-${charge.id}`}>Description</Label>
                    <Textarea
                      id={`description-${charge.id}`}
                      placeholder="Charge description..."
                      value={charge.description}
                      onChange={(e) => updateCharge(charge.id, 'description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`category-${charge.id}`}>Category</Label>
                    <Input
                      id={`category-${charge.id}`}
                      placeholder="e.g. Maintenance, Utilities..."
                      value={charge.category}
                      onChange={(e) => updateCharge(charge.id, 'category', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`amount-${charge.id}`}>Amount</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                      <Input
                        id={`amount-${charge.id}`}
                        type="number"
                        placeholder="0.00"
                        value={charge.amount || ''}
                        onChange={(e) => updateCharge(charge.id, 'amount', parseFloat(e.target.value) || 0)}
                        className="pl-6"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div className="space-y-2">
                  <Label>Supporting Documents</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.multiple = false;
                        input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) handleFileUpload(charge.id, files);
                        };
                        input.click();
                      }}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      PDF, DOC, JPG, PNG files
                    </span>
                  </div>

                  {charge.documents.length > 0 && (
                    <div className="space-y-2">
                      {charge.documents.map((doc) => (
                        <div key={doc.fileName} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doc.fileName}</span>
                          </div>
                          <Button
                            onClick={() => removeDocument(charge.id, doc.fileName)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Charges
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChargeBreakdownForm;