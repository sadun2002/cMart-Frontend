'use client';

import { Lock, Key, Shield, Smartphone } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200/40">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Security</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your account security settings</p>
        </div>
      </div>

      {/* Two-Factor Auth */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Two-Factor Authentication</p>
            <p className="text-xs text-gray-500 dark:text-slate-400">Add an extra layer of security to your account</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Sessions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Smartphone className="w-4 h-4" />
          Active Sessions
        </h3>
        <div className="space-y-3">
          {[
            { device: 'Chrome on Windows', location: 'Colombo, Sri Lanka', time: 'Current session' },
            { device: 'Safari on iPhone', location: 'Colombo, Sri Lanka', time: '2 hrs ago' },
          ].map((session) => (
            <div key={session.device} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{session.device}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400">{session.location} · {session.time}</p>
              </div>
              {session.time === 'Current session' ? (
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2.5 py-1 rounded-full">Active</span>
              ) : (
                <button className="text-xs text-red-500 hover:text-red-700 font-medium">Revoke</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-4 h-4" />
          API Keys
        </h3>
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/50">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Your API key:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs font-mono bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white truncate">
              cmart_live_8a7f3b2c1d9e4f5a6b7c8d9e0f1a2b3c
            </code>
            <button className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Copy
            </button>
            <button className="px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              Regenerate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}