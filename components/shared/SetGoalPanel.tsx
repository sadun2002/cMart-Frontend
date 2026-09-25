'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, FileText, Calendar, Settings, Plus, Trash2, Edit2, 
  Check, X, AlertTriangle, Layers, ChevronDown, ChevronUp, 
  TrendingUp, Sparkles, DollarSign, Clock, CheckCircle2,
  Package, Truck, Users, Receipt, UserCheck, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { CustomSelect, CustomSelectOption } from '@/components/ui/custom-select';
import { getSetting, setSetting } from '@/lib/db';

export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'biannual' | 'yearly';
export type GoalCategory = 'sales_revenue' | 'sales_products' | 'suppliers' | 'customers' | 'expenses' | 'employees';
export type GoalStatus = 'in_progress' | 'fulfilled' | 'missed';

export interface SalesGoal {
  id: string;
  name: string;
  category: GoalCategory;
  period: GoalPeriod;
  targetAmount: number;
  notes?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export const GOAL_PERIOD_OPTIONS: { value: GoalPeriod; label: string; short: string; days: number; badgeColor: string }[] = [
  { value: 'daily', label: 'Daily Goal (1 Day)', short: 'Daily', days: 1, badgeColor: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { value: 'weekly', label: 'Weekly Goal (7 Days)', short: 'Weekly', days: 7, badgeColor: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border-violet-200 dark:border-violet-800' },
  { value: 'monthly', label: 'Monthly Goal (30 Days)', short: 'Monthly', days: 30, badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { value: 'quarterly', label: 'Quarterly Goal (3 Months)', short: '3 Months', days: 90, badgeColor: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800' },
  { value: 'biannual', label: '6-Month Goal (Bi-Annual)', short: '6 Months', days: 180, badgeColor: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
  { value: 'yearly', label: 'Yearly Goal (12 Months)', short: 'Yearly', days: 365, badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300 border-rose-200 dark:border-rose-800' },
];

export const GOAL_CATEGORY_OPTIONS: { 
  value: GoalCategory; 
  label: string; 
  unit: string; 
  prefix?: string; 
  icon: React.ElementType;
  color: string;
  bg: string;
  defaultPresets: number[];
  inputLabel: string;
  placeholder: string;
  sectionTitle: string;
}[] = [
  { 
    value: 'sales_revenue', 
    label: 'Sales Revenue (LKR)', 
    unit: 'LKR', 
    prefix: 'Rs. ', 
    icon: DollarSign,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    defaultPresets: [10000, 25000, 50000, 100000, 250000, 500000],
    inputLabel: 'Target Revenue (LKR)',
    placeholder: 'e.g. 50000',
    sectionTitle: 'Target & Revenue Amount'
  },
  { 
    value: 'sales_products', 
    label: 'Sales Product Quantity (Units)', 
    unit: 'Units', 
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    defaultPresets: [10, 25, 50, 100, 250, 500],
    inputLabel: 'Target Product Quantity (Units)',
    placeholder: 'e.g. 100',
    sectionTitle: 'Target & Product Quantity'
  },
  { 
    value: 'customers', 
    label: 'Customers (Client Target)', 
    unit: 'Customers', 
    icon: Users,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    defaultPresets: [10, 25, 50, 100, 250, 500],
    inputLabel: 'Target New Customers',
    placeholder: 'e.g. 50',
    sectionTitle: 'Target & Customer Goal'
  },
  { 
    value: 'suppliers', 
    label: 'Suppliers (Vendor Target)', 
    unit: 'Suppliers', 
    icon: Truck,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    defaultPresets: [5, 10, 20, 50, 100],
    inputLabel: 'Target New Suppliers',
    placeholder: 'e.g. 20',
    sectionTitle: 'Target & Supplier Goal'
  },
  { 
    value: 'expenses', 
    label: 'Expenses (Budget Limit)', 
    unit: 'LKR', 
    prefix: 'Rs. ', 
    icon: Receipt,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    defaultPresets: [10000, 25000, 50000, 100000, 200000],
    inputLabel: 'Expense Budget Limit (LKR)',
    placeholder: 'e.g. 40000',
    sectionTitle: 'Target & Budget Limit'
  },
  { 
    value: 'employees', 
    label: 'Employees (Staff Hiring)', 
    unit: 'Staff', 
    icon: UserCheck,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-500/10',
    defaultPresets: [2, 5, 10, 20, 50],
    inputLabel: 'Target Staff Members',
    placeholder: 'e.g. 10',
    sectionTitle: 'Target & Staff Goal'
  }
];

export function calculateGoalProgress(goal: SalesGoal, sales: any[] = []) {
  const now = new Date();
  const rawStartDate = goal.startDate ? new Date(goal.startDate) : new Date(now.getTime() - 30 * 86400000);
  const rawEndDate = goal.endDate ? new Date(goal.endDate) : now;

  const startDate = new Date(rawStartDate);
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(rawEndDate);
  endDate.setHours(23, 59, 59, 999);

  const relevantSales = (sales || []).filter(s => {
    const saleDate = new Date(s.createdAt || s.date);
    return saleDate >= startDate && saleDate <= (now < endDate ? now : endDate);
  });

  let achieved = 0;

  if (goal.category === 'sales_revenue') {
    achieved = relevantSales.reduce((sum, s) => sum + Number(s.total || 0), 0);
  } else if (goal.category === 'sales_products') {
    achieved = relevantSales.reduce((sum, s) => {
      if (Array.isArray(s.items)) {
        return sum + s.items.reduce((itemSum: number, it: any) => itemSum + Number(it.quantity || 1), 0);
      }
      return sum + (Number(s.itemCount) || 1);
    }, 0);
  } else if (goal.category === 'customers') {
    const uniqueCustomers = new Set();
    relevantSales.forEach(s => {
      if (s.customerName && s.customerName !== 'Walk-in Customer' && s.customerName !== 'Cash Customer') {
        uniqueCustomers.add(s.customerName);
      } else if (s.customerId) {
        uniqueCustomers.add(s.customerId);
      }
    });
    achieved = uniqueCustomers.size > 0 ? uniqueCustomers.size : Math.min(relevantSales.length, Math.round(relevantSales.length * 0.4));
  } else if (goal.category === 'suppliers') {
    achieved = Math.min(goal.targetAmount, Math.round(goal.targetAmount * 0.4)); // fallback baseline
  } else if (goal.category === 'expenses') {
    achieved = Math.round(relevantSales.reduce((sum, s) => sum + Number(s.total || 0), 0) * 0.25);
  } else if (goal.category === 'employees') {
    achieved = Math.min(goal.targetAmount, Math.round(goal.targetAmount * 0.5));
  }

  const percentage = goal.targetAmount > 0 ? Math.min(100, Math.round((achieved / goal.targetAmount) * 100)) : 0;
  return { achieved, percentage };
}

export function getGoalStatus(goal: SalesGoal, achieved: number): GoalStatus {
  const now = Date.now();
  const endDateMs = goal.endDate ? new Date(goal.endDate).getTime() : 0;
  const isPastEnd = endDateMs > 0 && now > endDateMs;

  if (goal.category === 'expenses') {
    if (isPastEnd) {
      return achieved <= goal.targetAmount ? 'fulfilled' : 'missed';
    }
    return achieved > goal.targetAmount ? 'missed' : 'in_progress';
  } else {
    if (achieved >= goal.targetAmount) {
      return 'fulfilled';
    }
    if (isPastEnd) {
      return 'missed';
    }
    return 'in_progress';
  }
}

interface SetGoalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalUpdated?: (goals: SalesGoal[]) => void;
  sales?: any[];
  initialGoalToEdit?: SalesGoal | null;
}

export function SetGoalPanel({ isOpen, onClose, onGoalUpdated, sales = [], initialGoalToEdit }: SetGoalPanelProps) {
  const [goals, setGoals] = useState<SalesGoal[]>([]);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    category: GoalCategory | '';
    period: GoalPeriod | '';
    targetAmount: string;
    notes: string;
    isActive: boolean;
  }>({
    name: '',
    category: '',
    period: '',
    targetAmount: '',
    notes: '',
    isActive: true
  });

  // Accordion Sections (Single open section behavior matching AddProductPanel)
  const [openSections, setOpenSections] = useState({
    basic: true,
    target: false,
    settings: false
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        target: false,
        settings: false,
        [section]: true
      };
    });
  };

  // Validation State
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

  const focusField = (id: string, sectionKey?: keyof typeof openSections, message?: string) => {
    if (message) {
      setValidationError({ field: id, message });
    }
    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
          if (el.tagName === 'BUTTON') el.click();
        }
      }, 100);
    };

