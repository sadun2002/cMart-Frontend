'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';
import { 
  CreditCard, ShieldCheck, Check, 
  Crown, Download, Clock, Zap, CheckCircle2, AlertCircle, AlertTriangle,
  Search, Filter, List, LayoutGrid, Maximize, Minimize, X, Calendar, CircleDollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PLANS, formatLKR } from '@/lib/constants';
import { useAuthStore } from '@/lib/auth-store';
import { getSubscriptionStatus } from '@/lib/subscription-utils';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { TableEmptyState } from '@/components/ui/table-empty-state';
import { FilterPanel } from '@/components/ui/filter-panel';
import { CustomSelect } from '@/components/ui/custom-select';
import { UpdatePaymentMethodPanel, SavedPaymentMethod } from '@/components/shared/UpdatePaymentMethodPanel';

export default function SubscriptionPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'PENDING' | 'FAILED'>('all');
  const [sortAmount, setSortAmount] = useState<'default' | 'asc' | 'desc'>('default');
  const [dateFilterType, setDateFilterType] = useState<'all' | 'custom'>('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [billing, setBilling] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'cancel' as 'cancel' | 'downgrade',
    targetPlan: ''
  });
  const { user, updatePlan } = useAuthStore();
  const subStatus = getSubscriptionStatus(user);
  const activePlanKey = (user?.tenant?.plan || 'STARTUP').toUpperCase() as keyof typeof PLANS;
  const currentPlanData = PLANS[activePlanKey] || PLANS.STARTUP;

  // Payment Method Right Panel State
  const [isPaymentPanelOpen, setIsPaymentPanelOpen] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState<SavedPaymentMethod | null>(null);

  useEffect(() => {
    const loadPaymentMethod = () => {
      try {
        const stored = localStorage.getItem('cmart_saved_payment_methods');
        if (stored) {
          const list: SavedPaymentMethod[] = JSON.parse(stored);
          if (Array.isArray(list) && list.length > 0) {
            const def = list.find(m => m.isDefault) || list[0];
            setCurrentPaymentMethod(def);
            return;
          }
        }
      } catch (e) {}
    };

    loadPaymentMethod();
    window.addEventListener('cmart_payment_methods_updated', loadPaymentMethod);
    return () => window.removeEventListener('cmart_payment_methods_updated', loadPaymentMethod);
  }, []);

  // Real free trial state
  const subscription = user?.tenant?.subscription;
  const isFreeTrial = subscription?.status === 'TRIAL' || (activePlanKey === 'STARTUP' && subscription?.trialEndDate);
  
  let trialDaysLeft = 0;
  let trialHoursLeft = 0;
  let trialText = '';
  
  if (subscription?.trialEndDate) {
    const msLeft = new Date(subscription.trialEndDate).getTime() - Date.now();
    trialDaysLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60 * 24)));
    trialHoursLeft = Math.max(0, Math.floor(msLeft / (1000 * 60 * 60)));
    
    if (trialDaysLeft > 0) {
      trialText = `${trialDaysLeft} days remaining`;
    } else if (trialHoursLeft > 0) {
      trialText = `${trialHoursLeft} hours remaining`;
    } else {
      trialText = 'Trial expired';
    }
  }

  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchBillingHistory = async () => {
      try {
        const response = await userAPI.getBillingHistory();
        setBillingHistory(response.data?.data || response.data || []);
      } catch (error) {
        console.error('Failed to fetch billing history:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchBillingHistory();
  }, []);

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.actionType === 'downgrade') {
        const planKey = Object.keys(PLANS).find(k => PLANS[k as keyof typeof PLANS].name === confirmDialog.targetPlan) as keyof typeof PLANS;
        if (planKey) await updatePlan(planKey);
      } else if (confirmDialog.actionType === 'cancel') {
        await updatePlan('STARTUP'); // Default fallback plan after cancellation
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
    } finally {
      setConfirmDialog(prev => ({ ...prev, isOpen: false }));
    }
  };

  const filteredBillingHistory = useMemo(() => {
    let result = billingHistory.filter(record => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        (record.payhereRef && record.payhereRef.toLowerCase().includes(q)) ||
        (`inv-${record.id}`).toLowerCase().includes(q) ||
        (record.status && record.status.toLowerCase().includes(q)) ||
        String(record.amountLKR || '').includes(q);

      if (!matchesSearch) return false;

      if (statusFilter !== 'all' && record.status !== statusFilter) return false;

      if (dateFilterType !== 'all') {
        const itemTime = new Date(record.createdAt).getTime();
        if (fromDate) {
          const fromTime = new Date(`${fromDate}T00:00:00`).getTime();
          if (!isNaN(fromTime) && itemTime < fromTime) return false;
        }
        if (toDate) {
          const toTime = new Date(`${toDate}T23:59:59.999`).getTime();
          if (!isNaN(toTime) && itemTime > toTime) return false;
        }
      }

      return true;
    });

    if (sortAmount === 'asc') {
      result = [...result].sort((a, b) => (Number(a.amountLKR) || 0) - (Number(b.amountLKR) || 0));
    } else if (sortAmount === 'desc') {
      result = [...result].sort((a, b) => (Number(b.amountLKR) || 0) - (Number(a.amountLKR) || 0));
    }

    return result;
  }, [billingHistory, searchQuery, statusFilter, sortAmount, dateFilterType, fromDate, toDate]);

  return (
    <div className={`font-sans flex flex-col bg-slate-50 dark:bg-slate-900/50 overflow-hidden ${isFullscreen ? 'h-full p-2 sm:p-4' : 'h-full p-6'}`}>
      
      {/* ──────────────── HEADER ──────────────── */}
      {!isFullscreen && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 shrink-0">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex flex-wrap items-center gap-3">
              <CreditCard className="w-8 h-8 text-blue-600" />
              <span>Subscription & Billing - {currentPlanData.name} Plan</span>
              {subStatus.isExpired ? (
                <span className="bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Expired
                </span>
              ) : subStatus.isTrial ? (
                <span className="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Free Trial
                </span>
              ) : (
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              )}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {subStatus.isExpired 
                ? `Your ${currentPlanData.name} plan subscription has expired${subStatus.formattedEndDate ? ` on ${subStatus.formattedEndDate}` : ''}. Renew your plan below to restore access.`
                : subStatus.isTrial 
                  ? `You are currently on a Free Trial. ${subStatus.daysLeft !== null && subStatus.daysLeft > 0 ? `${subStatus.daysLeft} days remaining` : `${subStatus.hoursLeft} hours remaining`}.`
                  : `Your next billing date is ${subStatus.formattedEndDate || 'scheduled'} for ${formatLKR(billing === 'yearly' ? currentPlanData.priceYearly / 12 : currentPlanData.priceMonthly)}.`
              }
            </p>
          </div>

          <div className="shrink-0">
            {subStatus.isExpired ? (
              <Link 
                href={`/checkout?plan=${activePlanKey}&billing=${billing}`}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap cursor-pointer"
              >
                <Zap className="w-5 h-5" />
                Renew Now
              </Link>
            ) : (
              <button 
                type="button"
                onClick={() => setIsPaymentPanelOpen(true)}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                Manage Payment Method
              </button>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── NAVIGATION TABS & UNIFIED TOOLBAR ──────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
        {/* Left: Mode Toggle (Billing Overview | Billing History) */}
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
            Billing Overview
          </button>

          <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

          <button 
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center px-5 h-full rounded-xl transition-all font-bold text-xs sm:text-sm cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            Billing History
          </button>
        </div>

        {/* Right: Unified Toolbar Card ONLY shown when activeTab === 'history' */}
        {activeTab === 'history' && (
          <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm h-12 p-1 overflow-hidden shrink-0 ml-auto w-full sm:w-auto">
            {/* Integrated Search Bar on Left */}
            <div className="relative flex items-center flex-1 sm:w-60 h-full pl-3 pr-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0 pointer-events-none" />
              <input 
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-0 outline-none text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 placeholder:font-medium"
              />
              {searchQuery && (
                <button 
                  type="button"
                  onClick={() => setSearchQuery('')}
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
              {(statusFilter !== 'all' || sortAmount !== 'default' || dateFilterType !== 'all') && (
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              )}
            </button>
            
            <div className="w-px h-full bg-slate-200 dark:bg-slate-800 mx-1" />

            {/* View Mode Toggles */}
            <button 
              type="button"
              onClick={() => setViewMode('list')}
              title="List View"
              className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
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
              className={`flex items-center justify-center w-10 sm:w-11 h-full rounded-xl transition-all cursor-pointer ${
                viewMode === 'grid'
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
        )}
      </div>


      {/* ──────────────── TAB CONTENT: OVERVIEW OR HISTORY ──────────────── */}
      {activeTab === 'overview' ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pr-1 pb-10">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            
            {/* Upgrade / Available Plans */}
            <div className="font-sans space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Available Plans</h3>
                
                {/* Toggle */}
                <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm w-fit mx-auto sm:mx-0">
                  <button 
                    onClick={() => setBilling('monthly')}
                    className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center cursor-pointer ${billing === 'monthly' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Monthly
                  </button>
                  <button 
                    onClick={() => setBilling('yearly')}
                    className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 cursor-pointer ${billing === 'yearly' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Annually
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">-20%</span>
                  </button>
                  <button 
                    onClick={() => setBilling('lifetime')}
                    className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center cursor-pointer ${billing === 'lifetime' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    Lifetime
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch text-left">
                {[
                  {
                    key: 'STARTUP',
                    name: PLANS.STARTUP.name,
                    price: billing === 'lifetime' ? PLANS.STARTUP.priceLifetime : billing === 'yearly' ? (PLANS.STARTUP.priceYearly / 12) : PLANS.STARTUP.priceMonthly,
                    period: billing === 'lifetime' ? 'once' : '/month',
                    features: PLANS.STARTUP.features,
                    highlight: false,
                    rank: 0,
                  },
                  {
                    key: 'PRO',
                    name: PLANS.PRO.name,
                    price: billing === 'lifetime' ? null : billing === 'yearly' ? (PLANS.PRO.priceYearly / 12) : PLANS.PRO.priceMonthly,
                    period: '/month',
                    features: PLANS.PRO.features,
                    highlight: true,
                    rank: 1,
                  },
                  {
                    key: 'ENTERPRISE',
                    name: PLANS.ENTERPRISE.name,
                    price: billing === 'lifetime' ? null : billing === 'yearly' ? (PLANS.ENTERPRISE.priceYearly / 12) : PLANS.ENTERPRISE.priceMonthly,
                    period: '/month',
                    features: PLANS.ENTERPRISE.features,
                    highlight: false,
                    rank: 2,
                  },
                ].map((plan) => {
                  
                  let cta = 'Start Free Trial';
                  let href = '/register';
                  let disabled = false;
                  let isCurrent = false;
                  let isDowngrade = false;
                  let isCancel = false;

                  let userRank = 0;
                  if (activePlanKey === 'PRO') userRank = 1;
                  else if (activePlanKey === 'ENTERPRISE') userRank = 2;

                  const billingParam = billing;
                  const isUnavailable = plan.price === null;
                  
                  const hasActiveSubscription = subStatus.isActive && !subStatus.isExpired;

                  if (isUnavailable) {
                    cta = 'Not Available';
                    href = '#';
                    disabled = true;
                  } else if (!hasActiveSubscription) {
                    if (userRank === plan.rank && !isFreeTrial) {
                      cta = `Renew ${plan.name}`;
                    } else {
                      cta = `Upgrade to ${plan.name}`;
                    }
                    href = `/checkout?plan=${plan.key}&billing=${billingParam}`;
                    disabled = false;
                    isDowngrade = false;
                    isCancel = false;
                    isCurrent = userRank === plan.rank;
                  } else if (userRank === plan.rank) {
                    if (activePlanKey === 'STARTUP' && isFreeTrial) {
                      cta = `Free Trial (${trialText})`;
                      disabled = true;
                    } else {
                      cta = 'Cancel Plan';
                      isCancel = true;
                    }
                    isCurrent = true;
                  } else if (userRank < plan.rank) {
                    cta = `Upgrade to ${plan.name}`;
                    href = `/checkout?plan=${plan.key}&billing=${billingParam}`;
                  } else {
                    cta = `Downgrade to ${plan.name}`;
                    isDowngrade = true;
                    href = '#';
                  }

                  return (
                  <div
                    key={plan.key}
                    className={`rounded-2xl flex flex-col h-full ${
                      plan.highlight
                        ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300/50 dark:shadow-none pt-8 px-8 pb-7 md:scale-105'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-7 shadow-sm'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="text-xs font-bold bg-white/20 text-white px-2 py-0.5 rounded-full w-fit mb-3">
                        Most Popular
                      </div>
                    )}

                    <h3 className={`font-bold text-lg ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-2 mb-6 text-left flex flex-col min-h-[80px]">
                      {isUnavailable ? (
                        <div className="flex flex-col justify-center h-full">
                          <span className={`text-2xl font-black ${plan.highlight ? 'text-white' : 'text-gray-500'}`}>Not available</span>
                          <span className={`text-sm ${plan.highlight ? 'text-blue-200' : 'text-gray-400'}`}>for lifetime billing</span>
                        </div>
                      ) : (
                        <>
                          <div>
                            <span className={`text-3xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                              {formatLKR(plan.price!)}
                            </span>
                            <span className={`text-sm ml-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                              {plan.period}
                            </span>
                          </div>
                          <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500"} ${!(billing === 'yearly' && plan.period !== 'once') ? 'invisible' : ''}`}>
                            Billed annually
                          </p>
                        </>
                      )}
                    </div>
                    <ul className="space-y-2.5 flex-1 mb-6">
                      {plan.features.map((f) => (
                        <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? 'text-blue-100' : 'text-gray-600 dark:text-slate-400'}`}>
                          <span className={`mt-0.5 ${plan.highlight ? 'text-white' : 'text-green-500'}`}>✓</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className={`mt-auto pt-6 border-t ${plan.highlight ? 'border-white/20' : 'border-gray-100 dark:border-slate-800'}`}>
                      {disabled ? (
                        <div
                          onClick={() => {
                            if (plan.key === 'PRO' || plan.key === 'ENTERPRISE') {
                              toast.info('This plan is coming soon!');
                            }
                          }}
                          className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors ${plan.key === 'PRO' || plan.key === 'ENTERPRISE' ? 'cursor-pointer hover:opacity-90' : 'cursor-default'} ${
                            isUnavailable
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              : isCurrent && isFreeTrial
                                ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10'
                                : plan.highlight
                                  ? 'bg-white text-blue-600'
                                  : 'bg-blue-600 text-white'
                          }`}
                        >
                          {cta}
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            if (isCancel) {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Cancel Plan',
                                message: 'Are you sure you want to cancel your current plan? You will lose access to premium features and data might be restricted.',
                                actionType: 'cancel',
                                targetPlan: plan.name
                              });
                            } else if (isDowngrade) {
                              setConfirmDialog({
                                isOpen: true,
                                title: `Downgrade to ${plan.name}`,
                                message: `Are you sure you want to downgrade to the ${plan.name} plan? You may lose access to some premium features.`,
                                actionType: 'downgrade',
                                targetPlan: plan.name
                              });
                            } else {
                              window.open(href, '_blank');
                            }
                          }}
                          className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                            plan.highlight
                              ? 'bg-white text-blue-600 hover:bg-gray-50'
                              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30'
                          }`}
                        >
                          {cta}
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* ──────────────── TAB CONTENT: BILLING HISTORY ──────────────── */
        <div className={`flex-1 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px] ${isFullscreen ? 'm-0 rounded-none border-none' : ''}`}>
          <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
            <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              Billing History ({filteredBillingHistory.length})
            </h2>
          </div>

          <div className="flex-1 overflow-auto custom-scrollbar p-6">
            {isLoadingHistory ? (
              <div className="py-20 text-center text-slate-400 font-medium">
                Loading billing records...
              </div>
            ) : filteredBillingHistory.length === 0 ? (
              <TableEmptyState
                icon={CreditCard}
                title="No billing records match"
                description="No billing or payment records match your search or filter criteria."
              />
            ) : viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                    <tr>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Invoice ID</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Billing Date</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Plan / Type</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Amount</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">Status</th>
                      <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredBillingHistory.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="p-4">
                          <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                            {record.payhereRef || `#INV-${record.id}`}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                          {new Date(record.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="p-4 text-sm font-bold text-slate-900 dark:text-white">
                          Subscription Renewal
                        </td>
                        <td className="p-4 text-sm font-black text-slate-900 dark:text-white">
                          {formatLKR(record.amountLKR)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            record.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
                            record.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' :
                            'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => toast.success(`Receipt for ${record.payhereRef || `#INV-${record.id}`} downloaded.`)}
                            className="text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBillingHistory.map((record) => (
                  <div key={record.id} className="bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 dark:text-white text-base">
                              {record.payhereRef || `#INV-${record.id}`}
                            </h4>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                              {new Date(record.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          record.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50' :
                          record.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50' :
                          'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                        }`}>
                          {record.status}
                        </span>
                      </div>
                      <div className="mt-5 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Amount</span>
                          <span className="text-base font-black text-slate-900 dark:text-white">
                            {formatLKR(record.amountLKR)}
                          </span>
                        </div>
                        <button
                          onClick={() => toast.success(`Receipt for ${record.payhereRef || `#INV-${record.id}`} downloaded.`)}
                          className="text-blue-600 hover:text-blue-700 font-bold text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────── FILTERS SLIDE OUT RIGHT PANEL ──────────────── */}
      <AnimatePresence>
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filter Invoices"
          onClear={() => {
            setStatusFilter('all');
            setSortAmount('default');
            setDateFilterType('all');
            setFromDate('');
            setToDate('');
            setIsFilterOpen(false);
          }}
          onApply={() => setIsFilterOpen(false)}
        >
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Invoice Status</label>
            <CustomSelect
              icon={CheckCircle2}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as any)}
              options={[
                { value: 'all', label: 'All Invoices' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'FAILED', label: 'Failed' },
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Sort By Amount</label>
            <CustomSelect
              icon={CircleDollarSign}
              value={sortAmount}
              onChange={(val) => setSortAmount(val as any)}
              options={[
                { value: 'default', label: 'Default (Latest First)' },
                { value: 'asc', label: 'Amount: Low to High' },
                { value: 'desc', label: 'Amount: High to Low' },
              ]}
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-900 dark:text-white">Date Filter</label>
            <CustomSelect
              icon={Calendar}
              value={dateFilterType}
              onChange={(val) => setDateFilterType(val as any)}
              options={[
                { value: 'all', label: 'All Time' },
                { value: 'custom', label: 'Custom Date Range' },
              ]}
            />
            
            {dateFilterType !== 'all' && (
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">From</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input 
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-1">To</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input 
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-500 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </FilterPanel>
      </AnimatePresence>

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.actionType === 'cancel' ? 'Yes, Cancel' : 'Yes, Downgrade'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.actionType === 'cancel' ? 'danger' : 'warning'}
      />

      {/* ──────────────── UPDATE PAYMENT METHOD RIGHT PANEL ──────────────── */}
      <UpdatePaymentMethodPanel 
        isOpen={isPaymentPanelOpen}
        onClose={() => setIsPaymentPanelOpen(false)}
        onSuccess={(savedMethod) => {
          setCurrentPaymentMethod(savedMethod);
          setIsPaymentPanelOpen(false);
        }}
        currentPlanName={currentPlanData.name}
        renewalAmountLKR={billing === 'yearly' ? currentPlanData.priceYearly : currentPlanData.priceMonthly}
        renewalDate={subStatus.formattedEndDate || undefined}
        billingCycle={billing}
      />

    </div>
  );
}

