'use client';

import { useState } from 'react';
import { 
  Palette, Plus, Search, Filter, MoreVertical, Edit2, 
  Trash2, UploadCloud, Eye, CheckCircle, Store
} from 'lucide-react';
import Image from 'next/image';

const THEMES = [
  { id: 1, name: 'Minimalist Store', slug: 'minimalist-store', type: 'FREE', price: 0, status: 'Active', installs: 450, version: '1.2.0', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=600&h=400' },
  { id: 2, name: 'Electro Pro', slug: 'electro-pro', type: 'PREMIUM', price: 4500, status: 'Active', installs: 120, version: '2.0.1', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600&h=400' },
  { id: 3, name: 'Fashion Boutique', slug: 'fashion-boutique', type: 'PREMIUM', price: 6000, status: 'Active', installs: 85, version: '1.0.5', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&q=80&w=600&h=400' },
  { id: 4, name: 'Grocery Fresh', slug: 'grocery-fresh', type: 'FREE', price: 0, status: 'Draft', installs: 0, version: '1.0.0', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600&h=400' },
];

export default function AdminThemesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  return (
    <div className="font-sans p-6 lg:p-8 max-w-[1600px] mx-auto h-full overflow-y-auto custom-scrollbar flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Theme Gallery</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage e-commerce themes available to your tenants</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search themes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow text-slate-900 dark:text-white"
            />
          </div>
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5 shrink-0"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Theme</span>
          </button>
        </div>
      </div>

      {/* Themes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {THEMES.map((theme) => (
          <div key={theme.id} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] group hover:-translate-y-1 transition-all duration-300 flex flex-col">
            <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
              {/* Next.js Image requires domains in next.config.js, so using standard img for demo */}
              <img src={theme.image} alt={theme.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white text-xs font-bold transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
                <div className="flex gap-2">
                  <button className="p-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-lg text-white transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button className="p-1.5 bg-rose-500/80 hover:bg-rose-500 backdrop-blur-md rounded-lg text-white transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider shadow-sm backdrop-blur-md ${
                  theme.type === 'PREMIUM' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {theme.type}
                </span>
                {theme.status === 'Draft' && (
                  <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider shadow-sm backdrop-blur-md bg-slate-900/80 text-white">
                    DRAFT
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{theme.name}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">v{theme.version}</p>
                </div>
                {theme.type === 'PREMIUM' && (
                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    LKR {theme.price.toLocaleString()}
                  </span>
                )}
              </div>
              
              <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700/50 flex justify-between items-center">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <Store className="w-3.5 h-3.5" />
                  {theme.installs.toLocaleString()} Installs
                </div>
                {theme.status === 'Active' ? (
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Published
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}

        {/* Add New Theme Card */}
        <button 
          onClick={() => setIsUploadOpen(true)}
          className="bg-slate-50/50 dark:bg-slate-800/30 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 transition-all duration-300 flex flex-col items-center justify-center min-h-[320px] group"
        >
          <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 group-hover:shadow-md transition-all">
            <Plus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Upload New Theme</h3>
          <p className="text-sm font-medium text-slate-500 mt-1 max-w-[200px] text-center">Add a new theme ZIP file to the platform gallery</p>
        </button>
      </div>

      {/* Upload Modal Overlay Placeholder */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4">Upload Theme</h3>
            <p className="text-sm text-slate-500 mb-6">Upload a bundled React/Next.js theme zip file. Ensure it follows the cMart theme structure.</p>
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <UploadCloud className="w-10 h-10 text-indigo-500 mb-3" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click or drag ZIP file here</p>
              <p className="text-xs text-slate-500 mt-1">Maximum file size: 50MB</p>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsUploadOpen(false)}
                className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all">
                Upload & Process
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
