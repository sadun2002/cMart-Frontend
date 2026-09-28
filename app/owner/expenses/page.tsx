'use client';

import { Suspense, useEffect, useState, useMemo, useRef } from 'react';
import { 
  Banknote, Search, Plus, Trash2, LayoutGrid, List, Filter, FileText, CheckCircle, Clock, X, Maximize, Minimize, Calendar, Lock, Upload, Eye, File as FileIcon, Download, RefreshCw, ChevronDown, ChevronUp, CreditCard, Receipt, SlidersHorizontal,
  BarChart3, TrendingUp, PieChart, Layers, CheckCircle2, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { getDb } from '@/lib/db';
import { KpiCard } from '@/components/ui/kpi-card';
import { CustomSelect } from '@/components/ui/custom-select';
import { FilterPanel } from '@/components/ui/filter-panel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { MainRightPanel } from '@/components/ui/right-panel';
import { ValidationErrorTooltip } from '@/components/ui/validation-error-tooltip';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { encryptData, decryptData } from '@/lib/local-db';
import { useAuthStore } from '@/lib/auth-store';
import { useBranchStore } from '@/lib/branch-store';
import { storeOwnerAPI } from '@/lib/api';
import { isTauriEnv } from '@/lib/local-db';

// Generate a random UUID
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const EXPENSE_CATEGORIES = {
  'Utilities': ['Electricity', 'Water', 'Internet', 'Telephone'],
  'Operations': ['Rent', 'Maintenance', 'Transport', 'Office Supplies'],
  'Marketing': ['Facebook Ads', 'Printing', 'Promotions', 'Marketing'],
  'Financial': ['Tax', 'Bank Charges', 'Insurance'],
  'Other': ['Salary', 'Software / Subscription', 'Other']
};

const FLAT_CATEGORIES = Object.values(EXPENSE_CATEGORIES).flat();

interface ExpensesOverviewDashboardProps {
  expenses: any[];
  totalExpenses: number;
  thisMonthExpenses: number;
  lastMonthExpenses: number;
  recurringExpensesTotal: number;
  monthDiff: number;
  setActiveTab: (tab: 'overview' | 'table') => void;
  setIsAddOpen: (open: boolean) => void;
  setFilterCategory: (cat: string) => void;
  setFilterStatus: (status: string) => void;
  onViewExpense?: (exp: any) => void;
}

function ExpensesOverviewDashboard({
  expenses,
  totalExpenses,
  thisMonthExpenses,
  lastMonthExpenses,
  recurringExpensesTotal,
  monthDiff,
  setActiveTab,
  setIsAddOpen,
  setFilterCategory,
  setFilterStatus,
  onViewExpense,
}: ExpensesOverviewDashboardProps) {
  const [chartType, setChartType] = useState<'bar' | 'line'>('bar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isMonthHigher = monthDiff > 0;
  const isMonthLower = monthDiff < 0;

  // Chart Data: Spend by Expense Category
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      map.set(cat, (map.get(cat) || 0) + Number(e.amount || 0));
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [expenses]);

  // Top 5 Largest Expenses
  const topExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))
      .slice(0, 5);
  }, [expenses]);

  // Bottom 1: Categories Breakdown
  const topCategories = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    expenses.forEach(e => {
      const cat = e.category || 'Other';
      const existing = map.get(cat) || { total: 0, count: 0 };
      map.set(cat, {
        total: existing.total + Number(e.amount || 0),
        count: existing.count + 1
      });
    });
    return Array.from(map.entries())
      .map(([category, info]) => ({
        category,
        total: info.total,
        count: info.count,
        percent: totalExpenses > 0 ? (info.total / totalExpenses) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [expenses, totalExpenses]);

  // Bottom 2: Recent Expense Records
  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime())
      .slice(0, 5);
  }, [expenses]);

  // Bottom 3: Payment Status & Method Breakdown
  const paymentBreakdown = useMemo(() => {
    const paid = expenses.filter(e => e.paymentStatus === 'Paid');
    const pending = expenses.filter(e => e.paymentStatus === 'Pending');
    const overdue = expenses.filter(e => e.paymentStatus === 'Overdue');
    const recurring = expenses.filter(e => e.type === 'Recurring');
    const oneTime = expenses.filter(e => e.type !== 'Recurring');

    const paidSum = paid.reduce((s, e) => s + Number(e.amount || 0), 0);
    const pendingSum = pending.reduce((s, e) => s + Number(e.amount || 0), 0);
    const overdueSum = overdue.reduce((s, e) => s + Number(e.amount || 0), 0);

    return {
      paidCount: paid.length,
      paidSum,
      pendingCount: pending.length,
      pendingSum,
      overdueCount: overdue.length,
      overdueSum,
      recurringCount: recurring.length,
      oneTimeCount: oneTime.length,
    };
  }, [expenses]);

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10 space-y-6">
      {/* ──────────────── 1. REUSABLE TOP 4 KPI CARDS ──────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Expenses" 
          value={`Rs. ${totalExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={Banknote} 
          iconColorClass="text-blue-600"
          iconBgClass="bg-blue-50 dark:bg-blue-500/10"
        />
        <KpiCard 
          title="This Month" 
          value={`Rs. ${thisMonthExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={Calendar} 
          iconColorClass="text-emerald-600"
          iconBgClass="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard 
          title="This Month vs Last" 
          value={
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-slate-900 dark:text-white">
                Rs. {thisMonthExpenses.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </span>
              {isMonthHigher && (
                <span className="text-xs font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded-md">
                  +Rs. {monthDiff.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              )}
              {isMonthLower && (
                <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 rounded-md">
                  -Rs. {Math.abs(monthDiff).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              )}
              {!isMonthHigher && !isMonthLower && (
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  No Change
                </span>
              )}
            </div>
          } 
          icon={FileText} 
          iconColorClass="text-purple-600"
          iconBgClass="bg-purple-50 dark:bg-purple-500/10"
        />
        <KpiCard 
          title="Recurring Expenses" 
          value={`Rs. ${recurringExpensesTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          icon={RefreshCw} 
          iconColorClass="text-orange-600"
          iconBgClass="bg-orange-50 dark:bg-orange-500/10"
        />
      </div>

      {/* ──────────────── 2. MAIN ROW: CHART (2 Cols) + TOP 5 LARGEST EXPENSES (1 Col) ──────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Chart Card (h-[400px]) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Category Expenses & Spending Breakdown
            </h2>
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartType === 'bar' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Bar
              </button>
              <button
                type="button"
                onClick={() => setChartType('line')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${chartType === 'line' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                Line
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0 w-full relative">
            {mounted ? (
              chartData.length === 0 ? (
                <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                  No expense records available to plot chart.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip 
                        formatter={(v: any) => [`Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Expenditure']} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.4} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                      <Tooltip 
                        formatter={(v: any) => [`Rs. ${Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Expenditure']} 
                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '12px' }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={3} dot={{ r: 4, fill: '#3B82F6' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              )
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
                Loading chart...
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 font-medium">
            <span>Total Recorded Expenditure</span>
            <span className="font-bold text-slate-900 dark:text-white">
              Rs. {totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Right: Top 5 Largest Expenses (h-[400px]) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Banknote className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Top 5 Largest Expenses
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              Ranked
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {topExpenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No expense data found.
              </div>
            ) : (
              topExpenses.map((exp, i) => {
                const rankColors = [
                  'bg-amber-500 text-white',
                  'bg-slate-400 text-white',
                  'bg-orange-700 text-white',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ];
                return (
                  <div
                    key={exp.id || i}
                    onClick={() => onViewExpense ? onViewExpense(exp) : setActiveTab('table')}
                    className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                    title="Click to view details"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${rankColors[i] || 'bg-slate-200 text-slate-700'}`}>
                        {i + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {exp.name || exp.description || 'Expense'}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {exp.category} • {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-black text-slate-900 dark:text-white shrink-0">
                      Rs. {Number(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Expense Table →
            </button>
          </div>
        </div>
      </div>

      {/* ──────────────── 3. BOTTOM ROW: 3 INSIGHTS & RANKINGS WIDGETS ──────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Top Expense Categories */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              Top Categories
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
              Breakdown
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2.5 pr-0.5">
            {topCategories.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No expense category data.
              </div>
            ) : (
              topCategories.map((c, i) => (
                <div
                  key={c.category || i}
                  onClick={() => {
                    setFilterCategory(c.category);
                    setActiveTab('table');
                  }}
                  className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group space-y-1.5"
                  title={`Filter by ${c.category}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      {c.category}
                    </span>
                    <span className="font-black text-slate-900 dark:text-white">
                      Rs. {c.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, Math.max(5, c.percent))}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>{c.count} {c.count === 1 ? 'record' : 'records'}</span>
                    <span>{c.percent.toFixed(1)}% of total</span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Expense Table →
            </button>
          </div>
        </div>

        {/* Card 2: Recent Expense Records */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Recent Records
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              Latest
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-2 pr-0.5">
            {recentExpenses.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs font-medium">
                No recent expense records.
              </div>
            ) : (
              recentExpenses.map((exp, i) => (
                <div
                  key={exp.id || i}
                  onClick={() => onViewExpense ? onViewExpense(exp) : setActiveTab('table')}
                  className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  title="Click to view details"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 transition-colors">
                      {exp.name || exp.description || 'Expense'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-slate-400 truncate">
                        {exp.date ? new Date(exp.date).toLocaleDateString() : 'N/A'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {exp.paymentMethod || 'Cash'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-slate-900 dark:text-white block">
                      Rs. {Number(exp.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      exp.paymentStatus === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20' 
                        : exp.paymentStatus === 'Pending' 
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20' 
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20'
                    }`}>
                      {exp.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Expense Table →
            </button>
          </div>
        </div>

        {/* Card 3: Payment Status & Flow Insights */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-6 w-full text-left flex flex-col h-[400px] justify-between">
          <div className="flex items-center justify-between mb-3 shrink-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Status & Payment Insights
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
              Overview
            </span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar space-y-3 pr-0.5">
            {/* Paid Stat */}
            <div 
              onClick={() => {
                setFilterStatus('paid');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 cursor-pointer hover:border-emerald-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Paid Expenses
                </span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                  Rs. {paymentBreakdown.paidSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                {paymentBreakdown.paidCount} transactions settled
              </p>
            </div>

            {/* Pending Stat */}
            <div 
              onClick={() => {
                setFilterStatus('pending');
                setActiveTab('table');
              }}
              className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 cursor-pointer hover:border-amber-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Pending Approvals / Due
                </span>
                <span className="text-xs font-black text-amber-700 dark:text-amber-300">
                  Rs. {paymentBreakdown.pendingSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 mt-1">
                {paymentBreakdown.pendingCount} unpaid vouchers pending
              </p>
            </div>

            {/* Overdue Stat */}
            {paymentBreakdown.overdueCount > 0 && (
              <div 
                onClick={() => {
                  setFilterStatus('overdue');
                  setActiveTab('table');
                }}
                className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 cursor-pointer hover:border-rose-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Overdue Payments
                  </span>
                  <span className="text-xs font-black text-rose-700 dark:text-rose-300">
                    Rs. {paymentBreakdown.overdueSum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <p className="text-[10px] text-rose-600/80 dark:text-rose-400/80 mt-1">
                  {paymentBreakdown.overdueCount} payments past due date
                </p>
              </div>
            )}

            {/* Schedule Type Stats */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">One-Time</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{paymentBreakdown.oneTimeCount}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Recurring</span>
                <span className="text-sm font-black text-slate-900 dark:text-white">{paymentBreakdown.recurringCount}</span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center flex items-center justify-center shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('table')}
              className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline cursor-pointer leading-normal flex items-center gap-1"
            >
              View All in Expense Table →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function ExpensesPageContent() {
  const [activeTab, setActiveTab] = useState<'overview' | 'table'>('overview');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter States
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all'); // all, today, this_month, last_month
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterVendor, setFilterVendor] = useState('all');
  
  const user = useAuthStore(state => state.user);
  const plan = user?.tenant?.plan?.toUpperCase() || 'STARTUP';
  const isStartup = plan === 'STARTUP' || plan === 'FREE';
  const isLocalMode = isTauriEnv() || isStartup;
  const branches = useBranchStore(state => state.branches);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Rent');
  const [type, setType] = useState('One-time');
  const [frequency, setFrequency] = useState('Monthly');
  const [amount, setAmount] = useState('');
  const [tax, setTax] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paidFromAccount, setPaidFromAccount] = useState('Cash Drawer');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSections, setOpenSections] = useState({ basic: true, payment: false, additional: false });
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeFeatureName, setUpgradeFeatureName] = useState('');

  // Validation Error State
  const [validationError, setValidationError] = useState<{ field: string; message: string } | null>(null);

  const triggerValidation = (sectionKey: string, fieldId: string, message: string) => {
    setValidationError({ field: fieldId, message });

    const focus = () => {
      setTimeout(() => {
        const el = document.getElementById(fieldId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.focus();
        }
      }, 100);
    };

    if (sectionKey && !openSections[sectionKey as keyof typeof openSections]) {
      setOpenSections(prev => ({ ...prev, [sectionKey]: true }));
      setTimeout(focus, 300);
    } else {
      focus();
    }

    setTimeout(() => setValidationError(null), 3500);
  };

  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ isOpen: boolean; id: string | null }>({ isOpen: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCloseAdd = () => {
    setIsAddOpen(false);
  };

  const handleDiscardChanges = () => {
    try {
      localStorage.removeItem('draft_expense_form');
    } catch (e) {}
    resetForm();
    setIsAddOpen(false);
  };

  // Restore draft when opening add expense panel
  useEffect(() => {
    if (isAddOpen) {
      try {
        const saved = localStorage.getItem('draft_expense_form');
        if (saved) {
          const d = JSON.parse(saved);
          if (d.name !== undefined) setName(d.name);
          if (d.category !== undefined) setCategory(d.category);
          if (d.type !== undefined) setType(d.type);
          if (d.frequency !== undefined) setFrequency(d.frequency);
          if (d.amount !== undefined) setAmount(d.amount);
          if (d.tax !== undefined) setTax(d.tax);
          if (d.paymentStatus !== undefined) setPaymentStatus(d.paymentStatus);
          if (d.paymentMethod !== undefined) setPaymentMethod(d.paymentMethod);
          if (d.paidFromAccount !== undefined) setPaidFromAccount(d.paidFromAccount);
          if (d.date !== undefined) setDate(d.date);
          if (d.dueDate !== undefined) setDueDate(d.dueDate);
          if (d.vendorId !== undefined) setVendorId(d.vendorId);
          if (d.notes !== undefined) setNotes(d.notes);
        }
      } catch (e) {}
    }
  }, [isAddOpen]);

  // Auto-save draft for new expense
  useEffect(() => {
    if (!isAddOpen) return;
    const hasData = Boolean(
      name || amount || notes || vendorId || tax || dueDate
    );
    if (hasData) {
      try {
        const draft = {
          name, category, type, frequency, amount, tax,
          paymentStatus, paymentMethod, paidFromAccount,
          date, dueDate, vendorId, notes
        };
        localStorage.setItem('draft_expense_form', JSON.stringify(draft));
      } catch (e) {}
    }
  }, [name, category, type, frequency, amount, tax, paymentStatus, paymentMethod, paidFromAccount, date, dueDate, vendorId, notes, isAddOpen]);

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => {
      if (prev[section]) {
        return { ...prev, [section]: false };
      }
      return {
        basic: false,
        payment: false,
        additional: false,
        [section]: true
      };
    });
  };

  // View Modal State
  const [viewingExpense, setViewingExpense] = useState<any | null>(null);

  useEffect(() => {
    fetchExpenses();
    if (!isLocalMode) {
      storeOwnerAPI.getSuppliers().then(res => setSuppliers(res.data || res)).catch(console.error);
    }
  }, [isStartup]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const db = await getDb();
      const res = await db.select('SELECT * FROM expenses ORDER BY date DESC') as any[];
      
      const decryptedExpenses = await Promise.all((res || []).map(async (exp) => {
        try {
          const name = await decryptData(exp.name) || exp.name;
          const description = await decryptData(exp.description) || exp.description;
          const amountStr = await decryptData(exp.amount) || exp.amount;
          const category = await decryptData(exp.category) || exp.category;
          const taxStr = exp.tax ? await decryptData(exp.tax) : '0';
          const paidFromAccount = exp.paidFromAccount ? await decryptData(exp.paidFromAccount) : '';
          const notes = exp.notes ? await decryptData(exp.notes) : '';
          const attachment = exp.attachment ? await decryptData(exp.attachment) : '';

          return {
            ...exp,
            name: name || description,
            amount: isNaN(Number(amountStr)) ? exp.amount : Number(amountStr),
            category,
            tax: isNaN(Number(taxStr)) ? 0 : Number(taxStr),
            paidFromAccount,
            notes,
            attachment
          };
        } catch {
          return exp;
        }
      }));
      
      setExpenses(decryptedExpenses);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (max 5MB)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAttachment(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setName('');
    setCategory('Rent');
    setType('One-time');
    setFrequency('Monthly');
    setAmount('');
    setTax('');
    setPaymentStatus('Paid');
    setPaymentMethod('Cash');
    setPaidFromAccount('Cash Drawer');
    setDate(new Date().toISOString().split('T')[0]);
    setDueDate('');
    setVendorId('');
    setBranchId('');
    setNotes('');
    setAttachment('');
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      triggerValidation('basic', 'field-expense-name', 'Expense name is required');
      return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      triggerValidation('payment', 'field-expense-amount', 'Valid amount greater than 0 is required');
      return;
    }
    if (!date) {
      triggerValidation('additional', 'field-expense-date', 'Expense date is required');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const db = await getDb();
      const encName = await encryptData(name);
      const encDesc = await encryptData(name); // fallback for older schema
      const encAmount = await encryptData(String(amount));
      const encCat = await encryptData(category);
      
      const encTax = await encryptData(String(tax || 0));
      const encPaidFrom = await encryptData(paidFromAccount);
      const encNotes = await encryptData(notes);
      const encAttachment = await encryptData(attachment);

      await db.execute(
        `INSERT INTO expenses (
          id, name, description, amount, category, date, 
          type, recurringFrequency, tax, dueDate, paymentStatus, paymentMethod, 
          paidFromAccount, vendorId, branchId, notes, attachment
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          uuidv4(), encName, encDesc, encAmount, encCat, date,
          type, type === 'Recurring' ? frequency : null, encTax, dueDate || null, paymentStatus, paymentMethod,
          encPaidFrom, vendorId || null, user?.branchId || 1, encNotes, encAttachment
        ]
      );
      toast.success('Expense added successfully!');
      try {
        localStorage.removeItem('draft_expense_form');
      } catch (e) {}
      setIsAddOpen(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      console.error(error);
      toast.error('Failed to add expense. Ensure database migration ran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmDialog({ isOpen: true, id });
  };

  const executeDelete = async () => {
    if (!deleteConfirmDialog.id) return;
    try {
      setIsDeleting(true);
      const db = await getDb();
      await db.execute('DELETE FROM expenses WHERE id = ?', [deleteConfirmDialog.id]);
      toast.success('Expense deleted');
      setViewingExpense(null);
      setDeleteConfirmDialog({ isOpen: false, id: null });
      fetchExpenses();
    } catch (error) {
      toast.error('Failed to delete expense');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchesSearch = (e.name || e.description || '').toLowerCase().includes(search.toLowerCase()) || 
                            e.category?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === 'all' || e.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || e.paymentStatus === filterStatus;
      const matchesMethod = filterMethod === 'all' || e.paymentMethod === filterMethod;
      const matchesBranch = filterBranch === 'all' || e.branchId === filterBranch;
      const matchesVendor = filterVendor === 'all' || e.vendorId === filterVendor;
      
      let matchesDate = true;
      if (filterDateRange !== 'all') {
        const d = new Date(e.date);
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const dateStr = d.toISOString().split('T')[0];
        
        if (filterDateRange === 'today') {
          matchesDate = dateStr === todayStr;
        } else if (filterDateRange === 'this_month') {
          matchesDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } else if (filterDateRange === 'last_month') {
          let lastMonth = now.getMonth() - 1;
          let year = now.getFullYear();
          if (lastMonth < 0) {
            lastMonth = 11;
            year -= 1;
          }
          matchesDate = d.getMonth() === lastMonth && d.getFullYear() === year;
        }
      }

      return matchesSearch && matchesCategory && matchesStatus && matchesMethod && matchesBranch && matchesVendor && matchesDate;
    });
  }, [expenses, search, filterCategory, filterStatus, filterMethod, filterBranch, filterVendor, filterDateRange]);

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  const thisMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const lastMonthExpenses = useMemo(() => {
    return expenses.filter(e => {
      const d = new Date(e.date);
      const now = new Date();
      let lastMonth = now.getMonth() - 1;
      let year = now.getFullYear();
      if (lastMonth < 0) {
        lastMonth = 11;
        year -= 1;
      }
      return d.getMonth() === lastMonth && d.getFullYear() === year;
    }).reduce((sum, e) => sum + Number(e.amount), 0);
  }, [expenses]);

  const recurringExpensesTotal = useMemo(() => {
    return filteredExpenses.filter(e => e.type === 'Recurring').reduce((sum, e) => sum + Number(e.amount), 0);
  }, [filteredExpenses]);

  const monthDiff = thisMonthExpenses - lastMonthExpenses;
  const isMonthHigher = monthDiff > 0;
  const isMonthLower = monthDiff < 0;

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <Banknote className="w-8 h-8 text-blue-600" />
              Expenses Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Track and manage your store expenses.
            </p>
          </div>
          
          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            Add Expense
          </button>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Left: Mode Toggle (Expenses Overview | Expenses Table) */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0">
          <button 
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Expenses Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          <button 
            type="button"
            onClick={() => setActiveTab('table')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Expenses Table
          </button>
        </div>

        {/* Right: Unified Toolbar Card (Search, Filters, View Toggles, Fullscreen) */}
        <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
          {/* Integrated Search Bar on Left */}
          <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
            <input 
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (activeTab === 'overview' && e.target.value.trim() !== '') {
                  setActiveTab('table');
                }
              }}
              className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
            />
            {search && (
              <button 
                type="button"
                onClick={() => setSearch('')}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Filter Button */}
          <button 
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center px-3 sm:px-4 h-full rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all gap-1.5 font-bold text-xs cursor-pointer relative"
            title="Filter & Sort"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {(filterCategory !== 'all' || filterStatus !== 'all' || filterMethod !== 'all' || filterDateRange !== 'all') && (
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            )}
          </button>
          
          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* View Mode Toggles */}
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('list');
            }}
            title="List View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
          
          <button 
            type="button"
            onClick={() => {
              setActiveTab('table');
              setViewMode('grid');
            }}
            title="Grid View"
            className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' && activeTab === 'table'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />
          
          {/* Fullscreen Toggle */}
          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Full Screen" : "Full Screen"}
            className="flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── TAB CONTENT: OVERVIEW OR TABLE ──────────────── */}
      {activeTab === 'overview' ? (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
          <ExpensesOverviewDashboard
            expenses={expenses}
            totalExpenses={totalExpenses}
            thisMonthExpenses={thisMonthExpenses}
            lastMonthExpenses={lastMonthExpenses}
            recurringExpensesTotal={recurringExpensesTotal}
            monthDiff={monthDiff}
            setActiveTab={setActiveTab}
            setIsAddOpen={setIsAddOpen}
            setFilterCategory={setFilterCategory}
            setFilterStatus={setFilterStatus}
            onViewExpense={(exp) => setViewingExpense(exp)}
          />
        </div>
      ) : (
      /* ──────────────── DATA TABLE ──────────────── */
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        <div className="flex-1 overflow-auto custom-scrollbar">
          {loading ? (
            <div className="font-sans h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredExpenses.length === 0 ? (
            <TableEmptyState
              icon={Banknote}
              title="No expenses found"
              description="You haven't recorded any expenses yet, or none match your search. Click below to add your first expense."
              actionLabel="Create First Expense"
              onAction={() => setIsAddOpen(true)}
            />
          ) : viewMode === 'list' ? (
            <div className="min-w-full inline-block align-middle">
              <table className="w-full text-left whitespace-nowrap min-w-[1000px]">
                <thead className="sticky top-0 bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase tracking-wider z-10 shadow-sm">
                  <tr>
                    <th className="px-5 py-4 font-bold text-slate-500">Expense ID</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Date</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Expense Name</th>
                    <th className="px-5 py-4 font-bold text-slate-500">Category</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-right">Amount</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Status</th>
                    <th className="px-5 py-4 font-bold text-slate-500 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {filteredExpenses.map((exp) => (
                    <tr key={exp.id} onClick={() => setViewingExpense(exp)} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {exp.id ? `EXP-${exp.id.substring(0,6).toUpperCase()}` : 'EXP-UNKNOWN'}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{exp.date}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-900 dark:text-white">{exp.name || exp.description}</div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 rounded-lg text-xs font-bold tracking-wide">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-sm font-black text-slate-900 dark:text-white text-right">
                        Rs. {Number(exp.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wide ${
                          exp.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          exp.paymentStatus === 'Unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                        }`}>
                          {exp.paymentStatus || 'Paid'}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={(e) => { e.stopPropagation(); setViewingExpense(exp); }} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <Eye className="w-5 h-5" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(exp.id); }} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
              {filteredExpenses.map(exp => (
                <div key={exp.id} onClick={() => setViewingExpense(exp)} className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-4 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white truncate">{exp.name || exp.description}</h4>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Clock className="w-3 h-3"/> {exp.date}</div>
                    </div>
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[10px] font-bold">
                      {exp.category}
                    </span>
                  </div>
                  <div className="pt-3 mt-auto border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-lg font-black text-gray-900 dark:text-white">Rs. {Number(exp.amount).toLocaleString()}</span>
                    <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      exp.paymentStatus === 'Paid' ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {exp.paymentStatus || 'Paid'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      )}

      {/* ──────────────── VIEW EXPENSE DETAILS MODAL ──────────────── */}
      <MainRightPanel
        isOpen={!!viewingExpense}
        onClose={() => setViewingExpense(null)}
        title={viewingExpense?.name || viewingExpense?.description || 'Expense Details'}
        subtitle={viewingExpense?.id ? `EXP-${viewingExpense.id.substring(0,6).toUpperCase()}` : 'Expense Voucher Details'}
        icon={Banknote}
        hideFooter={true}
        className="!max-w-md"
      >
        {viewingExpense && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Amount</p>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">Rs. {Number(viewingExpense.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                  </div>
                  <div className={`px-4 py-2 rounded-xl text-sm font-bold shadow-sm ${
                    viewingExpense.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    viewingExpense.paymentStatus === 'Unpaid' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}>
                    {viewingExpense.paymentStatus || 'Paid'}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Category:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Type:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {viewingExpense.type || 'One-time'} 
                        {viewingExpense.type === 'Recurring' && ` (${viewingExpense.recurringFrequency})`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Date:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.date}</span>
                    </div>
                    {viewingExpense.dueDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Due Date:</span>
                        <span className="text-sm font-bold text-red-600 dark:text-red-400">{viewingExpense.dueDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Payment Method:</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.paymentMethod || 'Cash'}</span>
                    </div>
                    {viewingExpense.paidFromAccount && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Paid From:</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{viewingExpense.paidFromAccount}</span>
                      </div>
                    )}
                    {viewingExpense.vendorId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Vendor:</span>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                          {suppliers.find(s => String(s.id) === viewingExpense.vendorId)?.name || `Vendor #${viewingExpense.vendorId}`}
                        </span>
                      </div>
                    )}
                    {viewingExpense.branchId && (
                      <div className="flex justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Branch:</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {branches.find(b => String(b.id) === viewingExpense.branchId)?.name || `Branch #${viewingExpense.branchId}`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {viewingExpense.notes && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">Description</h3>
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{viewingExpense.notes}</p>
                    </div>
                  </div>
                )}

                {viewingExpense.attachment && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">Attachment</h3>
                    {viewingExpense.attachment.startsWith('data:image') ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                        <img src={viewingExpense.attachment} alt="Receipt" className="w-full object-cover" />
                      </div>
                    ) : (
                      <a href={viewingExpense.attachment} download="receipt" className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors group">
                        <div className="flex items-center gap-3 text-blue-700 dark:text-blue-400">
                          <FileIcon className="w-6 h-6" />
                          <span className="font-bold text-sm">View Receipt Document</span>
                        </div>
                        <Download className="w-5 h-5 text-blue-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                      </a>
                    )}
                  </div>
                )}
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex gap-3 shrink-0">
              <button 
                onClick={() => handleDelete(viewingExpense.id)}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-red-600 bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Delete
              </button>
            </div>
          </div>
        )}
      </MainRightPanel>

      {/* ──────────────── ADD EXPENSE SLIDE-OUT PANEL ──────────────── */}
      <MainRightPanel
        isOpen={isAddOpen}
        onClose={handleCloseAdd}
        onDiscard={handleDiscardChanges}
        title="Add New Expense"
        subtitle="Record a new business expense"
        icon={Banknote}
        formId="expenseForm"
        isSubmitting={isSubmitting}
        saveText="Save Expense"
      >
        <form id="expenseForm" onSubmit={handleAddExpense} className="space-y-4 font-sans">
          
          {/* 1. Basic Information */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button 
              type="button" 
              onClick={() => toggleSection('basic')}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.basic ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <Receipt className="w-4 h-4 text-blue-600" />
                Basic Information
              </span>
              {openSections.basic ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence initial={false}>
              {openSections.basic && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="space-y-2 relative">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                        <span>Expense Name <span className="text-red-500">*</span></span>
                        <ValidationErrorTooltip error={validationError} fieldId="field-expense-name" />
                      </label>
                      <input
                        id="field-expense-name"
                        autoFocus
                        value={name}
                        onChange={e => {
                          setName(e.target.value);
                          if (validationError?.field === 'field-expense-name') setValidationError(null);
                        }}
                        className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${
                          validationError?.field === 'field-expense-name' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        }`}
                        placeholder="e.g. Electricity Bill"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Category</label>
                        <CustomSelect 
                          value={category} 
                          onChange={setCategory} 
                          label="Select Category" 
                          options={FLAT_CATEGORIES.map(c => ({ value: c, label: c }))} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Expense Type</label>
                        <CustomSelect 
                          value={type} 
                          onChange={setType} 
                          label="Select Type" 
                          options={[
                            { value: 'One-time', label: 'One-time' },
                            { value: 'Recurring', label: 'Recurring' }
                          ]} 
                        />
                      </div>
                    </div>

                    {type === 'Recurring' && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 pt-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Frequency <span className="text-red-500">*</span></label>
                        <CustomSelect 
                          value={frequency} 
                          onChange={setFrequency} 
                          label="Select Frequency" 
                          options={[
                            { value: 'Daily', label: 'Daily' },
                            { value: 'Weekly', label: 'Weekly' },
                            { value: 'Monthly', label: 'Monthly' },
                            { value: 'Yearly', label: 'Yearly' }
                          ]} 
                        />
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Amount & Payment Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button 
              type="button" 
              onClick={() => toggleSection('payment')}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.payment ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Amount & Payment Details
              </span>
              {openSections.payment ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence initial={false}>
              {openSections.payment && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 relative">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Amount <span className="text-red-500">*</span></span>
                          <ValidationErrorTooltip error={validationError} fieldId="field-expense-amount" />
                        </label>
                        <input
                          id="field-expense-amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={amount}
                          onChange={e => {
                            setAmount(e.target.value);
                            if (validationError?.field === 'field-expense-amount') setValidationError(null);
                          }}
                          className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${
                            validationError?.field === 'field-expense-amount' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                          placeholder="Rs. 15,000"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tax / VAT (Optional)</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={tax}
                          onChange={e => setTax(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                          placeholder="Rs. 0.00"
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex justify-between items-center">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Total Amount</span>
                      <span className="text-2xl font-black text-slate-900 dark:text-white">
                        Rs. {(Number(amount || 0) + Number(tax || 0)).toLocaleString(undefined, {minimumFractionDigits: 2})}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status</label>
                        <CustomSelect 
                          value={paymentStatus} 
                          onChange={setPaymentStatus} 
                          label="Select Status" 
                          options={[
                            { value: 'Paid', label: 'Paid' },
                            { value: 'Unpaid', label: 'Unpaid' },
                            { value: 'Partially Paid', label: 'Partially Paid' }
                          ]} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Method</label>
                        <CustomSelect 
                          value={paymentMethod} 
                          onChange={setPaymentMethod} 
                          label="Select Method" 
                          options={[
                            { value: 'Cash', label: 'Cash' },
                            { value: 'Card', label: 'Card' },
                            { value: 'Bank Transfer', label: 'Bank Transfer' },
                            { value: 'Cheque', label: 'Cheque' },
                            { value: 'Other', label: 'Other' }
                          ]} 
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Paid From</label>
                        <CustomSelect 
                          value={paidFromAccount} 
                          onChange={setPaidFromAccount} 
                          label="Select Account" 
                          options={[
                            { value: 'Cash Drawer', label: 'Cash Drawer' },
                            { value: 'Main Bank', label: 'Main Bank' },
                            { value: 'Petty Cash', label: 'Petty Cash' }
                          ]} 
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Additional Details */}
          <div className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden">
            <button 
              type="button" 
              onClick={() => toggleSection('additional')}
              className={`w-full px-4 py-3 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors outline-none cursor-pointer ${openSections.additional ? "rounded-t-xl" : "rounded-xl"}`}
            >
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                <SlidersHorizontal className="w-4 h-4 text-blue-600" />
                Additional Details
              </span>
              {openSections.additional ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
            </button>
            <AnimatePresence initial={false}>
              {openSections.additional && (
                <motion.div 
                  initial={{ height: 0, opacity: 0, overflow: 'hidden' }}
                  animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                  exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                >
                  <div className="p-4 space-y-4 border-t border-slate-300 dark:border-slate-700">
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 relative">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                          <span>Expense Date <span className="text-red-500">*</span></span>
                          <ValidationErrorTooltip error={validationError} fieldId="field-expense-date" />
                        </label>
                        <input
                          id="field-expense-date"
                          type="date"
                          value={date}
                          onChange={e => {
                            setDate(e.target.value);
                            if (validationError?.field === 'field-expense-date') setValidationError(null);
                          }}
                          className={`w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${
                            validationError?.field === 'field-expense-date' ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          }`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Due Date (Optional)</label>
                        <input
                          type="date"
                          value={dueDate}
                          onChange={e => setDueDate(e.target.value)}
                          className="w-full px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        Vendor / Payee
                      </label>
                      <CustomSelect 
                        value={vendorId} 
                        onChange={setVendorId} 
                        label="Select Vendor"
                        locked={isStartup}
                        onLockedClick={() => {
                          setUpgradeFeatureName('Vendor Management');
                          setIsUpgradeModalOpen(true);
                        }}
                        options={[
                          { value: '', label: '-- None --' },
                          ...suppliers.map(s => ({ value: s.id.toString(), label: s.name }))
                        ]} 
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Description / Notes</label>
                      <textarea
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        className="w-full p-4 min-h-[100px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white resize-y outline-none"
                        placeholder="e.g. August electricity bill for main branch"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Attach Receipt / Bill</label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors ${
                          attachment 
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10' 
                            : 'border-slate-300 dark:border-slate-600 hover:border-blue-500 bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-700'
                        }`}
                      >
                        {attachment ? (
                          <>
                            <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">File Attached Successfully</span>
                            <span className="text-xs text-slate-500 mt-1">Click to replace</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-slate-400 mb-2" />
                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Click to upload bill</span>
                            <span className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 5MB</span>
                          </>
                        )}
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        onChange={handleFileUpload}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </form>
      </MainRightPanel>

      {/* ──────────────── FILTER SLIDE-OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Expenses"
        onClear={() => {
          setFilterDateRange('all');
          setFilterCategory('all');
          setFilterStatus('all');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Date Range</label>
            <CustomSelect
              icon={Calendar}
              value={filterDateRange}
              onChange={setFilterDateRange}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'today', label: 'Today' },
                { value: 'this_month', label: 'This Month' },
                { value: 'last_month', label: 'Last Month' },
              ]}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Category</label>
            <CustomSelect
              icon={Layers}
              value={filterCategory}
              onChange={setFilterCategory}
              options={[
                { value: 'all', label: 'All Categories' },
                ...FLAT_CATEGORIES.map(c => ({ value: c, label: c }))
              ]}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Payment Status</label>
            <CustomSelect
              icon={CheckCircle2}
              value={filterStatus}
              onChange={setFilterStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'Paid', label: 'Paid' },
                { value: 'Unpaid', label: 'Unpaid' },
                { value: 'Partially Paid', label: 'Partially Paid' },
              ]}
            />
          </div>
          
          <div>
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Payment Method</label>
            <CustomSelect
              icon={CreditCard}
              value={filterMethod}
              onChange={setFilterMethod}
              options={[
                { value: 'all', label: 'All Methods' },
                { value: 'Cash', label: 'Cash' },
                { value: 'Card', label: 'Card' },
                { value: 'Bank Transfer', label: 'Bank Transfer' },
                { value: 'Cheque', label: 'Cheque' },
              ]}
            />
          </div>

          {!isStartup && branches.length > 0 && (
            <div>
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 block mb-2">Branch</label>
              <CustomSelect
                icon={Receipt}
                value={filterBranch}
                onChange={setFilterBranch}
                options={[
                  { value: 'all', label: 'All Branches' },
                  ...branches.map(b => ({ value: String(b.id), label: b.name }))
                ]}
              />
            </div>
          )}
        </div>
      </FilterPanel>

      <ConfirmDialog 
        isOpen={deleteConfirmDialog.isOpen}
        title="Delete Expense"
        message="Are you sure you want to delete this expense voucher? This action cannot be undone."
        confirmText="Delete Expense"
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmDialog({ isOpen: false, id: null })}
        isLoading={isDeleting}
      />

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        featureName={upgradeFeatureName} 
      />
    </div>
  );
}

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Loading...</div>}>
      <ExpensesPageContent />
    </Suspense>
  );
}
