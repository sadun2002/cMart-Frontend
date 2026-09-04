'use client';

import { useState } from 'react';
import { User } from 'lucide-react';

export default function PersonalProfilePage() {
  const [form, setForm] = useState({
    name: 'John Doe',
    email: 'john@cmart.com',
    phone: '+94 77 987 6543',
    role: 'Store Owner',
  });

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <User className="w-7 h-7 text-gray-900 dark:text-white" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Personal Profile</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Update your personal information</p>
        </div>
      </div>

      {/* Avatar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-2xl font-black shadow-lg">
          JD
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{form.name}</p>
          <p className="text-xs text-gray-500 dark:text-slate-400">{form.role}</p>
          <button className="mt-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors">Change Photo</button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {([
            { key: 'name', label: 'Full Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone' },
            { key: 'role', label: 'Role' },
          ] as const).map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">{field.label}</label>
              <input
                value={form[field.key]}
                onChange={handleChange(field.key)}
                className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
              />
            </div>
          ))}
        </div>

        {/* Password Change */}
        <div className="pt-6 border-t border-gray-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Change Password</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {['Current Password', 'New Password', 'Confirm Password'].map((label) => (
              <div key={label} className="space-y-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-slate-400">{label}</label>
                <input type="password" className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="px-6 py-2.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20 hover:shadow-xl hover:scale-[1.02] transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}