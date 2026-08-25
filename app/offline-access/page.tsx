'use client';

import React from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth-store';
import { MonitorOff, ShieldAlert, Zap, Download } from 'lucide-react';

export default function OfflineAccessPage() {
  const { user, logout } = useAuthStore();
  const planName = user?.tenant?.plan || 'STARTUP';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
        
        {/* Header Graphic */}
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 flex flex-col items-center justify-center border-b border-slate-100 dark:border-slate-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-700/50 bg-[length:16px_16px]" />
          <div className="relative z-10 w-20 h-20 bg-white dark:bg-slate-700 rounded-2xl shadow-sm flex items-center justify-center mb-4 text-slate-400 dark:text-slate-500">
            <MonitorOff className="w-10 h-10" />
          </div>
          <h1 className="relative z-10 text-2xl font-black text-slate-900 dark:text-white text-center">Desktop App Only</h1>
          <div className="relative z-10 mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <ShieldAlert className="w-3.5 h-3.5" />
            {planName} PLAN
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <p className="text-slate-600 dark:text-slate-300 text-center leading-relaxed text-sm mb-6">
            Your current plan is strictly offline. To access the dashboard, you must use the <strong className="text-slate-900 dark:text-white">cMart Desktop App</strong> on your main computer. 
            <br /><br />
            Web browser and mobile access are disabled because your data is not synced to the cloud.
          </p>

          <div className="space-y-3">
            <Link 
              href="/pricing"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02]"
            >
              <Zap className="w-5 h-5" />
              Upgrade for Cloud Sync
            </Link>
            
            <Link 
              href="/download"
              className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3.5 px-4 rounded-xl transition-all"
            >
              <Download className="w-5 h-5" />
              Download Desktop App
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
