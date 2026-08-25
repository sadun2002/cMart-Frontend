'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { userAPI } from '@/lib/api';
import { 
  CreditCard, ShieldCheck, Check, 
  Crown, Download, Clock, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PLANS, formatLKR } from '@/lib/constants';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuthStore } from '@/lib/auth-store';

// Using real billing history now

export default function SubscriptionPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly' | 'lifetime'>('yearly');
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    actionType: 'cancel' as 'cancel' | 'downgrade',
    targetPlan: ''
  });
  const { user, updatePlan } = useAuthStore();
  const activePlanKey = (user?.tenant?.plan || 'STARTUP').toUpperCase() as keyof typeof PLANS;
  const currentPlanData = PLANS[activePlanKey] || PLANS.STARTUP;

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

  return (
    <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6 relative overflow-hidden overflow-y-auto">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-blue-600" />
            Subscription & Billing
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your current plan, payment methods, and billing history.</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full space-y-8 pb-10">
        
        {/* Current Plan Alert */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 gap-6 relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3"></div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 z-10">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-500/20">
              <Crown className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{currentPlanData.name} Plan</h2>
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-100 dark:border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {activePlanKey === 'STARTUP' && isFreeTrial ? `You are currently on a Free Trial. ${trialText}.` : activePlanKey === 'STARTUP' ? 'You are currently on the Startup plan.' : `Your next billing date is September 01, 2026 for ${formatLKR(billing === 'yearly' ? currentPlanData.priceYearly / 12 : currentPlanData.priceMonthly)}.`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto z-10">
            <button 
              onClick={() => alert("Redirecting to payment gateway...")}
              className="flex-1 lg:flex-none px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap"
            >
              Update Payment Method
            </button>
          </div>
        </div>

        {/* Upgrade / Available Plans */}
        <div className="font-sans space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Available Plans</h3>
            
            {/* Toggle */}
            <div className="flex items-center justify-center gap-1 sm:gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm w-fit mx-auto sm:mx-0">
              <button 
                onClick={() => setBilling('monthly')}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${billing === 'monthly' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBilling('yearly')}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center gap-1.5 ${billing === 'yearly' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Annually
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">-20%</span>
              </button>
              <button 
                onClick={() => setBilling('lifetime')}
                className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex items-center justify-center ${billing === 'lifetime' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Lifetime
                <span className="text-[10px] font-black text-blue-600 bg-blue-100 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">Startup Only</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
            {[PLANS.STARTUP, PLANS.PRO, PLANS.ENTERPRISE].map((plan, i) => {
              const isCurrent = plan.name.toUpperCase() === activePlanKey;
              const isUnavailable = billing === 'lifetime' && plan.priceLifetime === null;
              const price = billing === 'lifetime' ? plan.priceLifetime : billing === 'yearly' && plan.priceYearly ? plan.priceYearly / 12 : plan.priceMonthly;
              const period = billing === 'lifetime' ? 'once' : '/mo';

              let cta = 'Start Free Trial';
              let isDowngrade = false;
              let isCancel = false;

              let userRank = 0;
              if (activePlanKey === 'PRO') userRank = 1;
              else if (activePlanKey === 'ENTERPRISE') userRank = 2;

              if (plan.name.toUpperCase() === 'PRO' || plan.name.toUpperCase() === 'ENTERPRISE') {
                cta = 'Coming Soon';
              } else if (isUnavailable) {
                cta = 'Not Available';
              } else if (userRank === i) {
                if (activePlanKey === 'STARTUP' && isFreeTrial) {
                  cta = `Free Trial (${trialText})`;
                } else {
                  cta = 'Cancel Plan';
                  isCancel = true;
                }
              } else if (userRank < i) {
                cta = `Upgrade to ${plan.name}`;
              } else {
                cta = `Downgrade to ${plan.name}`;
                isDowngrade = true;
              }
              
              return (
                <div key={i} className={`relative bg-white dark:bg-slate-900 rounded-3xl p-4 lg:p-6 transition-all flex flex-col h-full ${isCurrent ? 'ring-2 ring-blue-500 shadow-md' : 'border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'} ${isUnavailable ? 'opacity-70 pointer-events-none' : ''}`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Current Plan
                    </div>
                  )}
                  
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{plan.name}</h4>
                  
                  <div className="flex items-baseline gap-1 mb-6 min-h-[40px]">
                    {isUnavailable ? (
                      <div className="flex flex-col justify-center w-full">
                        <span className="text-xl font-black text-slate-500">Not available</span>
                        <span className="text-xs text-slate-400">for lifetime billing</span>
                      </div>
                    ) : price === 0 ? (
                      <span className="text-3xl font-black text-slate-900 dark:text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl md:text-lg lg:text-3xl font-black text-slate-900 dark:text-white">{formatLKR(price!)}</span>
                        <span className="text-slate-500 font-medium">{period}</span>
                      </>
                    )}
                  </div>

                  <button 
                    onClick={() => {
                      if (plan.name.toUpperCase() === 'PRO' || plan.name.toUpperCase() === 'ENTERPRISE') {
                        toast.info('This plan is coming soon!');
                        return;
                      }
                      if (isUnavailable || (isCurrent && isFreeTrial)) return;
                      
                      if (isCancel) {
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Cancel Plan',
                          message: 'Are you sure you want to cancel your current plan? You will lose access to premium features.',
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
                        window.open(`/checkout?plan=${plan.name.toUpperCase()}&billing=${billing}`, '_blank');
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm mb-6 transition-colors ${
                      isUnavailable 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                        : isCurrent && isFreeTrial
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 cursor-default'
                          : (plan.name.toUpperCase() === 'PRO' || plan.name.toUpperCase() === 'ENTERPRISE')
                            ? 'bg-blue-600 text-white cursor-pointer hover:opacity-90'
                            : isCurrent 
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20' 
                              : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                    }`}>
                    {cta}
                  </button>

                  <div className="space-y-3">
                    {plan.features.slice(0, 5).map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

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

        {/* Billing History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Billing History</h3>
            <button className="text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline">Download All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 font-bold border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4">Invoice</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Plan</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      Loading billing history...
                    </td>
                  </tr>
                ) : billingHistory.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                      No billing history yet.
                    </td>
                  </tr>
                ) : (
                  billingHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{record.payhereRef || `#INV-${record.id}`}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(record.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">Subscription</td>
                      <td className="px-6 py-4 text-slate-900 dark:text-white">{formatLKR(record.amountLKR)}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          record.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {record.status === 'COMPLETED' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100" title="Download PDF">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
