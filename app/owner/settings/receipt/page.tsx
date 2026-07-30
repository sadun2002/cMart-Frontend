'use client';

import { Printer } from 'lucide-react';

export default function ReceiptPrinterPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
          <Printer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Receipt & Printer</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Configure receipt templates and printer settings</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Receipt Header</label>
          <input defaultValue="John's Fashion Store" className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Footer Message</label>
          <input defaultValue="Thank you for shopping with us!" className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Paper Size</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>80mm (Standard)</option>
              <option>58mm (Compact)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Copies</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>1 Copy</option>
              <option>2 Copies</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
          <div className="w-12 h-12 bg-gray-100 dark:bg-slate-800 rounded-xl flex items-center justify-center">
            <Printer className="w-6 h-6 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">Test Print</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Print a sample receipt to test your printer</p>
          </div>
          <button className="ml-auto px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            Print Test
          </button>
        </div>
        <div className="flex justify-end">
          <button className="px-6 py-2.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200/50 hover:shadow-xl hover:scale-[1.02] transition-all">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}