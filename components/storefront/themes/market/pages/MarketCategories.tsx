'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    name: 'Fruits & Veg', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
    subcategories: ['Seasonal Produce', 'Organic Greens', 'Exotic Fruits', 'Root Vegetables'],
  },
  {
    name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
    subcategories: ['Artisan Cheese', 'Farm Fresh Eggs', 'Milk & Cream', 'Yogurt & Butter'],
  },
  {
    name: 'Bakery', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=800&q=80',
    subcategories: ['Fresh Breads', 'Pastries & Croissants', 'Cakes & Desserts', 'Gluten-Free Options'],
  },
  {
    name: 'Meat & Seafood', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&q=80',
    subcategories: ['Prime Beef', 'Poultry', 'Wild Caught Seafood', 'Plant-Based Alternatives'],
  },
  {
    name: 'Pantry Staples', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80',
    subcategories: ['Grains & Pasta', 'Spices & Seasonings', 'Oils & Vinegars', 'Canned Goods'],
  },
  {
    name: 'Beverages', image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
    subcategories: ['Fresh Juices', 'Coffee & Tea', 'Water & Sparkling', 'Kombucha & Fermented'],
  },
];

export function MarketCategories({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        {/* Hero */}
        <div className="relative h-52 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80" alt="Categories" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
            style={{ background: 'rgba(0,0,0,0.45)' }}>
            <p className="text-xs uppercase tracking-widest mb-2 opacity-80">Aisles of Quality</p>
            <h1 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-market-heading)' }}>Shop by Category</h1>
            <p className="text-sm text-white/70 mt-2 max-w-md">
              Browse our curated selections to find exactly what you need for your next wholesome meal.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CATEGORIES.map((cat) => (
              <Link key={cat.name} href={`/s/${domain}/shop${themeQuery}`} className="group rounded-2xl overflow-hidden block"
                style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 flex items-end p-4" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)' }}>
                    <h3 className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-market-heading)' }}>{cat.name}</h3>
                  </div>
                </div>
                {/* Subcategories */}
                <div className="p-5">
                  <ul className="space-y-1.5 mb-4">
                    {cat.subcategories.map((sub) => (
                      <li key={sub} className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                        {sub}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center gap-1 text-sm font-semibold transition-opacity group-hover:opacity-70"
                    style={{ color: 'var(--color-market-primary)' }}>
                    Explore Aisle <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
