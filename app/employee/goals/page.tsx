'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { 
  Target, Plus, Search, Filter, List, LayoutGrid, Maximize, Minimize, X, Calendar, Clock, 
  Edit2, Trash2, CheckCircle2, TrendingUp, AlertTriangle, ChevronRight, DollarSign, 
  Package, Users, Truck, Receipt, UserCheck, Lock, Zap
} from 'lucide-react';
import { storeOwnerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { KpiCard } from '@/components/ui/kpi-card';
import { getSetting, setSetting } from '@/lib/db';
import { FilterPanel } from '@/components/ui/filter-panel';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { CustomSelect } from '@/components/ui/custom-select';
import { getLocalSales } from '@/lib/local-services';
import { useAuthStore } from '@/lib/auth-store';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import { 
  SetGoalPanel, 
  SalesGoal, 
  calculateGoalProgress, 
  getGoalStatus, 
  GOAL_PERIOD_OPTIONS, 
  GOAL_CATEGORY_OPTIONS 
} from '@/components/shared/SetGoalPanel';

export default function EmployeeGoalsPage() {
  const { user } = useAuthStore();
  const userPlan = (user?.tenant?.plan || 'STARTUP').toUpperCase();
  const isLockedForStartup = userPlan === 'FREE' || userPlan === 'STARTUP';
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const [sales, setSales] = useState<any[]>([]);
  const [goals, setGoals] = useState<SalesGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // View & Filter State
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Goal Filters
  const [goalCategoryFilter, setGoalCategoryFilter] = useState('all');
  const [goalPeriodFilter, setGoalPeriodFilter] = useState('all');
  const [goalStatusFilter, setGoalStatusFilter] = useState('all');

  // Modals & Panel State
  const [isGoalPanelOpen, setIsGoalPanelOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SalesGoal | null>(null);
  const [goalToDelete, setGoalToDelete] = useState<SalesGoal | null>(null);

  useEffect(() => {
    if (isLockedForStartup) return;
    fetchSales();
    loadGoals();
  }, [user?.tenantId, isLockedForStartup]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const raw = await getSetting('sales_goals', '[]');
      let parsed: any[] = [];
      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        parsed = [];
      }
      if (Array.isArray(parsed)) {
        setGoals(parsed);
      }
    } catch (error) {
      console.error('Error loading sales goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      // @ts-ignore
      const isDesktop = typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__);

      if (isDesktop) {
        const localSales = await getLocalSales(user?.tenantId ?? null);
        setSales(localSales);
      } else {
        const res = await storeOwnerAPI.getRecentSales();
        const remoteSales = res.data?.data || res.data || [];
        setSales(remoteSales);
      }
    } catch (error) {
      console.error('Error fetching sales for goal calculation:', error);
    }
  };

  const handleToggleGoalActive = async (goalId: string, currentActive: boolean) => {
    const updated = goals.map(g => g.id === goalId ? { ...g, isActive: !currentActive } : g);
    setGoals(updated);
    await setSetting('sales_goals', JSON.stringify(updated));
    toast.success(!currentActive ? 'Goal activated' : 'Goal paused');
  };

  const handleDeleteGoal = async (goalId: string) => {
    const updated = goals.filter(g => g.id !== goalId);
    setGoals(updated);
    await setSetting('sales_goals', JSON.stringify(updated));
    toast.success('Goal deleted successfully');
  };

  const handleEditGoal = (goal: SalesGoal) => {
    const { achieved } = calculateGoalProgress(goal, sales);
    const status = getGoalStatus(goal, achieved);
    const isEnded = status === 'fulfilled' || status === 'missed' || (goal.endDate && new Date().getTime() > new Date(goal.endDate).getTime());
    if (isEnded) {
      toast.error('Completed goals cannot be edited');
      return;
    }
    setEditingGoal(goal);
    setIsGoalPanelOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredGoals = useMemo(() => {
    const list = goals.filter(g => {
      const q = search.toLowerCase();
      const catConfig = GOAL_CATEGORY_OPTIONS.find(c => c.value === g.category);
      const periodConfig = GOAL_PERIOD_OPTIONS.find(p => p.value === g.period);
      const matchesSearch = 
        !search ||
        g.name?.toLowerCase().includes(q) ||
        (g.notes && g.notes.toLowerCase().includes(q)) ||
        (catConfig && catConfig.label.toLowerCase().includes(q)) ||
        (periodConfig && periodConfig.label.toLowerCase().includes(q));

      let matchesCategory = true;
      if (goalCategoryFilter !== 'all') matchesCategory = g.category === goalCategoryFilter;

      let matchesPeriod = true;
      if (goalPeriodFilter !== 'all') matchesPeriod = g.period === goalPeriodFilter;

      const { achieved } = calculateGoalProgress(g, sales);
      const status = getGoalStatus(g, achieved);

      let matchesStatus = true;
      if (goalStatusFilter !== 'all') matchesStatus = status === goalStatusFilter;

      return matchesSearch && matchesCategory && matchesPeriod && matchesStatus;
    });

    // Sort: Active In-Progress goals first, followed by completed/missed/inactive
    return list.sort((a, b) => {
      const progA = calculateGoalProgress(a, sales);
      const statusA = getGoalStatus(a, progA.achieved);
      const isEndedA = statusA === 'fulfilled' || statusA === 'missed' || (a.endDate && new Date().getTime() > new Date(a.endDate).getTime());
      const isActiveA = a.isActive && statusA === 'in_progress' && !isEndedA;

      const progB = calculateGoalProgress(b, sales);
      const statusB = getGoalStatus(b, progB.achieved);
      const isEndedB = statusB === 'fulfilled' || statusB === 'missed' || (b.endDate && new Date().getTime() > new Date(b.endDate).getTime());
      const isActiveB = b.isActive && statusB === 'in_progress' && !isEndedB;

      if (isActiveA && !isActiveB) return -1;
      if (!isActiveA && isActiveB) return 1;

      const timeA = new Date(a.createdAt || a.startDate || 0).getTime();
      const timeB = new Date(b.createdAt || b.startDate || 0).getTime();
      return timeB - timeA;
    });
  }, [goals, search, goalCategoryFilter, goalPeriodFilter, goalStatusFilter, sales]);

  const kpis = useMemo(() => {
    const totalGoals = goals.length;
    let fulfilledCount = 0;
    let inProgressCount = 0;
    let missedCount = 0;

    goals.forEach(g => {
      const { achieved } = calculateGoalProgress(g, sales);
      const status = getGoalStatus(g, achieved);
      if (status === 'fulfilled') fulfilledCount++;
      else if (status === 'missed') missedCount++;
      else inProgressCount++;
    });

    return [
      { 
        title: 'Total Goals', 
        value: totalGoals.toString(), 
        icon: Target, 
        color: 'text-blue-500', 
        bg: 'bg-blue-50 dark:bg-blue-500/10' 
      },
      { 
        title: 'Fulfilled Goals', 
        value: fulfilledCount.toString(), 
        icon: CheckCircle2, 
        color: 'text-emerald-500', 
        bg: 'bg-emerald-50 dark:bg-emerald-500/10' 
      },
      { 
        title: 'In Progress', 
        value: inProgressCount.toString(), 
        icon: TrendingUp, 
        color: 'text-violet-500', 
        bg: 'bg-violet-50 dark:bg-violet-500/10' 
      },
      { 
        title: 'Missed Goals', 
        value: missedCount.toString(), 
        icon: AlertTriangle, 
        color: 'text-rose-500', 
        bg: 'bg-rose-50 dark:bg-rose-500/10' 
      }
    ];
  }, [goals, sales]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (goalCategoryFilter !== 'all') count++;
    if (goalPeriodFilter !== 'all') count++;
    if (goalStatusFilter !== 'all') count++;
    return count;
  }, [goalCategoryFilter, goalPeriodFilter, goalStatusFilter]);

  if (isLockedForStartup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-[70vh]">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 flex items-center justify-center shadow-lg shadow-blue-500/10">
            <Target className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
            <Lock className="w-4 h-4" />
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Zap className="w-3.5 h-3.5" />
          Pro & Enterprise Feature
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 tracking-tight">
          Sales & Business Goals
        </h2>

        <p className="text-base text-gray-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
          Set customized revenue milestones, product sales targets, and track real-time pace and completion. Upgrade to Pro to unlock Goals.
        </p>

        <button
          onClick={() => setIsUpgradeModalOpen(true)}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all cursor-pointer"
        >
          <Zap className="w-4 h-4" />
          Upgrade to Pro
        </button>

        <UpgradeModal
          isOpen={isUpgradeModalOpen}
          onClose={() => setIsUpgradeModalOpen(false)}
          featureName="Goals"
          requiredTier="Pro"
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col bg-[#F4F7F6] dark:bg-slate-900 ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6 lg:p-8'}`}>
      
      {/* ──────────────── HEADER & KPIS ──────────────── */}
      {!isFullscreen && (
        <div className="mb-8">
          <div className="font-sans flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-600" />
                Goals History
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                Track target milestones, sales quotas, and fulfillment status.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  setEditingGoal(null);
                  setIsGoalPanelOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Plus className="w-5 h-5" />
                New Goal
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi, idx) => (
              <KpiCard
                key={idx}
                title={kpi.title}
                value={kpi.value}
                icon={kpi.icon}
                iconColorClass={kpi.color}
                iconBgClass={kpi.bg}
              />
            ))}
          </div>
        </div>
      )}

      {/* ──────────────── TOOLBAR CARD ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        {/* Search Bar on Left */}
        <div className="relative w-full sm:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search className="h-4 w-4" />
          </div>
          <input 
            type="text"
            placeholder="Search goals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 h-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none text-sm"
          />
          {search && (
            <button 
              type="button"
              onClick={() => setSearch('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Toolbar Controls on Right: Filter, List/Grid, Fullscreen */}
        <div className="flex bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto">
          <button 
            type="button"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center justify-center px-4 h-full rounded-xl transition-all gap-2 font-bold relative cursor-pointer text-xs sm:text-sm ${
              activeFilterCount > 0 
                ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            title="Filter Goals"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-black">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button 
            type="button"
            onClick={() => setViewMode('list')}
            title="List View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'list' 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <List className="w-4 h-4" />
          </button>

          <button 
            type="button"
            onClick={() => setViewMode('grid')}
            title="Grid View"
            className={`flex items-center justify-center w-10 h-full rounded-xl transition-all cursor-pointer ${
              viewMode === 'grid' 
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1"></div>

          <button 
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title="Full Screen"
            className="flex items-center justify-center w-10 h-full rounded-xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ──────────────── DATA CONTAINER ──────────────── */}
      <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
        {viewMode === 'list' ? (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 h-16 px-5 items-center border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/50 text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
              <div className="col-span-3">Goal & Category</div>
              <div className="col-span-2">Period & Timeline</div>
              <div className="col-span-2">Target vs Achieved</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="font-medium">Loading goals...</p>
                </div>
              ) : filteredGoals.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                  <Target className="w-12 h-12 opacity-20" />
                  <p className="font-medium text-lg text-slate-500">No goals found.</p>
                  <button
                    onClick={() => {
                      setEditingGoal(null);
                      setIsGoalPanelOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    Set New Goal
                  </button>
                </div>
              ) : (
                filteredGoals.map((g) => {
                  const catConfig = GOAL_CATEGORY_OPTIONS.find(c => c.value === g.category) || GOAL_CATEGORY_OPTIONS[0];
                  const periodConfig = GOAL_PERIOD_OPTIONS.find(p => p.value === g.period) || GOAL_PERIOD_OPTIONS[2];
                  const { achieved, percentage } = calculateGoalProgress(g, sales);
                  const status = getGoalStatus(g, achieved);
                  const isEnded = status === 'fulfilled' || status === 'missed' || (g.endDate && new Date().getTime() > new Date(g.endDate).getTime());
                  const CatIcon = catConfig.icon;

                  const formatValue = (amount: number) => {
                    if (g.category === 'sales_revenue' || g.category === 'expenses') {
                      return `Rs. ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                    }
                    return `${amount.toLocaleString()} ${catConfig.unit}`;
                  };

                  return (
                    <div 
                      key={g.id} 
                      className="grid grid-cols-12 gap-4 p-5 items-center border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Goal & Category */}
                      <div className="col-span-3 flex items-center gap-3 min-w-0">
                        <div className={`w-10 h-10 rounded-xl ${catConfig.bg} flex items-center justify-center flex-shrink-0 ${catConfig.color}`}>
                          <CatIcon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate flex items-center gap-2">
                            {g.name}
                          </h3>
                          <p className="text-xs text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <span className="font-medium text-slate-600 dark:text-slate-400">{catConfig.label}</span>
                          </p>
                        </div>
                      </div>

                      {/* Period & Timeline */}
                      <div className="col-span-2 flex flex-col justify-center min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${periodConfig.badgeColor}`}>
                            {periodConfig.short}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate mt-1">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>{formatDate(g.startDate)} - {formatDate(g.endDate)}</span>
                        </div>
                      </div>

                      {/* Target vs Achieved */}
                      <div className="col-span-2 flex flex-col justify-center min-w-0">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {formatValue(achieved)}
                        </p>
                        <p className="text-xs text-slate-400 truncate mt-0.5 font-medium">
                          Target: {formatValue(g.targetAmount)}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="col-span-2 flex flex-col justify-center min-w-0 pr-3">
                        <div className="flex justify-between items-center text-xs font-bold mb-1">
                          <span className="text-slate-500 text-[11px]">{percentage}%</span>
                          <span className={`text-[10px] font-black uppercase ${
                            status === 'fulfilled' ? 'text-emerald-600 dark:text-emerald-400' :
                            status === 'missed' ? 'text-rose-600 dark:text-rose-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`}>
                            {percentage >= 100 ? 'Achieved' : `${100 - percentage}% Left`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              status === 'fulfilled' ? 'bg-emerald-500' :
                              status === 'missed' ? 'bg-rose-500' :
                              'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, percentage)}%` }}
                          />
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-span-2 flex items-center gap-2 min-w-0">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                          status === 'fulfilled' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
                            : status === 'missed' 
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' 
                            : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                        }`}>
                          {status === 'fulfilled' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {status === 'in_progress' && <Clock className="w-3.5 h-3.5" />}
                          {status === 'missed' && <AlertTriangle className="w-3.5 h-3.5" />}
                          <span>{status === 'fulfilled' ? 'Fulfilled' : status === 'missed' ? 'Missed' : 'In Progress'}</span>
                        </span>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleGoalActive(g.id, g.isActive);
                          }}
                          title={g.isActive ? 'Goal is Active (Click to pause)' : 'Goal is Paused (Click to activate)'}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                            g.isActive 
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100' 
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${g.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {g.isActive ? 'Active' : 'Paused'}
                        </button>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!isEnded && (
                          <button
                            onClick={() => handleEditGoal(g)}
                            title="Edit Goal"
                            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setGoalToDelete(g)}
                          title="Delete Goal"
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          /* Goals Grid View */
          <div className="flex-1 overflow-y-auto no-scrollbar p-6 bg-slate-50/50 dark:bg-slate-900/50">
            {filteredGoals.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-4">
                <Target className="w-12 h-12 opacity-20" />
                <p className="font-medium text-lg text-slate-500">No goals found.</p>
                <button
                  onClick={() => {
                    setEditingGoal(null);
                    setIsGoalPanelOpen(true);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
                >
                  Set New Goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                {filteredGoals.map((g) => {
                  const catConfig = GOAL_CATEGORY_OPTIONS.find(c => c.value === g.category) || GOAL_CATEGORY_OPTIONS[0];
                  const periodConfig = GOAL_PERIOD_OPTIONS.find(p => p.value === g.period) || GOAL_PERIOD_OPTIONS[2];
                  const { achieved, percentage } = calculateGoalProgress(g, sales);
                  const status = getGoalStatus(g, achieved);
                  const isEnded = status === 'fulfilled' || status === 'missed' || (g.endDate && new Date().getTime() > new Date(g.endDate).getTime());
                  const CatIcon = catConfig.icon;

                  const formatValue = (amount: number) => {
                    if (g.category === 'sales_revenue' || g.category === 'expenses') {
                      return `Rs. ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
                    }
                    return `${amount.toLocaleString()} ${catConfig.unit}`;
                  };

                  return (
                    <div 
                      key={g.id} 
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-blue-500/50"
                    >
                      <div>
                        {/* Top Bar */}
                        <div className="flex justify-between items-start mb-4">
                          <div className={`w-12 h-12 rounded-2xl ${catConfig.bg} flex items-center justify-center ${catConfig.color}`}>
                            <CatIcon className="w-6 h-6" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider font-extrabold border ${
                              status === 'fulfilled' 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
                                : status === 'missed' 
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800/50' 
                                : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
                            }`}>
                              {status === 'fulfilled' && <CheckCircle2 className="w-3 h-3" />}
                              {status === 'in_progress' && <Clock className="w-3 h-3" />}
                              {status === 'missed' && <AlertTriangle className="w-3 h-3" />}
                              <span>{status === 'fulfilled' ? 'Fulfilled' : status === 'missed' ? 'Missed' : 'In Progress'}</span>
                            </span>

                            <button
                              onClick={() => handleToggleGoalActive(g.id, g.isActive)}
                              title={g.isActive ? 'Active (Click to pause)' : 'Paused (Click to activate)'}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                                g.isActive 
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50' 
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${g.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                              {g.isActive ? 'Active' : 'Paused'}
                            </button>
                          </div>
                        </div>

                        {/* Goal Info */}
                        <h3 className="font-black text-slate-900 dark:text-white text-lg mb-1 truncate">{g.name}</h3>
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${periodConfig.badgeColor}`}>
                            {periodConfig.label}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-bold text-slate-500 truncate">{catConfig.label}</span>
                        </div>

                        {g.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                            {g.notes}
                          </p>
                        )}

                        {/* Timeline */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(g.startDate)} — {formatDate(g.endDate)}</span>
                        </div>

                        {/* Metrics */}
                        <div className="space-y-2 mb-4 bg-slate-50/70 dark:bg-slate-800/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="flex justify-between items-baseline">
                            <span className="text-xs font-bold text-slate-500 uppercase">Achieved</span>
                            <span className="text-lg font-black text-slate-900 dark:text-white">{formatValue(achieved)}</span>
                          </div>
                          <div className="flex justify-between items-baseline text-xs text-slate-500">
                            <span className="font-medium">Target</span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">{formatValue(g.targetAmount)}</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="pt-2">
                            <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                              <span className="text-slate-600 dark:text-slate-400">{percentage}% Achieved</span>
                              <span className={`text-[11px] font-black ${
                                status === 'fulfilled' ? 'text-emerald-600' :
                                status === 'missed' ? 'text-rose-600' :
                                'text-blue-600'
                              }`}>
                                {percentage >= 100 ? '100% Completed' : `${100 - percentage}% remaining`}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  status === 'fulfilled' ? 'bg-emerald-500' :
                                  status === 'missed' ? 'bg-rose-500' :
                                  'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(100, percentage)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                        {!isEnded && (
                          <button
                            onClick={() => handleEditGoal(g)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => setGoalToDelete(g)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ──────────────── FILTERS SLIDE OUT PANEL ──────────────── */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        title="Filter Goals"
        onClear={() => {
          setGoalCategoryFilter('all');
          setGoalPeriodFilter('all');
          setGoalStatusFilter('all');
          setIsFilterOpen(false);
        }}
        onApply={() => setIsFilterOpen(false)}
      >
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Goal Category</label>
            <CustomSelect
              value={goalCategoryFilter}
              onChange={setGoalCategoryFilter}
              options={[
                { value: 'all', label: 'All Categories' },
                ...GOAL_CATEGORY_OPTIONS.map(c => ({ value: c.value, label: c.label }))
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Period</label>
            <CustomSelect
              value={goalPeriodFilter}
              onChange={setGoalPeriodFilter}
              options={[
                { value: 'all', label: 'All Periods' },
                ...GOAL_PERIOD_OPTIONS.map(p => ({ value: p.value, label: p.label }))
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Fulfillment Status</label>
            <CustomSelect
              value={goalStatusFilter}
              onChange={setGoalStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'fulfilled', label: 'Fulfilled' },
                { value: 'missed', label: 'Missed' }
              ]}
            />
          </div>
        </div>
      </FilterPanel>

      {/* ──────────────── GOAL SETTING SLIDE-OUT PANEL ──────────────── */}
      <SetGoalPanel
        isOpen={isGoalPanelOpen}
        onClose={() => {
          setIsGoalPanelOpen(false);
          setEditingGoal(null);
        }}
        onGoalUpdated={(updated) => setGoals(updated)}
        initialGoalToEdit={editingGoal}
        sales={sales}
      />

      {/* ──────────────── CONFIRM DELETE DIALOG ──────────────── */}
      <ConfirmDialog
        isOpen={!!goalToDelete}
        title="Delete Goal"
        message={`Are you sure you want to delete the goal "${goalToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Goal"
        cancelText="Cancel"
        type="danger"
        onConfirm={async () => {
          if (goalToDelete) {
            await handleDeleteGoal(goalToDelete.id);
            setGoalToDelete(null);
          }
        }}
        onCancel={() => setGoalToDelete(null)}
      />
    </div>
  );
}
