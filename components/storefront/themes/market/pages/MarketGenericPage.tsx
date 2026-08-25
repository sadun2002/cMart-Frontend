'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';
import { MarketProductGrid } from '../components/MarketProductGrid';

export function MarketGenericPage({ storeName, domain, title = 'Page', content = '' }: { storeName: string; domain: string; title?: string; content?: string }) {
  const searchParams = useSearchParams();

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />
      <main className="flex-grow container mx-auto px-4 md:px-6 max-w-[1280px] py-14">
        <h1 className="text-3xl font-bold mb-6" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>{title}</h1>
        {content ? (
          <p className="text-base leading-relaxed" style={{ color: 'var(--color-market-on-surface-muted)' }}>{content}</p>
        ) : (
          <MarketProductGrid domain={domain} title="Our Products" />
        )}
      </main>
      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
