'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { MarketProductGrid } from '../components/MarketProductGrid';
import { ArrowRight, Truck, Leaf, ShieldCheck } from 'lucide-react';

const CATEGORIES = [
  { name: 'Fruits & Veggies', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&q=80' },
  { name: 'Dairy & Eggs', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { name: 'Bakery & Pastry', image: 'https://images.unsplash.com/photo-1608198093002-ad4e005484ec?w=400&q=80' },
  { name: 'Fresh Meat', image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80' },
  { name: 'Pantry Staples', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80' },
];

export function MarketHome({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">

        {/* Hero Section */}
        <section className="relative w-full overflow-hidden" style={{ height: '520px' }}>
          <img
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80"
            alt="Fresh organic produce"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 70%)' }} />
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: 'var(--font-market-heading)' }}>
              Freshness Delivered<br />to Your Doorstep
            </h1>
            <p className="text-white/80 text-lg max-w-xl mb-8">
              Shop the finest organic fruits, vegetables, and daily essentials, harvested locally and delivered with care.
            </p>
            <Link href={`/s/${domain}/shop${themeQuery}`}
              className="px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider transition-all hover:opacity-90 hover:scale-105"
              style={{ backgroundColor: 'var(--color-market-secondary)', color: 'var(--color-market-on-primary)', fontFamily: 'var(--font-market-heading)' }}>
              Shop Now
            </Link>
          </div>
        </section>

        {/* Trust Badges */}
        <div className="shadow-sm" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
          <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-200">
              {[
                { icon: <Truck className="w-5 h-5" />, title: 'Free Shipping', desc: 'On orders over LKR 5,000' },
                { icon: <Leaf className="w-5 h-5" />, title: 'Organic Certified', desc: '100% natural produce' },
                { icon: <ShieldCheck className="w-5 h-5" />, title: '24/7 Support', desc: 'Always here to help' },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3 py-5 px-8">
                  <div className="shrink-0" style={{ color: 'var(--color-market-primary)' }}>{item.icon}</div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{item.title}</p>
                    <p className="text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Shop by Category */}
        <section className="py-14">
          <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                  Shop by Category
                </h2>
                <p className="text-sm mt-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>Find exactly what you need.</p>
              </div>
              <Link href={`/s/${domain}/categories${themeQuery}`}
                className="flex items-center gap-1 text-sm font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-market-primary)' }}>
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {CATEGORIES.map((cat) => (
                <Link key={cat.name} href={`/s/${domain}/categories${themeQuery}`}
                  className="relative rounded-2xl overflow-hidden group aspect-[4/3] cursor-pointer">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                  <p className="absolute bottom-3 left-3 text-white font-bold text-sm"
                    style={{ fontFamily: 'var(--font-market-heading)' }}>{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Promo Banners */}
        <section className="py-2 pb-14">
          <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Flash Sale Banner */}
              <div className="relative rounded-2xl overflow-hidden p-8 flex flex-col justify-end min-h-[180px]"
                style={{ backgroundColor: 'var(--color-market-amber-light)', border: '1px dashed var(--color-market-amber)' }}>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3"
                  style={{ backgroundColor: 'var(--color-market-amber)', color: 'white' }}>Flash Sale</span>
                <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                  20% off all Organic Dairy
                </h3>
                <Link href={`/s/${domain}/offers${themeQuery}`}
                  className="text-sm font-semibold" style={{ color: 'var(--color-market-secondary)' }}>
                  Shop Dairy →
                </Link>
              </div>
              {/* New Arrival Banner */}
              <div className="relative rounded-2xl overflow-hidden p-8 flex flex-col justify-end min-h-[180px]"
                style={{ backgroundColor: 'var(--color-market-primary)', background: 'linear-gradient(135deg, #006c49 0%, #10b981 100%)' }}>
                <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold mb-3 bg-white/20 text-white">New Arrival</span>
                <h3 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-market-heading)' }}>
                  Artisan Sourdough Loaves
                </h3>
                <Link href={`/s/${domain}/shop${themeQuery}`} className="text-sm font-semibold text-white/80">
                  Order Fresh →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <MarketProductGrid domain={domain} title="You Might Need" subtitle="Curated fresh picks for your weekly basket" limit={8} />

      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
