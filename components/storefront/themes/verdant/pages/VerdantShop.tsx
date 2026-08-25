'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { VerdantProductGrid } from '../components/VerdantProductGrid';
import Link from 'next/link';

export function VerdantShop({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <h1 className="text-4xl font-verdant-heading font-bold text-verdant-on-surface mb-4">Shop All Products</h1>
          <p className="text-verdant-on-surface-variant font-verdant-body max-w-2xl">
            Browse our complete selection of fresh, organic, and locally-sourced produce.
          </p>
        </div>
      </div>

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px] flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 shrink-0">
            <div className="bg-verdant-surface-bright p-6 rounded-[16px] shadow-sm border border-verdant-surface-container sticky top-24">
              <h3 className="font-verdant-heading font-semibold text-lg text-verdant-on-surface mb-4">Categories</h3>
              <ul className="space-y-3 font-verdant-body text-sm text-verdant-on-surface-variant">
                <li><Link href={`/s/${domain}/shop${themeQuery}`} className="text-primary font-medium">All Products</Link></li>
                <li><Link href={`/s/${domain}/categories${themeQuery}`} className="hover:text-primary transition-colors">Categories</Link></li>
              </ul>
            </div>
          </aside>

          <div className="flex-grow">
            <div className="-mt-12 md:-mt-16">
              <VerdantProductGrid domain={domain} title="" />
            </div>
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
