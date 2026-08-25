'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { MarketProductCard } from '../components/MarketProductCard';
import { ShoppingCart, Tag, Truck } from 'lucide-react';

const DEAL_PRODUCTS = [
  { id: '5', name: 'Artisan Sourdough Boule', price: 1499, compareAtPrice: 1999, image: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80', category: 'Bakery', badge: 'Sale', description: 'Baked fresh this morning. Organic heritage grains.' },
  { id: '2', name: 'Organic Lacinato Kale', price: 625, compareAtPrice: 750, image: 'https://images.unsplash.com/photo-1524179091875-bf99a9a6af57?w=600&q=80', category: 'Fruits & Veg', badge: 'Organic', description: 'Crisp, nutrient-dense dinosaur kale.' },
  { id: '13', name: 'Cold-Pressed Green Juice', price: 1500, compareAtPrice: 1800, image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=600&q=80', category: 'Beverages', description: 'BOGO deal — 2 for 1 on selected juices.' },
  { id: '8', name: 'Extra Virgin Olive Oil 1L', price: 3750, compareAtPrice: 4500, image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&q=80', category: 'Pantry', badge: 'Sale', description: 'Cold-pressed with a rich, fruity flavour.' },
];

const COUPONS = [
  { code: 'SAVE19', title: 'Storewide Savings', desc: '10% OFF', sub: 'Applicable on all organic pantry items. Min spend LKR 5,000.', color: 'var(--color-market-primary)', bg: 'var(--color-market-primary-light)' },
  { code: 'FRESH15', title: 'First Order Bonus', desc: 'LKR 1,500 OFF', sub: 'Welcome to Market! Valid on your first fresh delivery.', color: 'var(--color-market-secondary)', bg: 'var(--color-market-amber-light)' },
  { code: 'FREESHIP', title: 'Weekend Delivery', desc: 'FREE DELIVERY', sub: 'Free standard delivery for orders placed this weekend.', color: '#4b5563', bg: '#f3f4f6' },
];

export function MarketOffers({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const [timeLeft, setTimeLeft] = useState({ h: 14, m: 42, s: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        s -= 1;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { h = 23; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        {/* Flash Sale Hero */}
        <section className="relative min-h-72 overflow-hidden" style={{ background: 'linear-gradient(135deg, #004d33 0%, #006c49 50%, #00965f 100%)' }}>
          <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 text-white"
                  style={{ backgroundColor: 'var(--color-market-amber)' }}>FLASH SALE</span>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-market-heading)' }}>Weekend Harvest Event</h1>
                <p className="text-white/70 text-sm mb-6">Stock up on peak-season organic produce and pantry essentials. Limited quantities available.</p>
                {/* Countdown */}
                <div className="flex items-center gap-3">
                  {[{ label: 'HRS', val: pad(timeLeft.h) }, { label: 'MIN', val: pad(timeLeft.m) }, { label: 'SEC', val: pad(timeLeft.s) }].map((unit, i) => (
                    <React.Fragment key={unit.label}>
                      {i > 0 && <span className="text-2xl font-bold text-white/60">:</span>}
                      <div className="flex flex-col items-center">
                        <span className="text-3xl font-bold text-white font-mono">{unit.val}</span>
                        <span className="text-[10px] text-white/50 tracking-wider">{unit.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex justify-end">
                <div className="rounded-2xl overflow-hidden w-72 shadow-xl" style={{ backgroundColor: 'var(--color-market-surface)' }}>
                  <div className="relative">
                    <img src="https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80" alt="Flash sale" className="w-full h-44 object-cover" />
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-bold text-white" style={{ backgroundColor: 'var(--color-market-error)' }}>-40%</span>
                    <div className="absolute top-3 left-3 flex gap-1">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--color-market-sage)', color: 'var(--color-market-sage-dark)' }}>Organic</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: 'var(--color-market-amber-light)', color: 'var(--color-market-secondary)' }}>Local Farm</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>Mixed Berry</p>
                    <p className="font-bold text-sm mb-1" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Mixed Berry Basket</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold" style={{ color: 'var(--color-market-primary)' }}>LKR 2,250</span>
                        <span className="text-xs line-through ml-2" style={{ color: 'var(--color-market-on-surface-subtle)' }}>LKR 3,750</span>
                      </div>
                    </div>
                    <button className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white"
                      style={{ backgroundColor: 'var(--color-market-secondary)' }}>
                      <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Coupons */}
        <section className="py-10">
          <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"
                style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
                <Tag className="w-5 h-5" style={{ color: 'var(--color-market-primary)' }} />
                Exclusive Market Coupons
              </h2>
              <button className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--color-market-primary)' }}>
                View All Promos →
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {COUPONS.map((c) => (
                <div key={c.code} className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ backgroundColor: c.bg, border: `1px dashed ${c.color}` }}>
                  <div className="w-16 h-16 rounded-xl flex flex-col items-center justify-center shrink-0 text-white font-bold text-center"
                    style={{ backgroundColor: c.color }}>
                    <span className="text-xs leading-tight">{c.desc}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{c.title}</p>
                    <p className="text-xs leading-tight mt-0.5 line-clamp-2" style={{ color: 'var(--color-market-on-surface-muted)' }}>{c.sub}</p>
                    <p className="text-xs font-mono font-bold mt-1.5 px-2 py-0.5 rounded w-fit"
                      style={{ backgroundColor: 'white', color: c.color }}>
                      {c.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Daily Fresh Deals */}
        <section className="py-4 pb-14">
          <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Daily Fresh Deals</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>Hand-picked selections from our farmers, priced to move quickly before they lose their peak freshness.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              {DEAL_PRODUCTS.map((p) => <MarketProductCard key={p.id} product={p} domain={domain} />)}
            </div>
          </div>
        </section>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
