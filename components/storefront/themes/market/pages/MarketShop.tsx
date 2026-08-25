'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { MarketProductCard } from '../components/MarketProductCard';
import { ChevronRight, SlidersHorizontal } from 'lucide-react';

const ALL_PRODUCTS = [
  { id: '1', name: 'Heirloom Vine Tomatoes', price: 1250, compareAtPrice: 1600, image: 'https://images.unsplash.com/photo-1566842600175-97dca6f50c6b?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Locally grown, vibrant red heirloom tomatoes.' },
  { id: '2', name: 'Organic Green Kale', price: 750, compareAtPrice: 990, image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Crisp, nutrient-dense green kale.' },
  { id: '3', name: 'White Button Mushrooms', price: 980, image: 'https://images.unsplash.com/photo-1611010344444-5f9e4d86a6d7?w=600&q=80', category: 'Fruits & Veg', badge: 'Local', description: 'Earthy and mild mushrooms.' },
  { id: '4', name: 'Sweet Bell Peppers', price: 600, image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&q=80', category: 'Fruits & Veg', description: 'Crunchy, sweet, and colorful bell peppers.' },
  { id: '5', name: 'Artisan Sourdough Loaf', price: 1800, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80', category: 'Bakery', description: 'Baked fresh this morning.' },
  { id: '6', name: 'Organic Hass Avocados', price: 1500, image: 'https://images.unsplash.com/photo-1519162808019-7de1683fa2ad?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Creamy, rich, and perfectly ripe.' },
  { id: '7', name: 'Farm Fresh Eggs (12pk)', price: 1200, image: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&q=80', category: 'Dairy & Eggs', badge: 'Local', description: 'Free-range, pasture-raised eggs.' },
  { id: '8', name: 'Extra Virgin Olive Oil', price: 4500, compareAtPrice: 5500, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', category: 'Pantry', description: 'Cold-pressed with a rich, fruity flavour.' },
  { id: '9', name: 'Organic Meyer Lemons', price: 800, image: 'https://images.unsplash.com/photo-1575377427642-087cf684b99d?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Fragrant, juicy organic lemons.' },
  { id: '10', name: 'Whole Milk (1L)', price: 550, image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80', category: 'Dairy & Eggs', badge: 'Local', description: 'Whole farm fresh milk, delivered daily.' },
  { id: '11', name: 'Raw Almonds (500g)', price: 2200, image: 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=600&q=80', category: 'Pantry', description: 'Premium raw almonds for snacking.' },
  { id: '12', name: 'Sparkling Water (6pk)', price: 900, image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80', category: 'Beverages', description: 'Crisp, refreshing sparkling mineral water.' },
];

const CATEGORIES = ['All', 'Fruits & Veg', 'Dairy & Eggs', 'Bakery', 'Pantry', 'Beverages'];
const SORT_OPTIONS = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Newest'];

export function MarketShop({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Relevance');
  const [priceRange, setPriceRange] = useState(15000);
  const [filterOpen, setFilterOpen] = useState(false);

  const filtered = ALL_PRODUCTS.filter((p) =>
    activeCategory === 'All' || p.category === activeCategory
  ).sort((a, b) => {
    if (sortBy === 'Price: Low to High') return a.price - b.price;
    if (sortBy === 'Price: High to Low') return b.price - a.price;
    return 0;
  }).filter(p => p.price <= priceRange);

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        {/* Hero Banner */}
        <div className="relative h-48 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80" alt="Shop" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
            <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-market-heading)' }}>Explore Our Departments</h1>
            <p className="text-white/80 text-sm">Discover the freshest, highest-quality organic goods carefully curated from local farms.</p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--color-market-on-surface-muted)' }}>
            <Link href={`/s/${domain}${themeQuery}`} className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span style={{ color: 'var(--color-market-on-surface)' }}>Shop</span>
          </nav>

          <div className="flex gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden md:flex flex-col gap-6 w-56 shrink-0">
              {/* Categories */}
              <div>
                <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Categories</h3>
                <ul className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <li key={cat}>
                      <label className="flex items-center justify-between cursor-pointer group">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded flex items-center justify-center border transition-colors cursor-pointer"
                            style={{
                              backgroundColor: activeCategory === cat ? 'var(--color-market-primary)' : 'white',
                              borderColor: activeCategory === cat ? 'var(--color-market-primary)' : 'var(--color-market-border)',
                            }}
                            onClick={() => setActiveCategory(cat)}>
                            {activeCategory === cat && <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 10" fill="currentColor"><path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>}
                          </div>
                          <span className="text-sm" style={{ color: 'var(--color-market-on-surface)' }}>{cat}</span>
                        </div>
                        <span className="text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                          {cat === 'All' ? ALL_PRODUCTS.length : ALL_PRODUCTS.filter(p => p.category === cat).length}
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Price Range</h3>
                <input type="range" min="500" max="15000" step="100" value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full accent-emerald-700" style={{ accentColor: 'var(--color-market-primary)' }} />
                <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                  <span>LKR 0</span>
                  <span>LKR {priceRange.toLocaleString()}</span>
                </div>
              </div>

              {/* Dietary */}
              <div>
                <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Dietary</h3>
                <ul className="space-y-2">
                  {['Organic Only', 'Gluten Free', 'Vegan'].map((filter) => (
                    <li key={filter}>
                      <label className="flex items-center gap-2 cursor-pointer text-sm" style={{ color: 'var(--color-market-on-surface)' }}>
                        <input type="checkbox" className="rounded" style={{ accentColor: 'var(--color-market-primary)' }} />
                        {filter}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {/* Title + Sort */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                    {activeCategory === 'All' ? 'Fresh Produce' : activeCategory}
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>Showing {filtered.length} products</p>
                </div>
                <div className="flex items-center gap-3">
                  <button className="md:hidden flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border"
                    style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface)' }}
                    onClick={() => setFilterOpen(!filterOpen)}>
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </button>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border rounded-lg px-3 py-2 outline-none"
                    style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface)', backgroundColor: 'var(--color-market-surface)' }}>
                    {SORT_OPTIONS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map((product) => (
                  <MarketProductCard key={product.id} product={product} domain={domain} />
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-center gap-2 mt-10">
                {[1, 2, 3, '...', 8].map((page, i) => (
                  <button key={i}
                    className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${page === 1 ? 'text-white' : ''}`}
                    style={{
                      backgroundColor: page === 1 ? 'var(--color-market-primary)' : 'var(--color-market-surface)',
                      color: page === 1 ? 'white' : 'var(--color-market-on-surface-muted)',
                      border: `1px solid ${page === 1 ? 'var(--color-market-primary)' : 'var(--color-market-border)'}`,
                    }}>
                    {page}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
