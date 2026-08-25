"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Star, 
  Eye, 
  Sparkles,
  ShoppingBag,
  Store,
  LayoutTemplate,
  ArrowRight,
  ChevronRight,
  Check
} from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';
import { toast } from 'sonner';
import { themeApi, type Theme } from '@/lib/services';
import { ThemeCard } from '@/components/themes/theme-card';

const PRICING = ['All', 'Free', 'Premium'];

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

export default function PortfolioPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [activePricing, setActivePricing] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isScrolledPastSearch, setIsScrolledPastSearch] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        setLoading(true);
        const res = await themeApi.list();
        const data = res as any;
        const themeList = (data?.data || data || []) as Theme[];
        setThemes(themeList);
      } catch (err) {
        console.warn('Failed to load themes from API:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchThemes();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    lastScrollY.current = window.scrollY;
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Control header visibility (scroll up/down)
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else {
        setIsHeaderVisible(true);
      }
      
      // Control search icon visibility
      if (currentScrollY > 400) {
        setIsScrolledPastSearch(true);
      } else {
        setIsScrolledPastSearch(false);
      }
      
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", controlNavbar, { passive: true });
    return () => window.removeEventListener("scroll", controlNavbar);
  }, []);

  const filteredThemes = themes.filter(theme => {
    const matchesPricing = activePricing === 'All' || 
                           (activePricing === 'Free' && (theme.price === 0 || theme.type === 'FREE')) || 
                           (activePricing === 'Premium' && theme.price !== 0 && theme.type !== 'FREE');
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (theme.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPricing && matchesSearch;
  });

  const featuredTheme = themes[0] || null;
  const showFeatured = searchQuery === '' && activePricing === 'All' && featuredTheme !== null;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative">
        <MotionBlurBackground />
        <SiteHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 dark:text-slate-400 animate-pulse">Loading themes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <MotionBlurBackground />
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="border-b border-gray-100 dark:border-slate-800 pt-24 pb-16 px-6 relative z-10 bg-transparent overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/80 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/30 text-blue-600 dark:text-blue-400 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Theme Marketplace
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-5 tracking-tight leading-tight">
            Beautiful Themes for<br/>
            <span className="text-blue-600 dark:text-blue-500">Every Business</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Professionally designed e-commerce themes — ready to launch in minutes. Powering stores across Sri Lanka.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
              id="theme-search-input"
              type="text"
              placeholder="Search themes by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-base transition-all shadow-sm outline-none"
            />
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-sm font-semibold text-gray-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <LayoutTemplate className="w-4 h-4 text-blue-500" />
              <span>{themes.length}+ Themes</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-500" />
              <span>500+ Active Stores</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>4.8 Average Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY FILTER BAR */}
      <div 
        className={`sticky bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-40 transition-all duration-300 ${isHeaderVisible ? 'top-[73px]' : 'top-0'}`}
      >
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Pricing Toggle */}
            {/* Left side: Pricing Toggle + Search Icon */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-slate-800 rounded-full p-1 shrink-0">
                {PRICING.map(price => (
                  <button
                    key={price}
                    onClick={() => setActivePricing(price)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                      activePricing === price 
                        ? 'bg-white dark:bg-slate-900 text-gray-900 dark:text-white shadow-sm' 
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {price}
                  </button>
                ))}
              </div>
              
              {isScrolledPastSearch && (
                <button 
                  onClick={() => {
                    const input = document.getElementById('theme-search-input');
                    if (input) {
                      input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      setTimeout(() => input.focus(), 500);
                    }
                  }}
                  className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-colors shrink-0 shadow-sm"
                  title="Scroll to search"
                >
                  <Search className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10 bg-transparent">

        {/* FEATURED THEME */}
        {showFeatured && featuredTheme && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Featured Theme</h2>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">Editor's Choice</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-xl shadow-blue-900/5 dark:shadow-none flex flex-col md:flex-row group transition-all hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:border-slate-700">
              <div className="w-full md:w-3/5 aspect-video md:aspect-auto relative overflow-hidden min-h-[240px]">
                {featuredTheme.previewUrl ? (
                  <div className="w-full h-full relative overflow-hidden bg-slate-50">
                    <div className="absolute top-0 left-0 origin-top-left pointer-events-none" style={{ width: '200%', height: '200%', transform: 'scale(0.5)' }}>
                      <iframe
                        src={featuredTheme.previewUrl}
                        className="w-full h-full border-0"
                        scrolling="no"
                        tabIndex={-1}
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${getGradient(featuredTheme.id)} flex items-center justify-center`}>
                    <span className="text-white font-black text-2xl">{featuredTheme.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                  <button 
                    onClick={() => featuredTheme.previewUrl && window.open(featuredTheme.previewUrl, '_blank')}
                    className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" /> Live Preview
                  </button>
                </div>
              </div>
              <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">
                    {featuredTheme.price === 0 || featuredTheme.type === 'FREE' ? 'FREE' : 'PRO'}
                  </span>
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">{featuredTheme.type}</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{featuredTheme.name}</h3>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-slate-400 mb-5">
                  <span className="text-gray-400 dark:text-slate-500 font-normal">Updated recently</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                  {featuredTheme.description || 'A professionally designed theme for your online store.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl transition-colors shadow-lg shadow-blue-600/20 dark:shadow-none flex items-center justify-center gap-2 text-sm">
                    <ShoppingBag className="w-4 h-4" /> Get Theme
                  </button>
                  <button 
                    onClick={() => featuredTheme.previewUrl && window.open(featuredTheme.previewUrl, '_blank')}
                    className="flex-1 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 font-bold py-2 px-6 rounded-xl transition-colors text-sm"
                  >
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ALL THEMES SECTION HEADER */}
        {showFeatured && (
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">All Themes</h2>
          </div>
        )}

        {/* THEMES GRID */}
        {filteredThemes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredThemes.map((theme) => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                variant="marketplace"
                onPreview={(id) => toast.info(`Previewing theme ${id}...`)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
            <LayoutTemplate className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No themes found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">Try adjusting your filters or search query.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActivePricing('All'); }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>

      {/* CTA SECTION */}
      <section className="py-20 bg-blue-600 text-white relative z-10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Custom Themes Available
          </div>
          <h2 className="text-4xl font-black mb-4 text-white">Need a Custom Theme?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Our design team can build a fully custom theme tailored to your brand. Perfect for Enterprise customers.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {['Unique brand identity', 'Mobile-first design', 'Fast delivery', 'Unlimited revisions'].map(item => (
              <div key={item} className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full text-sm font-medium">
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                {item}
              </div>
            ))}
          </div>
          <Link
            href="/contact?type=custom_theme"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-xl"
          >
            Request Custom Theme <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
