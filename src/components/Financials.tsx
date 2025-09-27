import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Plus, Edit2, Save, X, Trash2, Calendar, ChevronDown, ChevronRight, Upload, Paperclip, Receipt } from 'lucide-react';
import ChargeBreakdownForm from './ChargeBreakdownForm';

interface FinancialsProps {
  emptyDataMode?: boolean;
}

interface Charge {
  id: string;
  description: string;
  amount: number;
  category: string;
  documents: { fileName: string; fileUrl: string }[];
}

interface BudgetLineItem {
  id: string;
  description: string;
  amount: number;
}

interface LineItem {
  id: string;
  description: string;
  amount: number;
  attachments?: { fileName: string; fileUrl: string }[];
  charges?: Charge[];
}

interface MonthData {
  id: string;
  month: string;
  lineItems: LineItem[];
  status: 'draft' | 'uploaded';
}

const Financials = ({ emptyDataMode }: FinancialsProps) => {
  const [activeTab, setActiveTab] = useState('monthly');
  const [showAddMonth, setShowAddMonth] = useState(false);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newMonthName, setNewMonthName] = useState('');
  const [newYear, setNewYear] = useState('');
  const [editingMonth, setEditingMonth] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [currentYear, setCurrentYear] = useState<string>('');
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  const [chargeBreakdownOpen, setChargeBreakdownOpen] = useState(false);
  const [selectedLineItem, setSelectedLineItem] = useState<{monthId: string, lineItemId: string} | null>(null);

  // Load data from localStorage or set defaults
  const [monthsByYear, setMonthsByYear] = useState<Record<string, MonthData[]>>({});
  const [budgetByYear, setBudgetByYear] = useState<Record<string, number>>({});
  const [budgetLineItemsByYear, setBudgetLineItemsByYear] = useState<Record<string, BudgetLineItem[]>>({});
  const [budgetDocumentsByYear, setBudgetDocumentsByYear] = useState<Record<string, { fileName: string; fileUrl: string }[]>>({});
  const [tempBudget, setTempBudget] = useState<number>(0);
  const [editingBudgetItems, setEditingBudgetItems] = useState(false);

  useEffect(() => {
    // Load or migrate data
    const savedMonthsByYear = localStorage.getItem('financials_months_by_year');
    const savedBudgetByYear = localStorage.getItem('financials_budget_by_year');
    const savedBudgetLineItems = localStorage.getItem('financials_budget_line_items_by_year');
    const savedBudgetDocuments = localStorage.getItem('financials_budget_documents_by_year');
    
    // Migration from old format
    const oldMonths = localStorage.getItem('financials_months');
    const oldBudget = localStorage.getItem('financials_annual_budget');
    
    let initialMonthsByYear: Record<string, MonthData[]> = {};
    let initialBudgetByYear: Record<string, number> = {};
    let initialBudgetLineItems: Record<string, BudgetLineItem[]> = {};
    let initialBudgetDocuments: Record<string, { fileName: string; fileUrl: string }[]> = {};
    let detectedYear = new Date().getFullYear().toString();

    if (savedMonthsByYear) {
      initialMonthsByYear = JSON.parse(savedMonthsByYear);
    } else if (oldMonths) {
      // Migrate old data
      const oldMonthsData = JSON.parse(oldMonths);
      detectedYear = '2024'; // Default year for migration
      initialMonthsByYear[detectedYear] = oldMonthsData;
      localStorage.removeItem('financials_months');
    }

    if (savedBudgetByYear) {
      initialBudgetByYear = JSON.parse(savedBudgetByYear);
    } else if (oldBudget) {
      // Migrate old budget
      initialBudgetByYear[detectedYear] = parseFloat(oldBudget);
      localStorage.removeItem('financials_annual_budget');
    }

    if (savedBudgetLineItems) {
      initialBudgetLineItems = JSON.parse(savedBudgetLineItems);
    }

    if (savedBudgetDocuments) {
      initialBudgetDocuments = JSON.parse(savedBudgetDocuments);
    }

    // Set default year if no data exists
    if (Object.keys(initialMonthsByYear).length === 0) {
      initialMonthsByYear[detectedYear] = [];
      initialBudgetByYear[detectedYear] = 120000;
      initialBudgetLineItems[detectedYear] = [];
      initialBudgetDocuments[detectedYear] = [];
    }

    // Detect current year from existing data
    const years = Object.keys(initialMonthsByYear);
    if (years.length > 0) {
      detectedYear = years[years.length - 1]; // Use most recent year
    }

    setMonthsByYear(initialMonthsByYear);
    setBudgetByYear(initialBudgetByYear);
    setBudgetLineItemsByYear(initialBudgetLineItems);
    setBudgetDocumentsByYear(initialBudgetDocuments);
    setCurrentYear(detectedYear);
    setTempBudget(initialBudgetByYear[detectedYear] || 120000);
  }, []);

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem('financials_months_by_year', JSON.stringify(monthsByYear));
    localStorage.setItem('financials_budget_by_year', JSON.stringify(budgetByYear));
    localStorage.setItem('financials_budget_line_items_by_year', JSON.stringify(budgetLineItemsByYear));
    localStorage.setItem('financials_budget_documents_by_year', JSON.stringify(budgetDocumentsByYear));
  }, [monthsByYear, budgetByYear, budgetLineItemsByYear, budgetDocumentsByYear]);

  // Always show functional interface with manual add capabilities

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentMonths = () => monthsByYear[currentYear] || [];
  const getCurrentBudget = () => budgetByYear[currentYear] || 0;

  const getTotalSpent = () => {
    return getCurrentMonths().reduce((total, month) => {
      return total + month.lineItems.reduce((monthTotal, item) => monthTotal + item.amount, 0);
    }, 0);
  };

  const addYear = () => {
    if (newYear && !monthsByYear[newYear]) {
      setMonthsByYear(prev => ({ ...prev, [newYear]: [] }));
      setBudgetByYear(prev => ({ ...prev, [newYear]: 120000 }));
      setBudgetLineItemsByYear(prev => ({ ...prev, [newYear]: [] }));
      setBudgetDocumentsByYear(prev => ({ ...prev, [newYear]: [] }));
      setCurrentYear(newYear);
      setTempBudget(120000);
      setNewYear('');
      setShowAddYear(false);
    }
  };

  const addMonth = () => {
    if (newMonthName.trim()) {
      const newMonth: MonthData = {
        id: Date.now().toString(),
        month: newMonthName.trim(),
        lineItems: [],
        status: 'draft'
      };
      
      setMonthsByYear(prev => ({
        ...prev,
        [currentYear]: [...getCurrentMonths(), newMonth]
      }));
      setNewMonthName('');
      setShowAddMonth(false);
    }
  };

  const addLineItem = (monthId: string) => {
    const newLineItem: LineItem = {
      id: Date.now().toString(),
      description: '',
      amount: 0,
      attachments: [],
      charges: []
    };

    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === monthId
          ? { ...month, lineItems: [...month.lineItems, newLineItem] }
          : month
      )
    }));
  };

  const updateLineItem = (monthId: string, lineItemId: string, field: 'description' | 'amount', value: string | number) => {
    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === monthId
          ? {
              ...month,
              lineItems: month.lineItems.map(item =>
                item.id === lineItemId ? { ...item, [field]: value } : item
              )
            }
          : month
      )
    }));
  };

  const removeLineItem = (monthId: string, lineItemId: string) => {
    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === monthId
          ? {
              ...month,
              lineItems: month.lineItems.filter(item => item.id !== lineItemId)
            }
          : month
      )
    }));
  };

  const saveMonth = (monthId: string) => {
    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === monthId ? { ...month, status: 'uploaded' } : month
      )
    }));
    setEditingMonth(null);
  };

  const saveBudget = () => {
    setBudgetByYear(prev => ({ ...prev, [currentYear]: tempBudget }));
    setEditingBudget(false);
  };

  const cancelBudgetEdit = () => {
    setTempBudget(getCurrentBudget());
    setEditingBudget(false);
  };

  const totalSpent = getTotalSpent();
  const totalBudget = getCurrentBudget();
  const remaining = totalBudget - totalSpent;
  const percentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  const availableYears = Object.keys(monthsByYear).sort();

  const handleYearSelect = (value: string) => {
    if (value === 'add-year') {
      setShowAddYear(true);
    } else {
      setCurrentYear(value);
      setTempBudget(budgetByYear[value] || 120000);
    }
  };

  const handleFileUpload = (monthId: string, lineItemId: string, files: FileList) => {
    const file = files[0];
    if (!file) return;

    // In a real app, you would upload to a server and get back a URL
    // For demo purposes, we'll create a mock URL
    const mockFileUrl = URL.createObjectURL(file);
    const attachment = {
      fileName: file.name,
      fileUrl: mockFileUrl
    };

    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === monthId
          ? {
              ...month,
              lineItems: month.lineItems.map(item =>
                item.id === lineItemId 
                  ? { ...item, attachments: [...(item.attachments || []), attachment] }
                  : item
              )
            }
          : month
      )
    }));
  };

  const removeAttachment = (monthId: string, lineItemId: string, fileName: string) => {
    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === monthId
          ? {
              ...month,
              lineItems: month.lineItems.map(item =>
                item.id === lineItemId 
                  ? { ...item, attachments: (item.attachments || []).filter(att => att.fileName !== fileName) }
                  : item
              )
            }
          : month
      )
    }));
  };

  const openChargeBreakdown = (monthId: string, lineItemId: string) => {
    setSelectedLineItem({ monthId, lineItemId });
    setChargeBreakdownOpen(true);
  };

  const saveCharges = (charges: Charge[]) => {
    if (!selectedLineItem) return;

    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === selectedLineItem.monthId
          ? {
              ...month,
              lineItems: month.lineItems.map(item =>
                item.id === selectedLineItem.lineItemId 
                  ? { ...item, charges }
                  : item
              )
            }
          : month
      )
    }));
    setSelectedLineItem(null);
  };

  const getSelectedLineItem = () => {
    if (!selectedLineItem) return null;
    const month = getCurrentMonths().find(m => m.id === selectedLineItem.monthId);
    return month?.lineItems.find(item => item.id === selectedLineItem.lineItemId);
  };

  const addBudgetLineItem = () => {
    const newItem: BudgetLineItem = {
      id: Date.now().toString(),
      description: '',
      amount: 0
    };
    setBudgetLineItemsByYear(prev => ({
      ...prev,
      [currentYear]: [...(prev[currentYear] || []), newItem]
    }));
  };

  const updateBudgetLineItem = (itemId: string, field: 'description' | 'amount', value: string | number) => {
    setBudgetLineItemsByYear(prev => ({
      ...prev,
      [currentYear]: (prev[currentYear] || []).map(item =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeBudgetLineItem = (itemId: string) => {
    setBudgetLineItemsByYear(prev => ({
      ...prev,
      [currentYear]: (prev[currentYear] || []).filter(item => item.id !== itemId)
    }));
  };

  const handleBudgetDocumentUpload = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Create a mock URL for demo purposes
    const mockFileUrl = URL.createObjectURL(file);
    const document = {
      fileName: file.name,
      fileUrl: mockFileUrl
    };

    setBudgetDocumentsByYear(prev => ({
      ...prev,
      [currentYear]: [...(prev[currentYear] || []), document]
    }));
  };

  const removeBudgetDocument = (fileName: string) => {
    setBudgetDocumentsByYear(prev => ({
      ...prev,
      [currentYear]: (prev[currentYear] || []).filter(doc => doc.fileName !== fileName)
    }));
  };

  const getBudgetTotal = () => {
    return (budgetLineItemsByYear[currentYear] || []).reduce((sum, item) => sum + item.amount, 0);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Financial Management</h2>
        <p className="text-muted-foreground">Track monthly expenses and manage annual budgets</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="monthly">Monthly Spending</TabsTrigger>
          <TabsTrigger value="annual">Annual Budget</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          {/* Simple Header with Year Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold">Monthly Spending</h3>
              <Select value={currentYear} onValueChange={handleYearSelect}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                  <SelectItem value="add-year">Add Year...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddMonth(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Month
            </Button>
          </div>

          {/* Simple Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-foreground">£{totalSpent.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Spent ({currentYear})</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-lg font-semibold text-foreground">
                  £{getCurrentMonths().length > 0 ? Math.round(totalSpent / getCurrentMonths().length).toLocaleString() : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Monthly Average</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className={`text-lg font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  £{remaining.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Budget Remaining</div>
              </CardContent>
            </Card>
          </div>

          {/* Simple Month Cards */}
          <div className="space-y-3">
            {getCurrentMonths().map((month) => {
              const monthTotal = month.lineItems.reduce((sum, item) => sum + item.amount, 0);
              const isExpanded = expandedMonths.has(month.id);
              
              return (
                <Card key={month.id} className="border border-border">
                  <Collapsible 
                    open={isExpanded}
                    onOpenChange={(open) => {
                      const newSet = new Set(expandedMonths);
                      if (open) {
                        newSet.add(month.id);
                      } else {
                        newSet.delete(month.id);
                      }
                      setExpandedMonths(newSet);
                    }}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <div>
                            <CardTitle className="text-lg font-medium">{month.month}</CardTitle>
                            <Badge variant="outline" className={`text-xs ${getStatusColor(month.status)}`}>
                              {month.status === 'uploaded' ? 'Saved' : 'Draft'}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-foreground">
                          £{monthTotal.toLocaleString()}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-4 pt-0 bg-muted/20">
                        <div className="flex justify-between items-center pb-3 border-b border-border/50">
                          <span className="text-sm text-muted-foreground">
                            {month.lineItems.length} line items
                          </span>
                          <div className="flex gap-2">
                            {editingMonth === month.id ? (
                              <>
                                <Button onClick={() => saveMonth(month.id)} size="sm" className="h-8">
                                  <Save className="h-3 w-3 mr-1" />
                                  Save
                                </Button>
                                <Button onClick={() => setEditingMonth(null)} variant="outline" size="sm" className="h-8">
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <Button onClick={() => setEditingMonth(month.id)} variant="outline" size="sm" className="h-8">
                                <Edit2 className="h-3 w-3 mr-1" />
                                Edit
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        {month.lineItems.map((item) => (
                          <div key={item.id} className="space-y-2">
                            <div className="flex gap-2 items-center">
                              <Input
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => updateLineItem(month.id, item.id, 'description', e.target.value)}
                                disabled={editingMonth !== month.id}
                                className="flex-1"
                              />
                              <div className="relative w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.amount || ''}
                                  onChange={(e) => updateLineItem(month.id, item.id, 'amount', parseFloat(e.target.value) || 0)}
                                  disabled={editingMonth !== month.id}
                                  className="pl-6 text-right"
                                />
                              </div>
                               <Button 
                                 onClick={() => openChargeBreakdown(month.id, item.id)}
                                 variant="outline" 
                                 size="sm"
                                 title="Add more info and upload invoices"
                                 className="text-blue-600 hover:text-blue-700 px-3"
                               >
                                 <Plus className="h-4 w-4 mr-1" />
                                 Add more info
                               </Button>
                               {editingMonth === month.id && (
                                 <>
                                   <Button 
                                     onClick={() => {
                                       const input = document.createElement('input');
                                       input.type = 'file';
                                       input.accept = '.pdf,.jpg,.jpeg,.png,.doc,.docx';
                                       input.onchange = (e) => {
                                         const files = (e.target as HTMLInputElement).files;
                                         if (files) handleFileUpload(month.id, item.id, files);
                                       };
                                       input.click();
                                     }}
                                     variant="outline" 
                                     size="sm"
                                     title="Upload invoice/quote"
                                   >
                                     <Upload className="h-4 w-4" />
                                   </Button>
                                   <Button 
                                     onClick={() => removeLineItem(month.id, item.id)}
                                     variant="outline" 
                                     size="sm"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </>
                               )}
                            </div>
                            
                             {/* Charges summary */}
                             {item.charges && item.charges.length > 0 && (
                               <div className="ml-4 text-xs text-muted-foreground">
                                 <span className="text-blue-600 font-medium">
                                   {item.charges.length} charge{item.charges.length !== 1 ? 's' : ''} • 
                                   £{item.charges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString()} breakdown
                                 </span>
                               </div>
                             )}

                             {/* Attachments display */}
                             {item.attachments && item.attachments.length > 0 && (
                               <div className="ml-4 space-y-1">
                                 {item.attachments.map((attachment, index) => (
                                   <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                     <Paperclip className="h-3 w-3" />
                                     <span className="flex-1">{attachment.fileName}</span>
                                     {editingMonth === month.id && (
                                       <Button
                                         onClick={() => removeAttachment(month.id, item.id, attachment.fileName)}
                                         variant="ghost"
                                         size="sm"
                                         className="h-6 w-6 p-0"
                                       >
                                         <X className="h-3 w-3" />
                                       </Button>
                                     )}
                                   </div>
                                 ))}
                               </div>
                             )}
                          </div>
                        ))}
                        
                        {editingMonth === month.id && (
                          <Button 
                            onClick={() => addLineItem(month.id)}
                            variant="outline" 
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Line Item
                          </Button>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="annual" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">Annual Budget - {currentYear}</h3>
              <Select value={currentYear} onValueChange={handleYearSelect}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                  <SelectItem value="add-year">Add Year...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddYear(true)} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Start New Year
            </Button>
          </div>

          {/* Budget vs Actual Spend */}
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget vs Actual Spend</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Compare your annual budget against actual monthly spending
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-foreground">£{totalBudget.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Annual Budget</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-foreground">£{totalSpent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Actual Spend</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className={`text-2xl font-bold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      £{remaining.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {remaining >= 0 ? 'Remaining' : 'Over Budget'}
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Budget Usage</span>
                    <span>{Math.round(percentageUsed)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        percentageUsed > 100 ? 'bg-red-500' : percentageUsed > 90 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Annual Budget Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Annual Budget</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    This will be used as the total against the items in your monthly spending. Add your budget items for the upcoming or previous year(s). You can also upload your budget document for easy reference whenever needed.
                  </p>
                </div>
                <div className="flex gap-2">
                  {editingBudget ? (
                    <>
                      <Button onClick={saveBudget} size="sm">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button onClick={cancelBudgetEdit} variant="outline" size="sm">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditingBudget(true)} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit Budget
                    </Button>
                  )}
                  {editingBudgetItems ? (
                    <Button onClick={() => setEditingBudgetItems(false)} size="sm">
                      <Save className="h-4 w-4 mr-1" />
                      Done
                    </Button>
                  ) : (
                    <Button onClick={() => setEditingBudgetItems(true)} variant="outline" size="sm">
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit Items
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Annual Budget Total */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Annual Budget Total</h4>
                    <div className="text-xs text-muted-foreground">Click to edit</div>
                  </div>
                  {editingBudget ? (
                    <div className="relative w-48">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">£</span>
                      <Input
                        type="number"
                        value={tempBudget || ''}
                        onChange={(e) => setTempBudget(parseFloat(e.target.value) || 0)}
                        className="pl-6 text-2xl font-bold text-right"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <div 
                      className="text-3xl font-bold cursor-pointer hover:bg-muted/30 p-2 rounded transition-colors"
                      onClick={() => setEditingBudget(true)}
                    >
                      £{totalBudget.toLocaleString()}
                    </div>
                  )}
                </div>
                {/* Budget Document Upload */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Budget Documents</h4>
                    <Button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = '.pdf,.xlsx,.xls,.doc,.docx';
                        input.onchange = (e) => {
                          const files = (e.target as HTMLInputElement).files;
                          if (files) handleBudgetDocumentUpload(files);
                        };
                        input.click();
                      }}
                      variant="outline" 
                      size="sm"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Budget
                    </Button>
                  </div>
                  {budgetDocumentsByYear[currentYear] && budgetDocumentsByYear[currentYear].length > 0 ? (
                    <div className="space-y-2">
                      {budgetDocumentsByYear[currentYear].map((doc, index) => (
                        <div key={index} className="flex items-center justify-between bg-background rounded px-3 py-2">
                          <div className="flex items-center gap-2">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doc.fileName}</span>
                          </div>
                          <Button
                            onClick={() => removeBudgetDocument(doc.fileName)}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No budget documents uploaded</p>
                  )}
                </div>

                {/* Manual Budget Items */}
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Budget Line Items</h4>
                    {budgetLineItemsByYear[currentYear] && budgetLineItemsByYear[currentYear].length > 0 && (
                      <span className="text-sm text-muted-foreground">
                        Total: £{getBudgetTotal().toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  {budgetLineItemsByYear[currentYear] && budgetLineItemsByYear[currentYear].length > 0 ? (
                    <div className="space-y-3">
                      {budgetLineItemsByYear[currentYear].map((item) => (
                        <div key={item.id} className="flex gap-2 items-center">
                          <Input
                            placeholder="Budget item description"
                            value={item.description}
                            onChange={(e) => updateBudgetLineItem(item.id, 'description', e.target.value)}
                            disabled={!editingBudgetItems}
                            className="flex-1"
                          />
                          <div className="relative w-32">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                            <Input
                              type="number"
                              placeholder="0"
                              value={item.amount || ''}
                              onChange={(e) => updateBudgetLineItem(item.id, 'amount', parseFloat(e.target.value) || 0)}
                              disabled={!editingBudgetItems}
                              className="pl-6 text-right"
                            />
                          </div>
                          {editingBudgetItems && (
                            <Button 
                              onClick={() => removeBudgetLineItem(item.id)}
                              variant="outline" 
                              size="sm"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      
                      {editingBudgetItems && (
                        <Button 
                          onClick={addBudgetLineItem}
                          variant="outline" 
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Budget Item
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground mb-3">No budget items added yet</p>
                      <Button onClick={addBudgetLineItem} variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Budget Item
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </TabsContent>
      </Tabs>

      {/* Add Month Dialog */}
      <Dialog open={showAddMonth} onOpenChange={setShowAddMonth}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Month</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Month name (e.g., January 2024)"
              value={newMonthName}
              onChange={(e) => setNewMonthName(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={addMonth} className="flex-1">Add Month</Button>
              <Button onClick={() => setShowAddMonth(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Year Dialog */}
      <Dialog open={showAddYear} onOpenChange={setShowAddYear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Year</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Year (e.g., 2025)"
              value={newYear}
              onChange={(e) => setNewYear(e.target.value)}
            />
            <div className="flex gap-2">
              <Button onClick={addYear} className="flex-1">Create Year</Button>
              <Button onClick={() => setShowAddYear(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Charge Breakdown Form */}
      {selectedLineItem && (
        <ChargeBreakdownForm
          open={chargeBreakdownOpen}
          onOpenChange={setChargeBreakdownOpen}
          lineItemDescription={getSelectedLineItem()?.description || ''}
          lineItemAmount={getSelectedLineItem()?.amount || 0}
          onSave={saveCharges}
          initialCharges={getSelectedLineItem()?.charges || []}
        />
      )}
    </div>
  );
};

export default Financials;