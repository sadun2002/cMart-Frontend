'use client';

import { CreditCard, Shield, CheckCircle2, ArrowRight } from 'lucide-react';

export default function BillingPage() {
  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <CreditCard className="w-7 h-7 text-gray-900 dark:text-white" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Billing & Plan</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your subscription and billing</p>
        </div>
      </div>

      {/* Current Plan */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 lg:p-8 shadow-xl">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-200" />
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Current Plan</span>
            </div>
            <h2 className="text-2xl font-black text-white">Pro Plan</h2>
            <p className="text-blue-200 text-sm">Rs. 2,500 / month</p>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-white/90 text-sm">Renews on Feb 15, 2024</span>
            </div>
          </div>
          <span className="px-3 py-1 bg-white/15 text-white text-xs font-bold rounded-full backdrop-blur-sm">Active</span>
        </div>
      </div>

      {/* Plan Features */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Plan Features</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {[
            'Unlimited Products', 'POS & Online Orders', 'Employee Management', 'Sales Analytics',
            'Inventory Tracking', 'Customer Management', 'Priority Support', 'Custom Domain',
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2.5 p-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-slate-300">{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Payment Method</h3>
        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Visa ending in 4242</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Expires 12/26</p>
            </div>
          </div>
          <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Change</button>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20 hover:shadow-xl transition-all flex items-center gap-2">
          Upgrade Plan
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}