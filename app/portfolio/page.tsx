"use client";

import { useState } from 'react';
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
  Check
} from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';

// Theme Data
const THEMES = [
  { id: 1, name: 'Modern Fashion', category: 'Fashion', price: 'FREE', rating: 4.9, reviews: 120, stores: 245, color: 'from-indigo-500 to-purple-700', tags: ['Modern', 'Responsive'], featured: true },
  { id: 2, name: 'Classic Store', category: 'General', price: 'FREE', rating: 4.7, reviews: 90, stores: 156, color: 'from-emerald-500 to-teal-700', tags: ['Clean', 'Fast'], featured: false },
  { id: 3, name: 'Minimal Shop', category: 'General', price: 'FREE', rating: 4.8, reviews: 60, stores: 89, color: 'from-slate-600 to-gray-900', tags: ['Minimal', 'Elegant'], featured: false },
  { id: 4, name: 'Elegant Beauty', category: 'Beauty', price: 'LKR 4,900', oldPrice: 'LKR 6,900', rating: 4.9, reviews: 85, stores: 124, color: 'from-rose-400 to-pink-700', tags: ['Luxury', 'Cosmetics'], featured: false },
  { id: 5, name: 'Tech Store Pro', category: 'Electronics', price: 'LKR 3,900', oldPrice: 'LKR 5,900', rating: 4.8, reviews: 140, stores: 178, color: 'from-blue-600 to-indigo-800', tags: ['Tech', 'Dark Mode'], featured: false },
  { id: 6, name: 'Food Market', category: 'Food', price: 'FREE', rating: 4.6, reviews: 55, stores: 95, color: 'from-orange-400 to-red-600', tags: ['Fresh', 'Organic'], featured: false },
  { id: 7, name: 'Grocery Plus', category: 'Food', price: 'LKR 3,500', oldPrice: 'LKR 4,500', rating: 4.7, reviews: 40, stores: 67, color: 'from-green-500 to-emerald-800', tags: ['Supermarket', 'Grid'], featured: false },
  { id: 8, name: 'Handcraft', category: 'General', price: 'LKR 2,500', oldPrice: 'LKR 3,500', rating: 4.9, reviews: 75, stores: 112, color: 'from-amber-500 to-orange-700', tags: ['Artisan', 'Vintage'], featured: false },
  { id: 9, name: 'Trendy Fashion', category: 'Fashion', price: 'LKR 2,900', oldPrice: 'LKR 4,900', rating: 4.8, reviews: 190, stores: 234, color: 'from-fuchsia-500 to-pink-700', tags: ['Apparel', 'Bold'], featured: false },
  { id: 10, name: 'Jewelry Luxe', category: 'Beauty', price: 'LKR 4,500', oldPrice: 'LKR 6,500', rating: 4.9, reviews: 65, stores: 89, color: 'from-yellow-400 to-amber-700', tags: ['Premium', 'Gold'], featured: false },
  { id: 11, name: 'Sports Hub', category: 'Electronics', price: 'LKR 3,300', oldPrice: 'LKR 4,300', rating: 4.7, reviews: 45, stores: 56, color: 'from-red-500 to-rose-800', tags: ['Active', 'Dynamic'], featured: false },
  { id: 12, name: 'Bakery Fresh', category: 'Food', price: 'LKR 2,700', oldPrice: 'LKR 3,700', rating: 4.8, reviews: 50, stores: 78, color: 'from-amber-300 to-orange-600', tags: ['Sweet', 'Cozy'], featured: false },
];

const CATEGORIES = ['All', 'Fashion', 'Food', 'Electronics', 'Beauty', 'General'];
const PRICING = ['All', 'Free', 'Premium'];

const ThemePreviewGraphic = ({ color }: { color: string }) => (
  <div className={`w-full h-full bg-gradient-to-br ${color} p-3 flex flex-col gap-2 overflow-hidden`}>
    {/* Fake Header */}
    <div className="flex justify-between items-center bg-white/15 backdrop-blur-sm px-3 py-2 rounded-lg">
      <div className="w-5 h-5 rounded-full bg-white/80" />
      <div className="flex gap-2">
        <div className="w-10 h-1.5 bg-white/50 rounded-full" />
        <div className="w-10 h-1.5 bg-white/50 rounded-full" />
        <div className="w-10 h-1.5 bg-white/50 rounded-full" />
      </div>
      <div className="w-16 h-5 bg-white/25 rounded-full" />
    </div>
    {/* Hero */}
    <div className="flex-1 flex flex-col items-center justify-center gap-2 py-2">
      <div className="w-3/4 h-4 bg-white/90 rounded-full shadow" />
      <div className="w-1/2 h-2.5 bg-white/60 rounded-full" />
      <div className="w-24 h-6 bg-white/30 rounded-lg mt-1" />
    </div>
    {/* Product Grid */}
    <div className="grid grid-cols-4 gap-1.5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="aspect-square bg-white/25 rounded-md" />
      ))}
    </div>
  </div>
);

