'use client';

import { useState } from 'react';
import { 
  CreditCard, ShieldCheck, Check, 
  Crown, Download, Clock, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PLANS, formatLKR } from '@/lib/constants';
import { useAuthStore } from '@/lib/auth-store';



export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(true);
  const { user } = useAuthStore();
  const currentPlan = (user?.tenant?.plan || 'FREE').toUpperCase() as keyof typeof PLANS;
  const currentPlanData = PLANS[currentPlan] || PLANS.FREE;

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
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                {currentPlan === 'FREE' ? 'You are on the free plan.' : `Your next billing date is September 01, 2026 for ${formatLKR(currentPlanData.price)}.`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto z-10">
            <button 
              onClick={() => alert("Plan cancellation initiated. Please contact support to confirm.")}
              className="flex-1 lg:flex-none px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap"
            >
              Cancel Plan
            </button>
            <button 
              onClick={() => alert("Redirecting to payment gateway...")}
              className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap"
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
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
              <button 
                onClick={() => setIsYearly(false)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${!isYearly ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setIsYearly(true)}
                className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${isYearly ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                Annually
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end text-left">
            {[
              {
                key: 'FREE',
                name: PLANS.FREE.name,
                price: 'Free',
                period: 'forever',
                features: PLANS.FREE.features,
                highlight: false,
                rank: 0,
              },
              {
                key: 'PRO',
                name: PLANS.PRO.name,
                price: formatLKR(isYearly ? PLANS.PRO.price * 0.8 : PLANS.PRO.price),
                period: '/month',
                features: PLANS.PRO.features,
                highlight: true,
                rank: 1,
              },
              {
                key: 'ENTERPRISE',
                name: PLANS.ENTERPRISE.name,
                price: formatLKR(isYearly ? PLANS.ENTERPRISE.price * 0.8 : PLANS.ENTERPRISE.price),
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

              let userRank = 0;
              if (currentPlan === 'PRO') userRank = 1;
              else if (currentPlan === 'ENTERPRISE') userRank = 2;

              const billingParam = isYearly ? 'annual' : 'monthly';
              
              if (userRank === plan.rank) {
                cta = 'Current Plan';
                href = '#';
                disabled = true;
                isCurrent = true;
              } else if (userRank < plan.rank) {
                cta = `Upgrade to ${plan.name}`;
                href = `/checkout?plan=${plan.key}&billing=${billingParam}`;
              } else {
                cta = `Downgrade to ${plan.name}`;
                href = `/checkout?plan=${plan.key}&billing=${billingParam}`;
              }

              return (
              <div
                key={plan.key}
                style={{ height: plan.highlight ? '580px' : '520px' }}
                className={`rounded-2xl flex flex-col ${
                  plan.highlight
                    ? 'bg-blue-600 text-white shadow-2xl shadow-blue-300/50 dark:shadow-none pt-8 px-8 pb-7'
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
                <div className="mt-2 mb-6 text-left flex flex-col">
                  <div>
                    <span className={`text-3xl font-black ${plan.highlight ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {plan.price}
                    </span>
                    <span className={`text-sm ml-1 ${plan.highlight ? 'text-blue-200' : 'text-gray-500'}`}>
                      {plan.period}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-gray-500"} ${!(isYearly && plan.price !== 'Free') ? 'invisible' : ''}`}>
                    Billed annually
                  </p>
                </div>
                <ul className="space-y-2.5">
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
                      className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-colors cursor-default ${
                        plan.highlight
                          ? 'bg-white text-blue-600'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {cta}
                    </div>
                  ) : (
                    <button
                      onClick={() => window.open(href, '_blank')}
                      className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 ${
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

        {/* Billing History */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Billing History</h3>
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
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-500">
                    No billing history yet.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
