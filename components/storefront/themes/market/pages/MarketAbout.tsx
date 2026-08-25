'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { Leaf, Heart, Users } from 'lucide-react';

export function MarketAbout({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow">
        {/* Hero */}
        <div className="relative h-72 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1600&q=80" alt="About us" className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4"
            style={{ background: 'rgba(0,0,0,0.5)' }}>
            <p className="text-xs uppercase tracking-widest mb-2 opacity-70">Our Story</p>
            <h1 className="text-4xl font-bold" style={{ fontFamily: 'var(--font-market-heading)' }}>From the Farm<br />to Your Table</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 max-w-[900px] py-14 space-y-14">
          {/* Mission */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Our Mission</h2>
            <p className="text-base leading-relaxed" style={{ color: 'var(--color-market-on-surface-muted)', maxWidth: '600px', margin: '0 auto' }}>
              We believe everyone deserves access to fresh, nutritious, and sustainably sourced food. {storeName} bridges the gap between local farmers and your kitchen, delivering peak-freshness produce with care and transparency.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Leaf className="w-6 h-6" />, title: 'Sustainably Sourced', desc: 'We partner exclusively with farms that practice regenerative and sustainable agriculture.' },
              { icon: <Heart className="w-6 h-6" />, title: 'Community First', desc: 'Every purchase supports local farming families and strengthens our regional food system.' },
              { icon: <Users className="w-6 h-6" />, title: 'Transparent Supply', desc: 'We trace every product from seed to shelf so you know exactly where your food comes from.' },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl p-6 text-center"
                style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'var(--color-market-primary-light)', color: 'var(--color-market-primary)' }}>
                  {v.icon}
                </div>
                <h3 className="font-bold mb-2" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{v.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="rounded-2xl overflow-hidden aspect-[4/3]">
              <img src="https://images.unsplash.com/photo-1595475207225-428b62bda831?w=800&q=80" alt="Farm story" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>A Labour of Love</h2>
              <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                Founded in 2020, {storeName} started as a small farmers market stand. Today, we work with over 40 local farms to bring you the freshest selection of organic produce, artisan bakery goods, and daily essentials.
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                We believe transparency is the foundation of trust. That's why every product page shows you exactly which farm it came from, how it was grown, and when it was harvested.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