export default function PortfolioPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activePricing, setActivePricing] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredThemes = THEMES.filter(theme => {
    const matchesCategory = activeCategory === 'All' || theme.category === activeCategory;
    const matchesPricing = activePricing === 'All' || 
                           (activePricing === 'Free' && theme.price === 'FREE') || 
                           (activePricing === 'Premium' && theme.price !== 'FREE');
    const matchesSearch = theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          theme.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesPricing && matchesSearch;
  });

  const featuredTheme = THEMES[0];
  const showFeatured = searchQuery === '' && activeCategory === 'All' && activePricing === 'All';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors selection:bg-blue-100 dark:selection:bg-blue-900 selection:text-blue-900 dark:selection:text-blue-50">
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-slate-800 pt-24 pb-16 px-6 relative overflow-hidden transition-colors">
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
            Professionally designed e-commerce themes — ready to launch in minutes. Powering 500+ stores across Sri Lanka.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-10">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
            </div>
            <input
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
              <span>24+ Themes</span>
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
      <div className="sticky top-[73px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Category Filters */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1">Category</span>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 transition-all ${
                    activeCategory === cat 
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none' 
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Pricing Toggle */}
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
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* FEATURED THEME */}
        {showFeatured && (
          <div className="mb-14">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-6 bg-blue-600 rounded-full" />
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Featured Theme</h2>
              <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full">Editor's Choice</span>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 overflow-hidden shadow-xl shadow-blue-900/5 dark:shadow-none flex flex-col md:flex-row group transition-all hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:border-slate-700">
              {/* Preview */}
              <div className="w-full md:w-3/5 aspect-video md:aspect-auto relative overflow-hidden min-h-[240px]">
                <ThemePreviewGraphic color={featuredTheme.color} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500 flex items-center justify-center">
                  <button className="opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-bold px-6 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm">
                    <Eye className="w-4 h-4" /> Live Preview
                  </button>
                </div>
              </div>
              {/* Info */}
              <div className="w-full md:w-2/5 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full">FREE</span>
                  <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold px-3 py-1 rounded-full">Fashion</span>
                </div>
                <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-3">{featuredTheme.name}</h3>
                <div className="flex items-center gap-3 text-sm font-medium text-gray-500 dark:text-slate-400 mb-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500" />
                    <span className="font-bold">{featuredTheme.rating}</span>
                    <span className="text-gray-400 dark:text-slate-500 font-normal">({featuredTheme.reviews})</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                  <span>{featuredTheme.stores} stores using</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-600" />
                  <span>Updated Jan 2026</span>
                </div>
                <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed text-sm">
                  The ultimate theme for apparel and fashion brands. Features a stunning full-screen hero, dynamic product grids, and built-in lookbooks to showcase your collections perfectly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-600/20 dark:shadow-none flex items-center justify-center gap-2 text-sm">
                    <ShoppingBag className="w-4 h-4" /> Get This Theme
                  </button>
                  <button className="bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 font-bold py-3 px-6 rounded-xl transition-colors text-sm">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RESULTS HEADER */}
        {(searchQuery || activeCategory !== 'All' || activePricing !== 'All') && (
          <div className="mb-6 flex items-center gap-3">
            <div className="w-1 h-6 bg-blue-600 rounded-full" />
            <p className="text-gray-700 dark:text-slate-300 font-bold">
              Found <span className="text-blue-600 dark:text-blue-400">{filteredThemes.length}</span> theme{filteredThemes.length !== 1 && 's'}
              {searchQuery && <span> for "<span className="text-blue-600 dark:text-blue-400">{searchQuery}</span>"</span>}
            </p>
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
              <div 
                key={theme.id} 
                className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-blue-900/10 dark:hover:shadow-blue-900/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
              >
                {/* Preview */}
                <div className="aspect-video relative overflow-hidden">
                  <ThemePreviewGraphic color={theme.color} />
                  {/* Category Badge */}
                  <div className="absolute top-2.5 left-2.5 bg-black/40 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {theme.category}
                  </div>
                  {/* Price Badge */}
                  <div className={`absolute top-2.5 right-2.5 text-[10px] font-black px-2 py-0.5 rounded-md ${
                    theme.price === 'FREE' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-blue-600 text-white'
                  }`}>
                    {theme.price === 'FREE' ? 'FREE' : 'PRO'}
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button className="transform translate-y-3 group-hover:translate-y-0 transition-all duration-300 bg-white text-gray-900 font-bold px-5 py-2 rounded-xl shadow-xl text-xs flex items-center gap-2 hover:bg-gray-50">
                      <Eye className="w-3.5 h-3.5" /> Live Preview
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {theme.name}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 mb-3">
                    <div className="flex items-center gap-1 text-amber-500">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span className="font-bold text-gray-700 dark:text-slate-300">{theme.rating}</span>
                    </div>
                    <span>·</span>
                    <span>{theme.stores} stores</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {theme.tags.map(tag => (
                      <span key={tag} className="bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    {theme.price === 'FREE' ? (
                      <span className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-lg">
                        FREE
                      </span>
                    ) : (
                      <div className="flex items-baseline gap-2">
                        <span className="font-black text-blue-600 dark:text-blue-400 text-base">{theme.price}</span>
                        {theme.oldPrice && (
                          <span className="text-gray-400 dark:text-slate-600 text-xs line-through">{theme.oldPrice}</span>
                        )}
                      </div>
                    )}
                    <button className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-3 py-1.5 rounded-lg">
                      <ShoppingBag className="w-3.5 h-3.5" /> Get
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
            <LayoutTemplate className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No themes found</h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">Try adjusting your filters or search query.</p>
            <button 
              onClick={() => { setSearchQuery(''); setActiveCategory('All'); setActivePricing('All'); }}
              className="text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors underline underline-offset-2"
            >
              Clear all filters
            </button>
          </div>
        )}

      </div>

      {/* CTA SECTION */}
      <section className="py-20 bg-blue-600 text-white">
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
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 shadow-xl"
          >
            Request Custom Theme <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