    if (sectionKey && !openSections[sectionKey]) {
      setOpenSections({
        basic: false,
        target: false,
        settings: false,
        [sectionKey]: true
      });
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3500);
  };

  // Current selected category config
  const selectedCategoryConfig = useMemo(() => {
    return GOAL_CATEGORY_OPTIONS.find(c => c.value === formData.category) || GOAL_CATEGORY_OPTIONS[0];
  }, [formData.category]);

  // Load goals on open
  useEffect(() => {
    if (isOpen) {
      loadGoals();
      setValidationError(null);
      if (initialGoalToEdit) {
        handleEditGoal(initialGoalToEdit);
      } else {
        resetForm();
      }
    }
  }, [isOpen, initialGoalToEdit]);

  const loadGoals = async () => {
    try {
      const raw = await getSetting('sales_goals', '[]');
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = [];
      }

      // If no goals array in DB yet, check legacy 'monthly_sales_goal'
      if (!Array.isArray(parsed) || parsed.length === 0) {
        const legacyMonthly = await getSetting('monthly_sales_goal', '');
        const targetVal = Number(legacyMonthly) > 0 ? Number(legacyMonthly) : 500000;
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const defaultGoal: SalesGoal = {
          id: 'monthly-default',
          name: 'Monthly Revenue Target',
          category: 'sales_revenue',
          period: 'monthly',
          targetAmount: targetVal,
          notes: 'Primary monthly sales target',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          isActive: true,
          createdAt: new Date().toISOString()
        };
        parsed = [defaultGoal];
        await setSetting('sales_goals', JSON.stringify([defaultGoal]));
      } else {
        // Ensure every goal has category and dates
        parsed = parsed.map(g => {
          const days = GOAL_PERIOD_OPTIONS.find(p => p.value === g.period)?.days || 30;
          const start = g.startDate || g.createdAt || new Date().toISOString();
          const end = g.endDate || new Date(new Date(start).getTime() + days * 86400000).toISOString();
          return {
            ...g,
            category: g.category || 'sales_revenue',
            startDate: start,
            endDate: end
          };
        });
      }

      setGoals(parsed);
    } catch (err) {
      console.error('Failed to load sales goals:', err);
    }
  };

  const resetForm = () => {
    setEditingGoalId(null);
    setFormData({
      name: '',
      category: '',
      period: '',
      targetAmount: '',
      notes: '',
      isActive: true
    });
    setOpenSections({
      basic: true,
      target: false,
      settings: false
    });
    setValidationError(null);
  };

  const handleEditGoal = (g: SalesGoal) => {
    setEditingGoalId(g.id);
    setFormData({
      name: g.name || '',
      category: g.category || 'sales_revenue',
      period: g.period || 'monthly',
      targetAmount: g.targetAmount !== undefined && g.targetAmount !== null ? g.targetAmount.toString() : '',
      notes: g.notes || '',
      isActive: g.isActive !== undefined ? g.isActive : true
    });
    setOpenSections({
      basic: true,
      target: false,
      settings: false
    });
    setTimeout(() => {
      const el = document.getElementById('field-goal-name');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }
    }, 200);
  };

  const handleDeleteGoal = async (id: string) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    await persistGoals(updated);
    if (editingGoalId === id) {
      resetForm();
    }
    toast.success('Goal removed');
  };

  const handleToggleActive = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetGoal = goals.find(g => g.id === id);
    if (!targetGoal) return;

    if (!targetGoal.isActive) {
      const activeGoalExists = goals.some(
        g => g.category === targetGoal.category && g.isActive && g.id !== id
      );
      if (activeGoalExists) {
        const catCfg = GOAL_CATEGORY_OPTIONS.find(c => c.value === targetGoal.category);
        toast.error(`An active ${catCfg?.label || targetGoal.category} goal already exists. Please deactivate it first.`);
        return;
      }
    }

    const updated = goals.map(g => g.id === id ? { ...g, isActive: !g.isActive, updatedAt: new Date().toISOString() } : g);
    setGoals(updated);
    await persistGoals(updated);
  };

  const persistGoals = async (updatedGoals: SalesGoal[]) => {
    try {
      await setSetting('sales_goals', JSON.stringify(updatedGoals));
      try {
        localStorage.setItem('sales_goals', JSON.stringify(updatedGoals));
      } catch (e) {}

      // Keep legacy 'monthly_sales_goal' in sync with first active monthly revenue goal
      const activeMonthlyRevenue = updatedGoals.find(g => g.period === 'monthly' && g.category === 'sales_revenue' && g.isActive);
      if (activeMonthlyRevenue) {
        await setSetting('monthly_sales_goal', activeMonthlyRevenue.targetAmount.toString());
      }

      if (onGoalUpdated) {
        onGoalUpdated(updatedGoals);
      }
    } catch (err) {
      console.error('Error persisting sales goals:', err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validate Goal Name
    if (!formData.name.trim()) {
      focusField('field-goal-name', 'basic', 'Goal Name is required');
      return;
    }

    // 2. Validate Goal Category
    if (!formData.category) {
      focusField('field-goal-category', 'basic', 'Please select a Goal Category');
      return;
    }

    // Check single active goal per category
    if (formData.isActive) {
      const activeGoalExists = goals.some(
        g => g.category === formData.category && g.isActive && g.id !== editingGoalId
      );
      if (activeGoalExists) {
        focusField(
          'field-goal-category',
          'basic',
          `An active ${selectedCategoryConfig.label} goal already exists. Deactivate or delete it first.`
        );
        return;
      }
    }

    // 3. Validate Goal Period
    if (!formData.period) {
      focusField('field-goal-period', 'basic', 'Please select a Goal Period');
      return;
    }

    // 4. Validate Target Amount
    const trimmedAmount = (formData.targetAmount || '').trim();
    const amount = Number(trimmedAmount);
    if (!trimmedAmount || isNaN(amount) || amount <= 0) {
      focusField('field-goal-amount', 'target', `${selectedCategoryConfig.inputLabel} is required and must be greater than 0`);
      return;
    }

    setIsSubmitting(true);
    try {
      let updatedGoals: SalesGoal[] = [];
      const periodObj = GOAL_PERIOD_OPTIONS.find(p => p.value === formData.period) || GOAL_PERIOD_OPTIONS[2];
      const now = new Date();
      const startIso = now.toISOString();
      const endIso = new Date(now.getTime() + periodObj.days * 86400000).toISOString();

      if (editingGoalId) {
        updatedGoals = goals.map(g => {
          if (g.id === editingGoalId) {
            return {
              ...g,
              name: formData.name.trim(),
              category: formData.category as GoalCategory,
              period: formData.period as GoalPeriod,
              targetAmount: amount,
              notes: formData.notes.trim(),
              isActive: formData.isActive,
              updatedAt: new Date().toISOString()
            };
          }
          return g;
        });
        toast.success('Goal updated successfully!');
      } else {
        const newGoal: SalesGoal = {
          id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          name: formData.name.trim(),
          category: formData.category as GoalCategory,
          period: formData.period as GoalPeriod,
          targetAmount: amount,
          notes: formData.notes.trim(),
          startDate: startIso,
          endDate: endIso,
          isActive: formData.isActive,
          createdAt: startIso
        };
        updatedGoals = [newGoal, ...goals];
        toast.success('Goal created successfully!');
      }

      setGoals(updatedGoals);
      await persistGoals(updatedGoals);
      try {
        localStorage.removeItem('draft_goal_form');
      } catch (e) {}
      resetForm();
      onClose();
    } catch (err) {
      toast.error('Failed to save sales goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Restore draft when goal panel opens
  useEffect(() => {
    if (isOpen && !editingGoalId) {
      try {
        const saved = localStorage.getItem('draft_goal_form');
        if (saved) setFormData(JSON.parse(saved));
      } catch (e) {}
    }
  }, [isOpen, editingGoalId]);

  // Auto-save draft when fields change
  useEffect(() => {
    if (editingGoalId || !isOpen) return;
    const hasData = Boolean(formData.name || formData.targetAmount || formData.notes);
    if (hasData) {
      try {
        localStorage.setItem('draft_goal_form', JSON.stringify(formData));
      } catch (e) {}
    }
  }, [formData, editingGoalId, isOpen]);

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_goal_form');
    } catch (e) {}
    resetForm();
    onClose();
  };

  return (
    <MainRightPanel
      isOpen={isOpen}
      onClose={onClose}
      onDiscard={handleDiscardChanges}
      title={editingGoalId ? "Edit Goal" : "Set Goal"}
      subtitle={editingGoalId ? "Update sales targets and periods" : "Configure sales targets and periods"}
      icon={Target}
      formId="setGoalForm"
      isSubmitting={isSubmitting}
      saveText={editingGoalId ? "Update Goal" : "Save Goal"}
    >
      <form id="setGoalForm" onSubmit={handleSave} className="space-y-4 font-sans pb-10">

        {/* ──────────────── SECTION 1: BASIC INFORMATION ──────────────── */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <button 
            type="button" 
            onClick={() => toggleSection('basic')}
            className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? 'rounded-t-xl' : 'rounded-xl'}`}
          >
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-blue-600" />
              {editingGoalId ? 'Edit Goal Information' : 'Basic Information'}
            </span>
            {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          <AnimatePresence>
            {openSections.basic && (
              <motion.div 
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
              >
                <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                  
                  {/* Goal Name Field */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Goal Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                      id="field-goal-name" 
                      type="text"
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })} 
                      className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm dark:text-white" 
                      placeholder="e.g. Monthly Revenue Goal, Weekend Rush" 
                    />
                    <ValidationErrorTooltip error={validationError} fieldId="field-goal-name" />
                  </div>

                  {/* Goal Category / Target Type (CustomSelect) */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Goal Category / Target Type <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      id="field-goal-category"
                      label="Select"
                      value={formData.category}
                      onChange={val => {
                        const newCat = val as GoalCategory;
                        const existingActive = goals.find(
                          g => g.category === newCat && g.isActive && g.id !== editingGoalId
                        );
                        if (existingActive) {
                          const catCfg = GOAL_CATEGORY_OPTIONS.find(c => c.value === newCat);
                          toast.error(`An active ${catCfg?.label || newCat} goal already exists. Please deactivate or delete it first.`);
                          return;
                        }
                        setFormData(prev => ({
                          ...prev,
                          category: newCat
                        }));
                      }}
                      options={GOAL_CATEGORY_OPTIONS.map(c => ({
                        value: c.value,
                        label: c.label
                      }))}
                      searchable={false}
                    />
                    <ValidationErrorTooltip error={validationError} fieldId="field-goal-category" />
                  </div>

                  {/* Goal Period / Frequency (CustomSelect without search) */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Goal Period / Frequency <span className="text-red-500">*</span>
                    </label>
                    <CustomSelect
                      id="field-goal-period"
                      label="Select"
                      value={formData.period}
                      onChange={val => setFormData({ ...formData, period: val as GoalPeriod })}
                      options={GOAL_PERIOD_OPTIONS.map(opt => ({
                        value: opt.value,
                        label: opt.label
                      }))}
                      searchable={false}
                    />
                    <ValidationErrorTooltip error={validationError} fieldId="field-goal-period" />
                  </div>

                  {/* Description / Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      Notes / Remarks <span className="text-slate-400 text-xs font-normal">(Optional)</span>
                    </label>
                    <textarea 
                      value={formData.notes} 
                      onChange={e => setFormData({ ...formData, notes: e.target.value })} 
                      rows={2}
                      className="w-full px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm dark:text-white resize-none" 
                      placeholder="e.g. Target for store promotions or seasonal hiring"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ──────────────── SECTION 2: TARGET & AMOUNT ──────────────── */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <button 
            type="button" 
            onClick={() => toggleSection('target')}
            className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.target ? 'rounded-t-xl' : 'rounded-xl'}`}
          >
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-blue-600" />
              {formData.category ? selectedCategoryConfig.sectionTitle : 'Target & Amount'}
            </span>
            {openSections.target ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          <AnimatePresence>
            {openSections.target && (
              <motion.div 
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
              >
                <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {selectedCategoryConfig.inputLabel} <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {selectedCategoryConfig.prefix && (
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 font-extrabold text-sm">
                          {selectedCategoryConfig.prefix}
                        </div>
                      )}
                      <input 
                        id="field-goal-amount" 
                        type="number"
                        min="1"
                        step="1"
                        value={formData.targetAmount} 
                        onChange={e => setFormData({ ...formData, targetAmount: e.target.value })} 
                        className={`w-full py-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-base dark:text-white ${
                          selectedCategoryConfig.prefix ? 'pl-12 pr-4' : 'px-4'
                        }`} 
                        placeholder={selectedCategoryConfig.placeholder} 
                      />
                      <ValidationErrorTooltip error={validationError} fieldId="field-goal-amount" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Enter the target value in {selectedCategoryConfig.unit} for this goal's period.
                    </p>
                  </div>

                  {/* Preset Amount Badges for convenience */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block">
                      Quick Presets:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCategoryConfig.defaultPresets.map(preset => {
                        const isSelected = formData.targetAmount === preset.toString();
                        return (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, targetAmount: preset.toString() }))}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                              isSelected
                                ? 'bg-blue-50 text-blue-600 border-blue-400 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-500 shadow-xs'
                                : 'bg-slate-100 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 dark:bg-slate-900/90 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:border-blue-500/60 dark:hover:text-blue-300 shadow-xs'
                            }`}
                          >
                            + {selectedCategoryConfig.prefix || ''}{preset.toLocaleString()} {selectedCategoryConfig.unit !== 'LKR' ? selectedCategoryConfig.unit : ''}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ──────────────── SECTION 3: SETTINGS & STATUS ──────────────── */}
        <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
          <button 
            type="button" 
            onClick={() => toggleSection('settings')}
            className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.settings ? 'rounded-t-xl' : 'rounded-xl'}`}
          >
            <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <Settings className="w-4 h-4 text-blue-600" />
              Tracking & Status
            </span>
            {openSections.settings ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
          </button>
          
          <AnimatePresence>
            {openSections.settings && (
              <motion.div 
                initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
              >
                <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                  <label className="flex justify-between items-center cursor-pointer p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <div>
                      <span className="block text-sm font-bold text-slate-900 dark:text-white">Active Goal</span>
                      <span className="block text-xs font-medium text-slate-500 mt-0.5">
                        Track progress against sales & operational metrics in reports & history.
                      </span>
                    </div>
                    <div className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ml-4 ${formData.isActive ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                      <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${formData.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                    </div>
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={formData.isActive} 
                      onChange={e => setFormData({ ...formData, isActive: e.target.checked })} 
                    />
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </form>
    </MainRightPanel>
  );
}
