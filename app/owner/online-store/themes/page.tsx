'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Palette, Search, CheckCircle, LayoutTemplate, Monitor, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { themeApi, type Theme } from '@/lib/services';
import { ThemeCard } from '@/components/themes/theme-card';
import { useAuthStore } from '@/lib/auth-store';

function getGradient(id: number | string) {
  const GRADIENTS = [
    'from-indigo-500 to-purple-700',
    'from-emerald-500 to-teal-700',
    'from-slate-600 to-gray-900',
    'from-rose-400 to-pink-700',
    'from-blue-600 to-indigo-800',
    'from-orange-400 to-red-600',
    'from-green-500 to-emerald-800',
    'from-amber-500 to-orange-700',
    'from-fuchsia-500 to-pink-700',
    'from-yellow-400 to-amber-700',
    'from-red-500 to-rose-800',
    'from-amber-300 to-orange-600',
  ];
  const index = typeof id === 'number' ? id : parseInt(id, 10) || 0;
  return GRADIENTS[index % GRADIENTS.length];
}

export default function ThemesPage() {
  const { user } = useAuthStore();
  const subdomain = user?.tenant?.subdomain || 'demo';
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<number | string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'library' | 'mine'>('all');
  const [isActivating, setIsActivating] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const res = await themeApi.list();
        const data = res as any;
        const themeList = data?.data || data || [];
        setThemes(themeList);

        const myTheme = await themeApi.getMyTheme().catch(() => null);
        const myThemeData = myTheme as any;
        const myThemeId = myThemeData?.data?.theme?.id || myThemeData?.theme?.id || myThemeData?.id;
        if (myThemeId) {
          setActiveThemeId(myThemeId);
        } else if (themeList.length > 0) {
          setActiveThemeId(themeList[0].id);
        }
      } catch {
        toast.error('Failed to load themes');
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  const activeTheme = themes.find(t => t.id === activeThemeId) || themes[0] || null;
  const marketplaceThemes = themes.filter((theme) => {
    const matchesSearch = theme.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'mine' && theme.id === activeThemeId) ||
      (filter === 'library');
    return matchesSearch && matchesFilter;
  });

  const handleActivate = async (id: number | string) => {
    setIsActivating(id);
    try {
      await themeApi.apply(id);
      setActiveThemeId(id);
      toast.success('Theme successfully activated!');
    } catch {
      toast.error('Failed to activate theme');
    } finally {
      setIsActivating(null);
    }
  };

  const handleBuy = (themeName: string) => {
    toast.info(`Purchasing ${themeName}...`);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">Loading themes...</p>
        </div>
      </div>
    );
  }

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
        <a href={`/s/${subdomain}`} target="_blank" rel="noopener noreferrer" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors flex items-center gap-2 cursor-pointer">
          <Eye className="w-5 h-5" />
          View Live Store
        </a>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ──────────────── MAIN CONTENT ──────────────── */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Active Theme Section */}
          {activeTheme && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                  Current Theme
                </h2>
              </div>
              
              <div className="flex flex-col md:flex-row gap-6 p-6">
                <div className="w-full md:w-1/2 aspect-video rounded-2xl overflow-hidden relative group bg-slate-100 dark:bg-slate-800">
                  <div className="absolute top-0 left-0 origin-top-left pointer-events-none" style={{ width: '300%', height: '300%', transform: 'scale(0.333333)' }}>
                    <iframe
                      src={activeTheme.previewUrl || `/s/${subdomain}`}
                      className="w-full h-full border-0"
                      title={`${activeTheme.name} Preview`}
                      scrolling="no"
                      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
                    <a href={activeTheme.previewUrl || `/s/${subdomain}`} target="_blank" rel="noopener noreferrer" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white hover:bg-slate-50 text-slate-900 font-bold px-6 py-3 rounded-xl shadow-xl text-sm flex items-center gap-2 cursor-pointer">
                      <Eye className="w-4 h-4" /> Live Preview
                    </a>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{activeTheme.name}</h3>
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md text-xs font-bold uppercase tracking-wider">
                      v{activeTheme.version || '1.0.0'}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 leading-relaxed">
                    {activeTheme.description || 'No description available.'}
                  </p>

                  {/* Theme Details */}
                  <div className="mb-6 space-y-4">
                    {/* Pages Count */}
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-center shadow-sm">
                        <LayoutTemplate className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Included Pages</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white">{activeTheme.pageCount || 12}+</p>
                      </div>
                    </div>

                    {/* Color Palette */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">Color Palette</p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { label: 'Primary', color: activeTheme.colors?.primary || '#1E40AF' },
                          { label: 'Secondary', color: activeTheme.colors?.secondary || '#059669' },
                          { label: 'Accent', color: activeTheme.colors?.accent || '#F59E0B' },
                          { label: 'Text', color: activeTheme.colors?.text || '#1F2937' },
                          { label: 'Background', color: activeTheme.colors?.background || '#FFFFFF' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                            <span className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700" style={{ backgroundColor: item.color }} />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-auto">
                    <Link href="/owner/online-store/pages" className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 font-bold rounded-xl transition-colors shadow-sm">
                      Customize Theme
                    </Link>
                    <button className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold rounded-xl transition-colors flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5" />
                      Actions
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Theme Library Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Theme Library</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-72 flex-1">
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
                
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E\")",
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1.5rem'
                  }}
                >
                  <option value="all">All</option>
                  <option value="library">Library</option>
                  <option value="mine">My Themes</option>
                </select>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketplaceThemes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={{
                      id: theme.id,
                      name: theme.name,
                      description: theme.description,
                      price: Number(theme.price),
                      type: theme.type,
                      previewUrl: theme.previewUrl,
                      tags: theme.tags,
                      version: theme.version,
                    }}
                    variant="owner"
                    onActivate={handleActivate}
                    onBuy={handleBuy}
                    onPreview={(id) => toast.info(`Previewing theme ${id}...`)}
                    isActivating={isActivating}
                    isActive={activeThemeId === theme.id}
                  />
                ))}
                
                {marketplaceThemes.length === 0 && (
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
