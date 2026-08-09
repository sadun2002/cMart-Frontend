'use client';

import { useState } from 'react';
import { Palette, Search, ExternalLink, Download, CheckCircle, LayoutTemplate, Smartphone, Monitor } from 'lucide-react';
import { toast } from 'sonner';

// Mock Data for Themes
const ACTIVE_THEME_ID = 'theme-001';

const mockThemes = [
  {
    id: 'theme-001',
    name: 'C-Mart Default',
    type: 'FREE',
    price: 0,
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=600',
    description: 'A clean, modern default theme optimized for fast loading and great conversions. Suitable for any retail business.',
    features: ['Responsive Design', 'Fast Loading', 'SEO Optimized'],
    version: '1.2.4',
  },
  {
    id: 'theme-002',
    name: 'Fashion Pro',
    type: 'PRO',
    price: 5000,
    thumbnail: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=600',
    description: 'A premium theme tailored for fashion and apparel stores. Features large imagery and lookbooks.',
    features: ['Lookbook Feature', 'Instagram Feed', 'Mega Menu'],
    version: '2.0.1',
  },
  {
    id: 'theme-003',
    name: 'Electronics Plus',
    type: 'PRO',
    price: 7500,
    thumbnail: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=600',
    description: 'Designed specifically for tech and electronics. Includes advanced filtering and comparison tables.',
    features: ['Product Comparison', 'Advanced Filters', 'Tech Specs Layout'],
    version: '1.5.0',
  },
  {
    id: 'theme-004',
    name: 'Grocery Fresh',
    type: 'PRO',
    price: 4000,
    thumbnail: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=600',
    description: 'Perfect for supermarkets and grocery delivery. Quick add-to-cart and categorical browsing.',
    features: ['Quick Buy', 'Category Sidebar', 'Delivery Time Slots'],
    version: '3.1.2',
  },
];

export default function ThemesPage() {
  const [themes, setThemes] = useState(mockThemes);
  const [activeThemeId, setActiveThemeId] = useState(ACTIVE_THEME_ID);
  const [search, setSearch] = useState('');
  const [isActivating, setIsActivating] = useState<string | null>(null);

  const activeTheme = themes.find(t => t.id === activeThemeId);
  const otherThemes = themes.filter(t => t.id !== activeThemeId && t.name.toLowerCase().includes(search.toLowerCase()));

  const handleActivate = (id: string) => {
    setIsActivating(id);
    setTimeout(() => {
      setActiveThemeId(id);
      setIsActivating(null);
      toast.success('Theme successfully activated!');
    }, 1000);
  };

  const handleBuy = (themeName: string) => {
    toast.info(`Purchasing ${themeName}... (Mock Action)`);
  };

  return (
    <div className="font-sans flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 p-6">
      
      {/* ──────────────── HEADER ──────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Palette className="w-8 h-8 text-blue-600" />
            Theme Library
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Manage your online store's appearance, discover new themes, and customize your storefront.</p>
        </div>
        <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          View Live Store
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ──────────────── MAIN CONTENT ──────────────── */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Active Theme Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-emerald-500" />
                Current Theme
              </h2>
            </div>
            
            {activeTheme && (
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden relative group bg-slate-100 dark:bg-slate-800">
                  <img src={activeTheme.thumbnail} alt={activeTheme.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors" />
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeTheme.name}</h3>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider">
                      v{activeTheme.version}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                    {activeTheme.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 mt-auto">
                    <button className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-xl transition-colors shadow-sm">
                      Customize Theme
                    </button>
                    <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5" />
                      Actions
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Library Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Theme Marketplace</h2>
              
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search themes..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-12 pr-4 h-11 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl shadow-sm text-slate-900 dark:text-white font-bold placeholder:text-slate-400 placeholder:font-medium transition-all outline-none"
                />
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherThemes.map((theme) => (
                  <div key={theme.id} className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-900 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col h-full">
                    {/* Thumbnail */}
                    <div className="aspect-video relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img src={theme.thumbnail} alt={theme.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      
                      {/* Hover Actions Overlay */}
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                        <button className="flex-1 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold transition-colors">
                          Preview
                        </button>
                        {theme.type === 'PRO' ? (
                          <button onClick={() => handleBuy(theme.name)} className="flex-1 py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold transition-colors">
                            Buy Now
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleActivate(theme.id)}
                            disabled={isActivating === theme.id}
                            className="flex-1 py-2.5 bg-slate-800 text-white hover:bg-slate-900 rounded-xl font-bold transition-colors disabled:opacity-50"
                          >
                            {isActivating === theme.id ? '...' : 'Activate'}
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate pr-2">{theme.name}</h3>
                        <span className={`shrink-0 px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-bold ${
                          theme.type === 'FREE' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400'
                        }`}>
                          {theme.type}
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <span className="font-black text-slate-900 dark:text-white">
                          {theme.type === 'FREE' ? 'Free' : `Rs. ${theme.price.toLocaleString()}`}
                        </span>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Monitor className="w-4 h-4" />
                          <Smartphone className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {otherThemes.length === 0 && (
                  <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400">
                    <Palette className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">No themes match your search.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
