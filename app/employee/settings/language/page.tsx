'use client';

import { Globe } from 'lucide-react';

export default function LanguageRegionPage() {
  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
          <Globe className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Language & Region</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Set your preferred language and regional settings</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Language</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>English</option>
              <option>සිංහල (Sinhala)</option>
              <option>தமிழ் (Tamil)</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Region</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Sri Lanka</option>
              <option>India</option>
              <option>Maldives</option>
              <option>Bangladesh</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Date Format</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Time Zone</label>
            <select className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
              <option>Asia/Colombo (UTC +5:30)</option>
              <option>Asia/Kolkata (UTC +5:30)</option>
              <option>Asia/Dhaka (UTC +6:00)</option>
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Number Format</label>
          <div className="flex gap-4">
            {['1,234.56', '1.234,56', '1 234.56'].map((fmt) => (
              <label key={fmt} className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input type="radio" name="numberFormat" defaultChecked={fmt === '1,234.56'} className="accent-blue-600" />
                <span className="text-sm text-gray-700 dark:text-slate-300">{fmt}</span>
              </label>
            ))}
          </div>
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
