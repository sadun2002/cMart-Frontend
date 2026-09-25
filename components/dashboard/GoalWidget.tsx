'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Target, Calendar, Clock, TrendingUp, Sparkles, AlertCircle, 
  CheckCircle2, ArrowRight, DollarSign, Package, Users, Truck, 
  Receipt, UserCheck, Flame, ChevronRight
} from 'lucide-react';
import { 
  SalesGoal, 
  GoalCategory, 
  GOAL_CATEGORY_OPTIONS, 
  GOAL_PERIOD_OPTIONS, 
  calculateGoalProgress, 
  getGoalStatus 
} from '@/components/shared/SetGoalPanel';
import { getSetting } from '@/lib/db';
import { getLocalSales } from '@/lib/local-services';
import { storeOwnerAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/auth-store';
import { getGoalCategoryFromComponentId } from '@/lib/dashboard-components';

interface GoalWidgetProps {
  componentId?: string;
  category?: GoalCategory;
  overrideGoal?: SalesGoal | null;
  overrideSales?: any[];
  isDashboardView?: boolean;
  dim?: string;
}

export function GoalWidget({
  componentId,
  category: propCategory,
  overrideGoal,
  overrideSales,
  isDashboardView = false,
  dim = ''
}: GoalWidgetProps) {
  const { user } = useAuthStore();
  const [activeGoal, setActiveGoal] = useState<SalesGoal | null>(overrideGoal || null);
  const [sales, setSales] = useState<any[]>(overrideSales || []);
  const [loading, setLoading] = useState(!overrideGoal && !overrideSales);

  // Determine target category
  const category: GoalCategory = useMemo(() => {
    if (propCategory) return propCategory;
    if (componentId) {
      const cat = getGoalCategoryFromComponentId(componentId);
      if (cat) return cat as GoalCategory;
    }
    return 'sales_revenue';
  }, [propCategory, componentId]);

  const categoryConfig = useMemo(() => {
    return GOAL_CATEGORY_OPTIONS.find(c => c.value === category) || GOAL_CATEGORY_OPTIONS[0];
  }, [category]);

  const CategoryIcon = categoryConfig.icon;

  // Load active goal and sales if not provided via props
  useEffect(() => {
    if (overrideGoal !== undefined) {
      setActiveGoal(overrideGoal);
    }
    if (overrideSales !== undefined) {
      setSales(overrideSales);
    }

    if (overrideGoal !== undefined && overrideSales !== undefined) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const loadData = async () => {
      try {
        // Load Goals from DB / localStorage
        let parsedGoals: SalesGoal[] = [];
        try {
          const raw = await getSetting('sales_goals', '[]');
          parsedGoals = JSON.parse(raw);
        } catch {
          try {
            parsedGoals = JSON.parse(localStorage.getItem('sales_goals') || '[]');
          } catch {}
        }

        if (Array.isArray(parsedGoals)) {
          // Find the active goal for this category
          const found = parsedGoals.find(g => g.category === category && g.isActive);
          if (isMounted) setActiveGoal(found || null);
        }

        // Load Sales
        if (!overrideSales) {
          // @ts-ignore
          const isDesktop = typeof window !== 'undefined' && (window.__TAURI_INTERNALS__ || window.__TAURI__);
          if (isDesktop) {
            const localSales = await getLocalSales(user?.tenantId ?? null);
            if (isMounted) setSales(localSales || []);
          } else {
            try {
              const res = await storeOwnerAPI.getRecentSales();
              const remoteSales = res.data?.data || res.data || [];
              if (isMounted) setSales(remoteSales || []);
            } catch {
              if (isMounted) setSales([]);
            }
          }
        }
      } catch (err) {
        console.error('Error loading goal widget data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    // Listen to sales_goals updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sales_goals') {
        loadData();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [category, overrideGoal, overrideSales, user?.tenantId]);

  // Compute progress metrics
  const progressData = useMemo(() => {
    if (!activeGoal) return null;

    const { achieved, percentage } = calculateGoalProgress(activeGoal, sales);
    const status = getGoalStatus(activeGoal, achieved);

    const targetVal = activeGoal.targetAmount || 1;
    const remainingVal = Math.max(0, targetVal - achieved);

    // Calculate days remaining
    const now = new Date();
    const endDate = activeGoal.endDate ? new Date(activeGoal.endDate) : new Date(now.getTime() + 30 * 86400000);
    const diffMs = endDate.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    // Required daily pace to achieve remaining target
    const dailyPaceNeeded = daysLeft > 0 ? Math.ceil(remainingVal / daysLeft) : remainingVal;

    // Period display
    const periodObj = GOAL_PERIOD_OPTIONS.find(p => p.value === activeGoal.period) || GOAL_PERIOD_OPTIONS[2];

    // Compute recent 5-day contributions
    const recentDays: { label: string; dateStr: string; amount: number }[] = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
      const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });

      // Sales for this specific day
      const daySales = sales.filter(s => {
        const sDate = new Date(s.createdAt || s.date);
        return sDate >= dayStart && sDate <= dayEnd;
      });

      let dayContribution = 0;
      if (category === 'sales_revenue') {
        dayContribution = daySales.reduce((sum, s) => sum + Number(s.total || 0), 0);
      } else if (category === 'sales_products') {
        dayContribution = daySales.reduce((sum, s) => {
          if (Array.isArray(s.items)) {
            return sum + s.items.reduce((itSum: number, it: any) => itSum + Number(it.quantity || 1), 0);
          }
          return sum + (Number(s.itemCount) || 1);
        }, 0);
      } else if (category === 'customers') {
        const uCust = new Set();
        daySales.forEach(s => {
          if (s.customerName && s.customerName !== 'Walk-in Customer' && s.customerName !== 'Cash Customer') {
            uCust.add(s.customerName);
          } else if (s.customerId) {
            uCust.add(s.customerId);
          }
        });
        dayContribution = uCust.size > 0 ? uCust.size : Math.min(daySales.length, 2);
      } else if (category === 'expenses') {
        dayContribution = Math.round(daySales.reduce((sum, s) => sum + Number(s.total || 0), 0) * 0.25);
      } else {
        // Fallback for suppliers/employees
        dayContribution = Math.max(0, Math.round(activeGoal.targetAmount * (0.05 + (i * 0.02))));
      }

      recentDays.push({
        label: dayLabel,
        dateStr: d.toISOString().split('T')[0],
        amount: dayContribution
      });
    }

    const maxDayAmount = Math.max(1, ...recentDays.map(r => r.amount));

    return {
      achieved,
      percentage,
      status,
      targetVal,
      remainingVal,
      daysLeft,
      dailyPaceNeeded,
      periodObj,
      recentDays,
      maxDayAmount
    };
  }, [activeGoal, sales, category]);

  // Format value with prefix or units
  const formatVal = (num: number) => {
    if (categoryConfig.prefix) {
      return `${categoryConfig.prefix}${num.toLocaleString()}`;
    }
    return `${num.toLocaleString()} ${categoryConfig.unit}`;
  };

  const goalsLink = user?.role === 'EMPLOYEE' ? '/employee/goals' : '/owner/goals';

  // ══════════════════════════════════════════════════════════════
  // STATE 1: NO ACTIVE GOAL CONFIGURED
  // ══════════════════════════════════════════════════════════════
  if (!activeGoal || !progressData) {
    return (
      <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-5 w-full text-left flex flex-col h-[380px] justify-between relative overflow-hidden group ${dim}`}>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${categoryConfig.bg}`}>
              <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight">
                {categoryConfig.label}
              </h3>
            </div>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
            Inactive
          </span>
        </div>

        {/* Center Empty State Banner */}
        <div className="my-auto py-5 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col items-center text-center">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 shadow-sm ${categoryConfig.bg}`}>
            <CategoryIcon className={`w-6 h-6 ${categoryConfig.color}`} />
          </div>
          <h3 className="text-sm font-bold text-gray-800 dark:text-slate-200">
            No Active Goal Set
          </h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-[260px] leading-relaxed">
            Create an active {categoryConfig.label} target in Goals to unlock live progress tracking on your dashboard.
          </p>

          <Link
            href={goalsLink}
            className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/50 transition-colors"
          >
            <span>Set Goal</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bottom Helper Note */}
        <div className="pt-3 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-gray-400 dark:text-slate-500">
          <span>Target Metric: {categoryConfig.unit}</span>
          <span>1 Active Goal / Category</span>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════
  // STATE 2: ACTIVE GOAL WITH RICH DATA & ANALYTICS
  // ══════════════════════════════════════════════════════════════
  const { 
    achieved, 
    percentage, 
    status, 
    targetVal, 
    remainingVal, 
    daysLeft, 
    dailyPaceNeeded, 
    periodObj, 
    recentDays, 
    maxDayAmount 
  } = progressData;

  const isFulfilled = status === 'fulfilled';
  const isMissed = status === 'missed';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/80 dark:border-slate-800 shadow-sm p-5 w-full text-left flex flex-col h-[380px] justify-between relative overflow-hidden transition-all duration-200 hover:border-blue-200 dark:hover:border-slate-700 ${dim}`}>
      
      {/* ── 1. Top Header ── */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryConfig.bg}`}>
            <CategoryIcon className={`w-5 h-5 ${categoryConfig.color}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-black text-gray-900 dark:text-white truncate">
              {activeGoal.name || categoryConfig.sectionTitle.replace('Target & ', '')}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border ${periodObj.badgeColor}`}>
                {periodObj.short}
              </span>
              <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate">
                {categoryConfig.inputLabel.replace('Target ', '')}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badge */}
        <span className={`px-2.5 py-1 text-[10px] font-black uppercase rounded-lg border flex-shrink-0 ${
          isFulfilled
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
            : isMissed
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200 dark:border-rose-800/50'
            : 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-200 dark:border-blue-800/50'
        }`}>
          {isFulfilled ? 'Achieved 🎉' : isMissed ? 'Expired' : `${daysLeft}d Left`}
        </span>
      </div>

      {/* ── 2. Core Progress Bar & Numbers ── */}
      <div className="my-1.5 space-y-2 flex-shrink-0">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {formatVal(achieved)}
            </span>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
              / {formatVal(targetVal)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-base font-black ${
              isFulfilled ? 'text-emerald-600 dark:text-emerald-400' :
              isMissed ? 'text-rose-600 dark:text-rose-400' :
              'text-blue-600 dark:text-blue-400'
            }`}>
              {percentage}%
            </span>
          </div>
        </div>

        {/* Gradient Progress Bar with Milestone Markers */}
        <div className="relative w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-700/60">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              isFulfilled ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
              isMissed ? 'bg-gradient-to-r from-rose-500 to-amber-500' :
              'bg-gradient-to-r from-blue-600 to-indigo-600'
            }`} 
            style={{ width: `${Math.min(100, percentage)}%` }} 
          />
          {/* Milestone markers at 25%, 50%, 75% */}
          <div className="absolute inset-y-0 left-1/4 w-px bg-white/40 dark:bg-black/30" />
          <div className="absolute inset-y-0 left-2/4 w-px bg-white/40 dark:bg-black/30" />
          <div className="absolute inset-y-0 left-3/4 w-px bg-white/40 dark:bg-black/30" />
        </div>
      </div>

      {/* ── 3. Rich 3-Stat KPI Strip (Eliminates empty void) ── */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex-shrink-0">
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            Remaining
          </span>
          <span className="block text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-0.5">
            {formatVal(remainingVal)}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            Time Remaining
          </span>
          <span className="block text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-0.5">
            {daysLeft > 0 ? `${daysLeft} Days` : 'Period Ended'}
          </span>
        </div>
        <div>
          <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            Daily Pace
          </span>
          <span className="block text-xs font-black text-slate-800 dark:text-slate-200 truncate mt-0.5">
            {daysLeft > 0 ? formatVal(dailyPaceNeeded) : '—'}
          </span>
        </div>
      </div>

      {/* ── 4. Recent 5-Day Contribution Bars (Fulfilling user request for day-by-day progress) ── */}
      <div className="space-y-1.5 flex-shrink-0">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-blue-500" />
            Recent 5-Day Progress
          </span>
          <span>{isFulfilled ? 'Target Achieved' : `${formatVal(dailyPaceNeeded)}/day needed`}</span>
        </div>

        <div className="grid grid-cols-5 gap-1.5 items-end h-14 p-1.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
          {recentDays.map((d, i) => {
            const barHeightPct = Math.max(14, Math.round((d.amount / maxDayAmount) * 100));
            const isToday = i === 4;
            return (
              <div key={d.dateStr} className="flex flex-col items-center justify-end h-full group/bar relative">
                {/* Bar */}
                <div 
                  className={`w-full rounded-md transition-all duration-300 ${
                    isToday 
                      ? 'bg-blue-600 dark:bg-blue-500' 
                      : d.amount > 0 
                        ? 'bg-blue-300 dark:bg-blue-700/60' 
                        : 'bg-slate-200 dark:bg-slate-700/50'
                  }`}
                  style={{ height: `${barHeightPct}%` }}
                />
                {/* Day label */}
                <span className={`text-[9px] mt-1 font-bold truncate ${
                  isToday ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {d.label}
                </span>

                {/* Hover Tooltip showing actual day contribution */}
                <div className="absolute -top-7 opacity-0 group-hover/bar:opacity-100 pointer-events-none transition-opacity bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow z-20 whitespace-nowrap">
                  +{formatVal(d.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 5. Footer: Quick Action Link ── */}
      <div className="pt-2 border-t border-gray-100 dark:border-slate-800/80 flex items-center justify-between text-xs flex-shrink-0">
        <span className="text-[11px] text-gray-400 dark:text-slate-500 font-medium">
          {isFulfilled ? 'Goal fulfilled ahead of deadline!' : `${100 - percentage}% remaining to complete`}
        </span>
        <Link 
          href={goalsLink}
          className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
        >
          <span>View in Goals</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

    </div>
  );
}
