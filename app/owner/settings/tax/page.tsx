'use client';

import { DollarSign } from 'lucide-react';

export default function TaxCurrencyPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tax & Currency</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Configure tax rates and currency settings</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Currency</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option value="LKR">LKR - Sri Lankan Rupee (Rs.)</option>
              <option value="USD">USD - US Dollar ($)</option>
              <option value="EUR">EUR - Euro (€)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Tax Rate (%)</label>
            <input defaultValue="5" className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Tax Configuration</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">Tax is calculated automatically on each sale based on the rate above.</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            <strong>Note:</strong> Updating tax rates will only affect future transactions. Existing transactions will retain their original tax rate.
          </p>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-800">
          <button className="px-6 py-2.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl hover:scale-[1.02] transition-all">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}