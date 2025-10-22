import React, { useState, useEffect, useCallback } from 'react';
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
import { useFinance } from '@/hooks/useFinance';
import { toast } from 'sonner';

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
  const [activeTab, setActiveTab] = useState('annual');
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
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [yearToFinanceId, setYearToFinanceId] = useState<Record<string, number>>({});
  const [apiBudgetData, setApiBudgetData] = useState<{
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
    percentageSpent: number;
  } | null>(null);
  const [apiMonthlyData, setApiMonthlyData] = useState<{
    monthlyExpenses: Array<{
      id: number;
      month: string;
      totalSpent: number;
      totalItems: number;
      items: Array<{
        id: number;
        category: string;
        itemName: string;
        description: string;
        amount: number;
      }>;
    }>;
  } | null>(null);
  const { fetchAnnualBudget, createAnnualBudget, updateAnnualBudget, fetchMonthlyFinance, saveLineItem, fetchAvailableYears, isLoading: isFinanceLoading } = useFinance();

  useEffect(() => {
    // Load or migrate data
    const savedMonthsByYear = localStorage.getItem('financials_months_by_year');
    const savedBudgetByYear = localStorage.getItem('financials_budget_by_year');
    const savedBudgetLineItems = localStorage.getItem('financials_budget_line_items_by_year');
    const savedBudgetDocuments = localStorage.getItem('financials_budget_documents_by_year');
    
    // Migration from old format
    const oldMonths = localStorage.getItem('financials_months');
    const oldBudget = localStorage.getItem('financials_annual_budget');
    
    const initialMonthsByYear: Record<string, MonthData[]> = {};
    const initialBudgetByYear: Record<string, number> = {};
    const initialBudgetLineItems: Record<string, BudgetLineItem[]> = {};
    const initialBudgetDocuments: Record<string, { fileName: string; fileUrl: string }[]> = {};
    let detectedYear = new Date().getFullYear().toString();

    if (savedMonthsByYear) {
      const parsedData = JSON.parse(savedMonthsByYear);
      // Clean up invalid years from localStorage
      Object.keys(parsedData).forEach(year => {
        const yearNum = parseInt(year);
        if (yearNum >= 2020 && yearNum <= 2030) {
          initialMonthsByYear[year] = parsedData[year];
        }
      });
    } else if (oldMonths) {
      // Migrate old data
      const oldMonthsData = JSON.parse(oldMonths);
      detectedYear = '2024'; // Default year for migration
      initialMonthsByYear[detectedYear] = oldMonthsData;
      localStorage.removeItem('financials_months');
    }

    if (savedBudgetByYear) {
      const parsedData = JSON.parse(savedBudgetByYear);
      // Clean up invalid years from localStorage
      Object.keys(parsedData).forEach(year => {
        const yearNum = parseInt(year);
        if (yearNum >= 2020 && yearNum <= 2030) {
          initialBudgetByYear[year] = parsedData[year];
        }
      });
    } else if (oldBudget) {
      // Migrate old budget
      initialBudgetByYear[detectedYear] = parseFloat(oldBudget);
      localStorage.removeItem('financials_annual_budget');
    }

    if (savedBudgetLineItems) {
      const parsedData = JSON.parse(savedBudgetLineItems);
      // Clean up invalid years from localStorage
      Object.keys(parsedData).forEach(year => {
        const yearNum = parseInt(year);
        if (yearNum >= 2020 && yearNum <= 2030) {
          initialBudgetLineItems[year] = parsedData[year];
        }
      });
    }

    if (savedBudgetDocuments) {
      const parsedData = JSON.parse(savedBudgetDocuments);
      // Clean up invalid years from localStorage
      Object.keys(parsedData).forEach(year => {
        const yearNum = parseInt(year);
        if (yearNum >= 2020 && yearNum <= 2030) {
          initialBudgetDocuments[year] = parsedData[year];
        }
      });
    }

    // DON'T set default year - let user choose
    // if (Object.keys(initialMonthsByYear).length === 0) {
    //   initialMonthsByYear[detectedYear] = [];
    //   initialBudgetByYear[detectedYear] = 120000;
    //   initialBudgetLineItems[detectedYear] = [];
    //   initialBudgetDocuments[detectedYear] = [];
    // }

    // DON'T detect current year automatically - let user choose
    // const years = Object.keys(initialMonthsByYear);
    // if (years.length > 0) {
    //   // Filter out invalid years (not between 2020 and 2030)
    //   const validYears = years.filter(year => {
    //     const yearNum = parseInt(year);
    //     return yearNum >= 2020 && yearNum <= 2030;
    //   });
    //   
    //   if (validYears.length > 0) {
    //     detectedYear = validYears[validYears.length - 1]; // Use most recent valid year
    //   } else {
    //     // If no valid years found, don't set a default year - let user choose
    //     detectedYear = '';
    //   }
    // }
    
    // Always start with no year selected
    detectedYear = '';

    setMonthsByYear(initialMonthsByYear);
    setBudgetByYear(initialBudgetByYear);
    setBudgetLineItemsByYear(initialBudgetLineItems);
    setBudgetDocumentsByYear(initialBudgetDocuments);
    // DON'T set current year - let user choose
    // setCurrentYear(detectedYear);
    // setTempBudget(initialBudgetByYear[detectedYear] || 120000);

    // Fetch available years from API
    const loadAvailableYears = async () => {
      try {
        const yearsResponse = await fetchAvailableYears();
        console.log('yearsResponseyearsResponse ',yearsResponse)
        if (yearsResponse.success && yearsResponse.data) {
          // Extract year values from the API response objects and create finance ID mapping
          const yearStrings = yearsResponse.data.map(item => item.year.toString());
          const financeIdMapping: Record<string, number> = {};
          
          yearsResponse.data.forEach(item => {
            const yearStr = item.year.toString();
            const yearNum = parseInt(yearStr);
            if (yearNum >= 2020 && yearNum <= 2030) {
              financeIdMapping[yearStr] = item.financeId;
            }
          });
          
          console.log('Extracted year strings from API:', yearStrings);
          console.log('Finance ID mapping:', financeIdMapping);
          
          // Filter out invalid years (not between 2020 and 2030)
          const validApiYears = yearStrings.filter(year => {
            const yearNum = parseInt(year);
            return yearNum >= 2020 && yearNum <= 2030;
          });
          
          console.log('Valid API years after filtering:', validApiYears);
          setAvailableYears(validApiYears.sort());
          setYearToFinanceId(financeIdMapping);
          
          // DON'T set current year automatically - let user choose
          console.log(`Available years from API: ${validApiYears.join(', ')} - user must select manually`);
        } else {
          console.error('Failed to fetch available years:', yearsResponse.error);
          // Fallback to local storage years - NO API calls, NO year selection
          setAvailableYears(Object.keys(initialMonthsByYear).sort());
          console.log(`Available years from localStorage: ${Object.keys(initialMonthsByYear).join(', ')} - user must select manually`);
        }
      } catch (error) {
        console.error('Error fetching available years:', error);
        // Fallback to local storage years - NO API calls, NO year selection
        setAvailableYears(Object.keys(initialMonthsByYear).sort());
        console.log(`Available years from localStorage (error fallback): ${Object.keys(initialMonthsByYear).join(', ')} - user must select manually`);
      }
    };

    loadAvailableYears();
  }, [fetchAvailableYears]);

  useEffect(() => {
    // Save to localStorage whenever data changes
    localStorage.setItem('financials_months_by_year', JSON.stringify(monthsByYear));
    localStorage.setItem('financials_budget_by_year', JSON.stringify(budgetByYear));
    localStorage.setItem('financials_budget_line_items_by_year', JSON.stringify(budgetLineItemsByYear));
    localStorage.setItem('financials_budget_documents_by_year', JSON.stringify(budgetDocumentsByYear));
  }, [monthsByYear, budgetByYear, budgetLineItemsByYear, budgetDocumentsByYear]);

  const loadApiBudgetData = useCallback(async (year: string) => {
    try {
      const budgetResponse = await fetchAnnualBudget(year);
      if (budgetResponse.success && budgetResponse.data) {
        const apiData = budgetResponse.data;
        setApiBudgetData({
          totalBudget: apiData.totalBudget,
          totalSpent: apiData.totalSpent,
          remainingBudget: apiData.remainingBudget,
          percentageSpent: apiData.percentageSpent
        });
        
        // Update tempBudget with the API budget value
        setTempBudget(apiData.totalBudget);
      } else {
        // Show error toast but don't break the UI
        toast.error(budgetResponse.error || 'Failed to load budget data');
        console.error('Budget API error:', budgetResponse.error);
        
        // Fallback to local budget data
        setTempBudget(budgetByYear[year] || 120000);
      }
    } catch (error) {
      console.error('Error loading API budget data:', error);
      toast.error('Failed to load budget data');
      
      // Fallback to local budget data
      setTempBudget(budgetByYear[year] || 120000);
    }
  }, [fetchAnnualBudget, budgetByYear]);

  const loadApiMonthlyData = useCallback(async (year: string) => {
    try {
      const monthlyResponse = await fetchMonthlyFinance(year);
      if (monthlyResponse.success && monthlyResponse.data) {
        const apiData = monthlyResponse.data;
        setApiMonthlyData({
          monthlyExpenses: apiData.monthlyExpenses
        });
      } else {
        // Show error toast but don't break the UI
        toast.error(monthlyResponse.error || 'Failed to load monthly data');
        console.error('Monthly API error:', monthlyResponse.error);
      }
    } catch (error) {
      console.error('Error loading API monthly data:', error);
      toast.error('Failed to load monthly data');
    }
  }, [fetchMonthlyFinance]);

  const getAllMonthsOfYear = (year: string) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return monthNames.map((monthName, index) => {
      const monthKey = monthName.toLowerCase();
      const apiMonthData = apiMonthlyData?.monthlyExpenses.find(m => m.month.toLowerCase() === monthKey);
      
      console.log(`Month: ${monthName}, API data:`, apiMonthData);
      console.log(`Line items for ${monthName}:`, apiMonthData?.items);
      
      return {
        id: `api-${year}-${index}`,
        month: `${monthName} ${year}`,
        lineItems: apiMonthData ? apiMonthData.items.map(item => ({
          id: item.id.toString(),
          description: `${item.itemName}: ${item.description}`,
          amount: item.amount,
          attachments: [],
          charges: []
        })) : [],
        status: apiMonthData ? 'uploaded' : 'draft' as 'draft' | 'uploaded'
      };
    });
  };

  // NO automatic API calls - only call APIs when user explicitly selects a year

  // Auto-expand months that have line items when API data loads
  useEffect(() => {
    if (apiMonthlyData) {
      const monthsWithData = apiMonthlyData.monthlyExpenses.filter(month => month.items.length > 0);
      if (monthsWithData.length > 0) {
        setExpandedMonths(prev => {
          const newExpandedMonths = new Set(prev);
          monthsWithData.forEach(month => {
            const monthIndex = ['january', 'february', 'march', 'april', 'may', 'june',
              'july', 'august', 'september', 'october', 'november', 'december'].indexOf(month.month.toLowerCase());
            if (monthIndex !== -1) {
              newExpandedMonths.add(`api-${currentYear}-${monthIndex}`);
            }
          });
          return newExpandedMonths;
        });
      }
    }
  }, [apiMonthlyData, currentYear]);

  // Always show functional interface with manual add capabilities

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploaded': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCurrentMonths = () => {
    // Always show all 12 months for any year
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Get local modifications for this year
    const localMonths = monthsByYear[currentYear] || [];
    
    // If we have API data, use it; otherwise fall back to local data
    if (apiMonthlyData && apiMonthlyData.monthlyExpenses.length > 0) {
      console.log('Using API monthly data:', apiMonthlyData);
      return monthNames.map((monthName, index) => {
        const monthKey = monthName.toLowerCase();
        const apiMonthData = apiMonthlyData.monthlyExpenses.find(m => m.month.toLowerCase() === monthKey);
        
        // Check if there are local modifications for this month
        const localMonth = localMonths.find(m => m.month.includes(monthName));
        
        if (localMonth) {
          // Use local modifications (which may include API data + new items)
          console.log(`Using local modifications for ${monthName}:`, localMonth);
          return localMonth;
        } else if (apiMonthData) {
          // Use API data
          console.log(`Found API data for ${monthName}:`, apiMonthData);
          return {
            id: `api-${currentYear}-${index}`,
            month: `${monthName} ${currentYear}`,
            lineItems: apiMonthData.items.map(item => ({
              id: item.id.toString(),
              description: `${item.itemName}: ${item.description}`,
              amount: item.amount,
              attachments: [],
              charges: []
            })),
            status: 'uploaded' as 'draft' | 'uploaded'
          };
        } else {
          // No API data for this month, create empty month
          return {
            id: `local-${currentYear}-${index}`,
            month: `${monthName} ${currentYear}`,
            lineItems: [],
            status: 'draft' as 'draft' | 'uploaded'
          };
        }
      });
    } else {
      console.log('No API monthly data, using local data');
      // No API data, use local data
      return monthNames.map((monthName, index) => {
        const existingMonth = localMonths.find(m => m.month.includes(monthName));
        
        return existingMonth || {
          id: `local-${currentYear}-${index}`,
          month: `${monthName} ${currentYear}`,
          lineItems: [],
          status: 'draft' as 'draft' | 'uploaded'
        };
      });
    }
  };
  const getCurrentBudget = () => budgetByYear[currentYear] || 0;

  const getTotalSpent = () => {
    return getCurrentMonths().reduce((total, month) => {
      return total + month.lineItems.reduce((monthTotal, item) => monthTotal + item.amount, 0);
    }, 0);
  };

  const addYear = async () => {
    if (!newYear.trim()) {
      toast.error('Please enter a year');
      return;
    }

    // Validate that the new year is valid
    const yearNum = parseInt(newYear);
    if (yearNum < 2020 || yearNum > 2030) {
      toast.error('Please enter a valid year between 2020 and 2030');
      return;
    }

    // Check if year already exists in availableYears
    if (availableYears.includes(newYear)) {
      toast.error(`Year ${newYear} already exists`);
      return;
    }

    console.log(`Creating new year: ${newYear}`);
      
      try {
        // Try to fetch existing budget from API first
        const budgetResponse = await fetchAnnualBudget(newYear);
        
        if (budgetResponse.success && budgetResponse.data) {
          // Use API data
          const apiData = budgetResponse.data;
          setMonthsByYear(prev => ({ ...prev, [newYear]: [] }));
          setBudgetByYear(prev => ({ ...prev, [newYear]: apiData.totalBudget }));
          setBudgetLineItemsByYear(prev => ({ ...prev, [newYear]: [] }));
          setBudgetDocumentsByYear(prev => ({ ...prev, [newYear]: [] }));
          setCurrentYear(newYear);
          setTempBudget(apiData.totalBudget);
          
          // Update available years list and finance ID mapping
          setAvailableYears(prev => [...prev, newYear].sort());
          setYearToFinanceId(prev => ({ ...prev, [newYear]: apiData.id }));
          
          toast.success(`Year ${newYear} loaded with budget £${apiData.totalBudget.toLocaleString()}`);
        } else {
          // Create new budget with default value
          const createResponse = await createAnnualBudget(newYear, 120000);
          
          if (createResponse.success && createResponse.data) {
            const apiData = createResponse.data;
            setMonthsByYear(prev => ({ ...prev, [newYear]: [] }));
            setBudgetByYear(prev => ({ ...prev, [newYear]: apiData.totalBudget }));
            setBudgetLineItemsByYear(prev => ({ ...prev, [newYear]: [] }));
            setBudgetDocumentsByYear(prev => ({ ...prev, [newYear]: [] }));
            setCurrentYear(newYear);
            setTempBudget(apiData.totalBudget);
            
            // Update available years list and finance ID mapping
            setAvailableYears(prev => [...prev, newYear].sort());
            setYearToFinanceId(prev => ({ ...prev, [newYear]: apiData.id }));
            
            toast.success(`Year ${newYear} created with budget £${apiData.totalBudget.toLocaleString()}`);
          } else {
            // Fallback to local storage if API fails
            setMonthsByYear(prev => ({ ...prev, [newYear]: [] }));
            setBudgetByYear(prev => ({ ...prev, [newYear]: 120000 }));
            setBudgetLineItemsByYear(prev => ({ ...prev, [newYear]: [] }));
            setBudgetDocumentsByYear(prev => ({ ...prev, [newYear]: [] }));
            setCurrentYear(newYear);
            setTempBudget(120000);
            
            // Update available years list (no finance ID for fallback case)
            setAvailableYears(prev => [...prev, newYear].sort());
            
            toast.error(createResponse.error || 'Failed to create year budget, using default values');
          }
        }
        
        setNewYear('');
        setShowAddYear(false);
      } catch (error) {
        console.error('Error adding year:', error);
        toast.error('Failed to add year');
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
    console.log('addLineItem called with monthId:', monthId);
    console.log('Current months before adding:', getCurrentMonths());
    
    // Simply add a new line item to local state
    const newLineItem: LineItem = {
      id: `new-${Date.now().toString()}`,
      description: '',
      amount: 0,
      attachments: [],
      charges: []
    };

    // Extract month name from the monthId
    const monthIndex = parseInt(monthId.split('-')[2]);
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const monthName = monthNames[monthIndex];
    
    console.log(`Adding NEW line item to ${monthName} (index: ${monthIndex})`);
    console.log('New line item ID:', newLineItem.id);
    console.log('This item will be marked as NEW and sent to backend when Save is clicked');
    
    setMonthsByYear(prev => {
      const currentMonths = getCurrentMonths();
      const monthToUpdate = currentMonths.find(m => m.id === monthId);
      
      if (monthToUpdate) {
        const updatedMonth = {
          ...monthToUpdate,
          lineItems: [...monthToUpdate.lineItems, newLineItem]
        };
        
        const updated = {
      ...prev,
          [currentYear]: (prev[currentYear] || []).map(month =>
            month.month.includes(monthName)
              ? updatedMonth
          : month
      )
        };
        
        // If no existing month found, add the new month
        if (!updated[currentYear].some(m => m.month.includes(monthName))) {
          updated[currentYear] = [...updated[currentYear], updatedMonth];
        }
        
        console.log('Updated monthsByYear:', updated);
        console.log('New line item added with ID:', newLineItem.id);
        console.log('Total line items in month after adding:', updatedMonth.lineItems.length);
        return updated;
      }
      return prev;
    });
  };

  const updateLineItem = (monthId: string, lineItemId: string, field: 'description' | 'amount', value: string | number) => {
    // Check if this is an API month
    if (monthId.startsWith('api-')) {
      const monthIndex = parseInt(monthId.split('-')[2]);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[monthIndex];
      
      setMonthsByYear(prev => {
        const currentMonths = getCurrentMonths();
        const monthToUpdate = currentMonths.find(m => m.id === monthId);
        
        if (monthToUpdate) {
          const updatedMonth = {
            ...monthToUpdate,
            lineItems: monthToUpdate.lineItems.map(item =>
              item.id === lineItemId ? { ...item, [field]: value } : item
            )
          };
          
          return {
            ...prev,
            [currentYear]: (prev[currentYear] || []).map(month =>
              month.month.includes(monthName)
                ? updatedMonth
                : month
            )
          };
        }
        return prev;
      });
    } else {
      // For local months, use the existing logic
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
    }
  };

  const removeLineItem = (monthId: string, lineItemId: string) => {
    // Check if this is an API month
    if (monthId.startsWith('api-')) {
      const monthIndex = parseInt(monthId.split('-')[2]);
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthName = monthNames[monthIndex];
      
      setMonthsByYear(prev => {
        const currentMonths = getCurrentMonths();
        const monthToUpdate = currentMonths.find(m => m.id === monthId);
        
        if (monthToUpdate) {
          const updatedMonth = {
            ...monthToUpdate,
            lineItems: monthToUpdate.lineItems.filter(item => item.id !== lineItemId)
          };
          
          return {
            ...prev,
            [currentYear]: (prev[currentYear] || []).map(month =>
              month.month.includes(monthName)
                ? updatedMonth
                : month
            )
          };
        }
        return prev;
      });
    } else {
      // For local months, use the existing logic
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
    }
  };

  const saveMonth = async (monthId: string) => {
    // Extract month index from monthId (e.g., "api-2025-6" -> 6 -> monthId = 7 for July)
    const monthIndex = parseInt(monthId.split('-')[2]);
    
    // Month ID should be 1-based (1 for January, 2 for February, etc.)
    const apiMonthId = monthIndex + 1;
    
    console.log(`Saving month: (index: ${monthIndex}, API monthId: ${apiMonthId})`);
    
    // Get finance ID for current year
    const financeId = yearToFinanceId[currentYear];
    console.log('Finance ID lookup:', {
      currentYear,
      yearToFinanceId,
      financeId
    });
    
    if (!financeId) {
      toast.error(`No finance ID found for year ${currentYear}. Please refresh the page or recreate the year.`);
      console.error('Missing finance ID for year:', currentYear, 'Available mappings:', yearToFinanceId);
      return;
    }
    
    // Find the month data
    const monthData = getCurrentMonths().find(m => m.id === monthId);
    if (monthData) {
      console.log('Month data to save:', monthData);
      console.log('All line items:', monthData.lineItems);
      
      // ONLY filter for NEW line items (those with IDs starting with 'new-')
      const newLineItems = monthData.lineItems
        .filter(item => {
          const isNew = item.id.startsWith('new-');
          console.log(`Line item ${item.id}: isNew=${isNew}, description="${item.description}", amount=${item.amount}`);
          return isNew;
        })
        .map(item => ({
          itemName: item.description.split(':')[0]?.trim() || 'New Item',
          category: 'General',
          description: item.description.split(':')[1]?.trim() || item.description || '',
          amount: item.amount || 0
        }));
      
      console.log(`Filtered new line items:`, newLineItems);
      console.log(`Total new items to save: ${newLineItems.length}`);
      
      if (newLineItems.length === 0) {
        toast.info('No new line items to save');
        return;
      }
      
      console.log(`Saving ONLY ${newLineItems.length} NEW line items to API:`, newLineItems);
      
      try {
        const response = await saveLineItem(financeId, apiMonthId.toString(), newLineItems);
        if (!response.success) {
          toast.error(`Failed to save line items: ${response.error}`);
          return;
        }
        console.log('Line items saved successfully:', response);
        
        // Update local state to mark as uploaded and change item IDs from 'new-' to saved IDs
    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
            month.id === monthId ? { 
              ...month, 
              status: 'uploaded',
              lineItems: month.lineItems.map(item => {
                // If this was a new item, update its ID to reflect it's now saved
                if (item.id.startsWith('new-')) {
                  // Generate a new ID that doesn't start with 'new-' to indicate it's saved
                  return { ...item, id: `saved-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
                }
                return item;
              })
            } : month
      )
    }));
        
    setEditingMonth(null);
        toast.success(`${newLineItems.length} new line items saved successfully!`);
      } catch (error) {
        console.error('Error saving line items:', error);
        toast.error('Failed to save line items');
      }
    }
  };

  const saveBudget = async () => {
    try {
      // Call API to update budget using the hook function
      const response = await updateAnnualBudget(currentYear, tempBudget);
      
      if (response.success) {
        // Update local state
    setBudgetByYear(prev => ({ ...prev, [currentYear]: tempBudget }));
    setEditingBudget(false);
        
        // Reload API budget data to get updated values
        await loadApiBudgetData(currentYear);
        
        toast.success('Budget updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update budget');
      }
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error('Failed to update budget');
    }
  };

  const cancelBudgetEdit = () => {
    setTempBudget(getCurrentBudget());
    setEditingBudget(false);
  };

  const totalSpent = apiBudgetData?.totalSpent ?? getTotalSpent();
  const totalBudget = apiBudgetData?.totalBudget ?? getCurrentBudget();
  const remaining = apiBudgetData?.remainingBudget ?? (totalBudget - totalSpent);
  const percentageUsed = apiBudgetData?.percentageSpent ?? (totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0);

  const handleYearSelect = async (value: string) => {
    if (value === 'add-year') {
      setShowAddYear(true);
    } else {
      // Validate that the selected year is valid
      const yearNum = parseInt(value);
      if (yearNum < 2020 || yearNum > 2030) {
        toast.error('Please select a valid year between 2020 and 2030');
        return;
      }
      
      console.log(`User explicitly selected year: ${value}`);
      setCurrentYear(value);
      
      // Only call APIs when user explicitly selects a year
      if (availableYears.includes(value)) {
        console.log(`Calling APIs for selected year: ${value}`);
        try {
          await loadApiBudgetData(value);
          await loadApiMonthlyData(value);
      } catch (error) {
          console.error('Error loading data for year:', value, error);
          toast.error('Failed to load data for selected year');
          // Fallback to local budget if API fails
          setTempBudget(budgetByYear[value] || 120000);
        }
      } else {
        console.log(`Year ${value} not in availableYears, using local data only`);
        setTempBudget(budgetByYear[value] || 120000);
      }
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

  const saveLineItemChanges = async (updatedData: { description: string; amount: number; category: string }) => {
    if (!selectedLineItem) return;

    const lineItem = getSelectedLineItem();
    if (!lineItem) return;

    // Find the month to check its status
    const month = getCurrentMonths().find(m => m.id === selectedLineItem.monthId);
    const isDraftMonth = month?.status === 'draft';
    const isNewItem = lineItem.id.startsWith('new-');
    
    console.log('Save line item changes:', {
      monthStatus: month?.status,
      isDraftMonth,
      isNewItem,
      updatedData,
      originalDescription: lineItem.description,
      newDescription: `${updatedData.category}: ${updatedData.description}`
    });
    
    if (isDraftMonth && isNewItem) {
      // For new items in draft months, call saveLineItem API
      const monthIndex = parseInt(selectedLineItem.monthId.split('-')[2]);
      const apiMonthId = monthIndex + 1;
      const financeId = yearToFinanceId[currentYear];
      
      if (!financeId) {
        toast.error(`No finance ID found for year ${currentYear}`);
        return;
      }
      
      const lineItemData = [{
        itemName: updatedData.description.split(':')[0]?.trim() || updatedData.description || 'New Item',
        category: updatedData.category || 'General',
        description: updatedData.description.split(':')[1]?.trim() || updatedData.description || '',
        amount: updatedData.amount || 0
      }];
      
      console.log('Saving new line item via API:', {
        financeId,
        apiMonthId,
        lineItemData,
        originalDescription: updatedData.description,
        extractedCategory: updatedData.category,
        extractedItemName: updatedData.description.split(':')[0]?.trim(),
        extractedDescription: updatedData.description.split(':')[1]?.trim()
      });
      
      try {
        const response = await saveLineItem(financeId, apiMonthId.toString(), lineItemData);
        if (response.success) {
          // Update local state with the new data including category
    setMonthsByYear(prev => ({
      ...prev,
      [currentYear]: getCurrentMonths().map(month =>
        month.id === selectedLineItem.monthId
          ? {
              ...month,
              lineItems: month.lineItems.map(item =>
                item.id === selectedLineItem.lineItemId 
                        ? { 
                            ...item, 
                            description: `${updatedData.category}: ${updatedData.description}`,
                            amount: updatedData.amount 
                          }
                  : item
              )
            }
          : month
      )
    }));
          
          toast.success('Line item saved successfully!');
        } else {
          toast.error(`Failed to save line item: ${response.error}`);
        }
      } catch (error) {
        console.error('Error saving line item:', error);
        toast.error('Failed to save line item');
      }
    } else {
      // For existing items (saved status), just update local state
      setMonthsByYear(prev => ({
        ...prev,
        [currentYear]: getCurrentMonths().map(month =>
          month.id === selectedLineItem.monthId
            ? {
                ...month,
                lineItems: month.lineItems.map(item =>
                  item.id === selectedLineItem.lineItemId 
                    ? { 
                        ...item, 
                        description: `${updatedData.category}: ${updatedData.description}`,
                        amount: updatedData.amount 
                      }
                    : item
                )
              }
            : month
        )
      }));
      
      toast.success('Line item updated locally');
    }
    
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
        <TabsTrigger value="annual">Annual Budget</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Spending</TabsTrigger>
         
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          {/* Simple Header with Year Selection */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold">Monthly Spending</h3>
              <Select value={currentYear || ""} onValueChange={handleYearSelect}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent className="bg-background border z-50">
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                  <SelectItem value="add-year">Add Year...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* <Button onClick={() => setShowAddMonth(true)} className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Month
            </Button> */}
          </div>

          {/* Show message when no year is selected */}
          {!currentYear && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Year Selected</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Please select a year from the dropdown above or add a new year to start managing your finances.
                </p>
                <Button onClick={() => setShowAddYear(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Year
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Only show summary cards and month cards when a year is selected */}
          {currentYear && (
            <>
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
              
              console.log('Month expand/collapse:', {
                monthId: month.id,
                monthName: month.month,
                status: month.status,
                isExpanded,
                expandedMonths: Array.from(expandedMonths)
              });
              
              return (
                <Card key={month.id} className="border border-border">
                  <Collapsible 
                    open={isExpanded}
                    onOpenChange={(open) => {
                      console.log('Collapsible onOpenChange:', {
                        monthId: month.id,
                        monthName: month.month,
                        open,
                        currentExpanded: expandedMonths.has(month.id)
                      });
                      
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
                        
                        {month.lineItems.map((item) => {
                          const isNewItem = item.id.startsWith('new-');
                          const isExistingItem = !isNewItem; // This includes both API items and locally saved items
                          
                          console.log('Line item status:', {
                            itemId: item.id,
                            description: item.description,
                            amount: item.amount,
                            isNewItem,
                            isExistingItem
                          });
                          
                          return (
                            <div key={item.id} className={`space-y-2 ${isExistingItem ? 'opacity-60' : ''}`}>
                            <div className="flex gap-2 items-center">
                                <div className="flex-1 relative">
                              <Input
                                placeholder="Description"
                                    value={(() => {
                                      // If description has format "Category: Description", show only description part
                                      if (item.description.includes(':')) {
                                        return item.description.split(':')[1]?.trim() || item.description;
                                      }
                                      return item.description;
                                    })()}
                                    onChange={(e) => {
                                      // Get current category and combine with new description
                                      const currentCategory = item.description.includes(':') 
                                        ? item.description.split(':')[0]?.trim() || 'General'
                                        : 'General';
                                      const newDescription = `${currentCategory}: ${e.target.value}`;
                                      updateLineItem(month.id, item.id, 'description', newDescription);
                                    }}
                                    disabled={isExistingItem}
                                    className={`flex-1 ${isExistingItem ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                  />
                                  {isExistingItem && (
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500 bg-white px-1">
                                      SAVED
                                    </div>
                                  )}
                                </div>
                              <div className="relative w-32">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">£</span>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.amount || ''}
                                  onChange={(e) => updateLineItem(month.id, item.id, 'amount', parseFloat(e.target.value) || 0)}
                                    disabled={isExistingItem}
                                    className={`pl-6 text-right ${isExistingItem ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                />
                              </div>
                               <Button 
                                 onClick={() => openChargeBreakdown(month.id, item.id)}
                                 variant="outline" 
                                 size="sm"
                                 title={isExistingItem ? "This item is already saved" : "Add more info and upload invoices"}
                                 className={`px-3 ${isExistingItem ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'}`}
                                 disabled={isExistingItem}
                               >
                                 <Plus className="h-4 w-4 mr-1" />
                                 Add more info
                               </Button>
                               {editingMonth === month.id && !isExistingItem && (
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
                                     title="Remove line item"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </>
                               )}
                            </div>
                            
                             {/* Charges summary */}
                             {item.charges && item.charges.length > 0 && (
                               <div className={`ml-4 text-xs ${isExistingItem ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                 <span className={`font-medium ${isExistingItem ? 'text-gray-400' : 'text-blue-600'}`}>
                                   {item.charges.length} charge{item.charges.length !== 1 ? 's' : ''} • 
                                   £{item.charges.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString()} breakdown
                                 </span>
                               </div>
                             )}

                             {/* Attachments display */}
                             {item.attachments && item.attachments.length > 0 && (
                               <div className={`ml-4 space-y-1 ${isExistingItem ? 'opacity-60' : ''}`}>
                                 {item.attachments.map((attachment, index) => (
                                   <div key={index} className={`flex items-center gap-2 text-sm ${isExistingItem ? 'text-gray-400' : 'text-muted-foreground'}`}>
                                     <Paperclip className="h-3 w-3" />
                                     <span className="flex-1">{attachment.fileName}</span>
                                     {editingMonth === month.id && !isExistingItem && (
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
                          );
                        })}
                        
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
            </>
          )}
        </TabsContent>

        <TabsContent value="annual" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-semibold">Annual Budget - {currentYear || 'Select Year'}</h3>
              <Select value={currentYear || ""} onValueChange={handleYearSelect}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Select Year" />
                </SelectTrigger>
                <SelectContent>
                  {availableYears.map(year => (
                    <SelectItem key={year} value={year}>{year}</SelectItem>
                  ))}
                  <SelectItem value="add-year">Add Year...</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => setShowAddYear(true)} variant="outline" disabled={isFinanceLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {isFinanceLoading ? 'Loading...' : 'Start New Year'}
            </Button>
          </div>

          {/* Show message when no year is selected */}
          {!currentYear && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Year Selected</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Please select a year from the dropdown above or add a new year to start managing your annual budget.
                </p>
                <Button onClick={() => setShowAddYear(true)} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Year
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Only show budget content when a year is selected */}
          {currentYear && (
            <>
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
                {/* <div className="border rounded-lg p-4 bg-muted/20"> */}
                  {/* <div className="flex items-center justify-between mb-3">
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
                  </div> */}
                  {/* {budgetDocumentsByYear[currentYear] && budgetDocumentsByYear[currentYear].length > 0 ? (
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
                  )} */}
                {/* </div> */}

                {/* Manual Budget Items */}
                {/* <div className="border rounded-lg p-4">
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
                </div> */}
              </CardContent>
            </Card>

          </div>
            </>
          )}
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
              <Button onClick={addYear} className="flex-1" disabled={isFinanceLoading}>
                {isFinanceLoading ? 'Creating...' : 'Create Year'}
              </Button>
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
          lineItemDescription={(() => {
            const item = getSelectedLineItem();
            if (!item) return '';
            
            // If description has format "Category: Description", extract only description part
            if (item.description.includes(':')) {
              const extractedDescription = item.description.split(':')[1]?.trim() || item.description;
              console.log('Extracting description:', {
                original: item.description,
                extracted: extractedDescription
              });
              return extractedDescription;
            }
            
            // Otherwise, return the full description
            return item.description;
          })()}
          lineItemAmount={getSelectedLineItem()?.amount || 0}
          lineItemCategory={(() => {
            const item = getSelectedLineItem();
            if (!item) return 'General';
            
            // If description has format "Category: Description", extract category
            if (item.description.includes(':')) {
              return item.description.split(':')[0]?.trim() || 'General';
            }
            
            // Otherwise, return General as default
            return 'General';
          })()}
          onSave={saveLineItemChanges}
          isNewItem={getSelectedLineItem()?.id.startsWith('new-') || false}
        />
      )}
    </div>
  );
};

export default Financials;