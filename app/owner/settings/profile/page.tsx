'use client';

import { useState } from 'react';
import { Store, Upload, X } from 'lucide-react';

export default function StoreProfilePage() {
  const [form, setForm] = useState({
    name: "John's Fashion Store",
    subdomain: 'shop-johnsfashion',
    email: 'john@fashion.lk',
    phone: '+94 77 123 4567',
    description: 'Best fashion store in Colombo — offering premium clothing, accessories, and footwear since 2020.',
    address: '42 Galle Road, Colombo 03, Sri Lanka',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleChange = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const handleImageUpload = (type: 'logo' | 'banner') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (type === 'logo') setLogoPreview(reader.result as string);
        else setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="font-sans p-6 lg:p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <Store className="w-7 h-7 text-gray-900 dark:text-white" />
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Store Profile</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Manage your store information and branding</p>
        </div>
      </div>

      {/* Logo & Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Store Logo</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-gray-300 dark:text-slate-600" />
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Upload Logo
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('logo')} />
            </label>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6">
          <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Store Banner</p>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-2 border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
              {bannerPreview ? (
                <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <Upload className="w-6 h-6 text-gray-300 dark:text-slate-600" />
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
              Upload Banner
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload('banner')} />
            </label>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 lg:p-8 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Store Name</label>
            <input
              value={form.name}
              onChange={handleChange('name')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Subdomain</label>
            <div className="flex items-center h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              <input
                value={form.subdomain}
                onChange={handleChange('subdomain')}
                className="flex-1 bg-transparent text-gray-900 dark:text-white text-sm focus:outline-none"
              />
              <span className="text-xs text-gray-400 dark:text-slate-500 flex-shrink-0">.cmart.lk</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Email</label>
            <input
              value={form.email}
              onChange={handleChange('email')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Phone</label>
            <input
              value={form.phone}
              onChange={handleChange('phone')}
              className="w-full h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Description</label>
          <textarea
            value={form.description}
            onChange={handleChange('description')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 dark:text-slate-300">Address</label>
          <textarea
            value={form.address}
            onChange={handleChange('address')}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-slate-800">
          <p className="text-xs text-gray-400 dark:text-slate-500">Last updated: Today at 10:23 AM</p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-gradient-to-br from-blue-600 to-blue-500 text-white font-bold rounded-xl text-sm shadow-lg shadow-blue-200/50 dark:shadow-blue-900/20 hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}