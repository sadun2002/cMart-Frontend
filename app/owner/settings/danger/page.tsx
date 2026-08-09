'use client';

import { AlertTriangle, Trash2, XCircle, Archive } from 'lucide-react';

export default function DangerZonePage() {
  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200/40">
          <AlertTriangle className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Danger Zone</h1>
          <p className="text-sm text-red-500 dark:text-red-400 font-medium">Irreversible and destructive actions</p>
        </div>
      </div>

      {/* Pause Store */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Archive className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Pause Store</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Temporarily disable your store and website</p>
          </div>
        </div>
        <button className="px-5 py-2.5 text-sm font-semibold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors flex-shrink-0">
          Pause Store
        </button>
      </div>

      {/* Clear Data */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-900/30 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Clear All Data</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Remove all products, sales, and customer data (keeps store settings)</p>
          </div>
        </div>
        <button className="px-5 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0">
          Clear Data
        </button>
      </div>

      {/* Delete Store */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-red-300 dark:border-red-800/50 shadow-sm p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Delete Store</p>
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">Permanently delete your store and all associated data</p>
          </div>
        </div>
        <button className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-200/50 hover:shadow-xl transition-all flex-shrink-0">
          Delete Store
        </button>
      </div>

      {/* Warning */}
      <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
        <p className="text-xs text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          These actions are irreversible. Please make sure you have backed up your data before proceeding with any destructive action.
        </p>
      </div>
    </div>
  );
}