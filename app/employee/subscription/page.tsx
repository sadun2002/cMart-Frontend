'use client';

import { useState } from 'react';
import { 
  CreditCard, ShieldCheck, Check, 
  Crown, Download, Clock, Zap, CheckCircle2, AlertCircle
} from 'lucide-react';
import { PLANS, formatLKR } from '@/lib/constants';

// Mock billing history
const mockInvoices = [
  { id: 'INV-2026-003', date: 'Aug 01, 2026', amount: 4990, status: 'Paid', plan: 'Pro Plan - Monthly' },
  { id: 'INV-2026-002', date: 'Jul 01, 2026', amount: 4990, status: 'Paid', plan: 'Pro Plan - Monthly' },
  { id: 'INV-2026-001', date: 'Jun 01, 2026', amount: 0, status: 'Free Trial', plan: 'Pro Plan - 14 Days' },
];

export default function SubscriptionPage() {
  const [isYearly, setIsYearly] = useState(true);
  const currentPlan = 'PRO';

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
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{PLANS[currentPlan].name} Plan</h2>
                <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Active
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Your next billing date is <strong className="text-slate-700 dark:text-slate-300">September 01, 2026</strong> for {formatLKR(PLANS[currentPlan].price)}.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full lg:w-auto z-10">
            <button className="flex-1 lg:flex-none px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap">
              Cancel Plan
            </button>
            <button className="flex-1 lg:flex-none px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm whitespace-nowrap">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[PLANS.FREE, PLANS.PRO, PLANS.ENTERPRISE].map((plan, i) => {
              const isCurrent = plan.name.toUpperCase() === currentPlan;
              const price = isYearly && plan.price > 0 ? plan.price * 0.8 : plan.price;
              
              return (
                <div key={i} className={`relative bg-white dark:bg-slate-900 rounded-3xl p-6 transition-all ${isCurrent ? 'ring-2 ring-blue-500 shadow-md' : 'border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md'}`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm">
                      Current Plan
                    </div>
                  )}
                  
                  <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2">{plan.name}</h4>
                  
                  <div className="flex items-baseline gap-1 mb-6">
                    {price === 0 ? (
                      <span className="text-3xl font-black text-slate-900 dark:text-white">Free</span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-slate-900 dark:text-white">{formatLKR(price)}</span>
                        <span className="text-slate-500 font-medium">/mo</span>
                      </>
                    )}
                  </div>

                  <button className={`w-full py-2.5 rounded-xl font-bold text-sm mb-6 transition-colors ${
                    isCurrent 
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default' 
                      : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20'
                  }`}>
                    {isCurrent ? 'Active' : plan.price > PLANS[currentPlan].price ? 'Upgrade' : 'Downgrade'}
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
                {mockInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{inv.id}</td>
                    <td className="px-6 py-4 text-slate-500">{inv.date}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{inv.plan}</td>
                    <td className="px-6 py-4 text-slate-900 dark:text-white">{formatLKR(inv.amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                        inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}>
                        {inv.status === 'Paid' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors inline-flex opacity-0 group-hover:opacity-100" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
