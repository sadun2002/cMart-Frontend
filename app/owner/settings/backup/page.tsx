'use client';

import { Database, Download, Upload, RefreshCw, Clock } from 'lucide-react';

export default function BackupPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
          <Database className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Data & Backup</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your store data and backups</p>
        </div>
      </div>

      {/* Auto Backup Status */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Auto Backup</p>
            <p className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Active — Daily at 2:00 AM
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" defaultChecked className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
        </label>
      </div>

      {/* Manual Backup */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Manual Backup</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Export Data</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Download all store data as CSV</p>
            </div>
          </button>
          <button className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Import Data</p>
              <p className="text-xs text-gray-500 dark:text-slate-400">Restore from previous backup</p>
            </div>
          </button>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Recent Backups</h3>
        <div className="space-y-3">
          {[
            { date: 'Today, 2:00 AM', size: '245 MB', status: 'Success' },
            { date: 'Yesterday, 2:00 AM', size: '242 MB', status: 'Success' },
            { date: 'Jul 26, 2:00 AM', size: '240 MB', status: 'Success' },
          ].map((backup) => (
            <div key={backup.date} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{backup.date}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">{backup.size}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">{backup.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}