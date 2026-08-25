'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { VerdantHeroSlider } from '../components/VerdantHeroSlider';
import { VerdantProductGrid } from '../components/VerdantProductGrid';

export function VerdantHome({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow">
        <VerdantHeroSlider domain={domain} />
        
        {/* Features Section */}
        <section className="bg-verdant-surface-container-low py-12 mb-8">
          <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-verdant-surface-container-high">
              <div className="p-4">
                <div className="text-primary mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
                </div>
                <h3 className="font-verdant-heading font-semibold text-verdant-on-surface mb-2">Same Day Delivery</h3>
                <p className="text-sm font-verdant-body text-verdant-on-surface-variant">Fresh groceries delivered to your door within hours.</p>
              </div>
              <div className="p-4 pt-8 md:pt-4">
                <div className="text-primary mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <h3 className="font-verdant-heading font-semibold text-verdant-on-surface mb-2">Best Prices</h3>
                <p className="text-sm font-verdant-body text-verdant-on-surface-variant">We offer the most competitive prices for premium organic food.</p>
              </div>
              <div className="p-4 pt-8 md:pt-4">
                <div className="text-primary mb-3 flex justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h3 className="font-verdant-heading font-semibold text-verdant-on-surface mb-2">100% Quality</h3>
                <p className="text-sm font-verdant-body text-verdant-on-surface-variant">Every item is handpicked to ensure the highest quality standards.</p>
              </div>
            </div>
          </div>
        </section>

        <VerdantProductGrid domain={domain} title="Fresh Arrivals" limit={4} />
        
        {/* Promotional Banner */}
        <section className="py-12">
          <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
            <div className="relative rounded-[24px] overflow-hidden bg-verdant-primary-container text-verdant-on-primary-container shadow-sm p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="max-w-xl z-10">
                <span className="inline-block px-3 py-1 mb-4 text-xs font-bold tracking-wider uppercase bg-white text-verdant-primary rounded-full">
                  Special Offer
                </span>
                <h2 className="text-3xl md:text-4xl font-verdant-heading font-bold mb-4">
                  Get 20% Off Your First Organic Box
                </h2>
                <p className="text-lg font-verdant-body opacity-90 mb-8">
                  Start your healthy eating journey today. Use code FRESH20 at checkout for an exclusive discount on all organic produce.
                </p>
                <a href={`/s/${domain}/shop${themeQuery}`} className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-primary bg-white transition-all rounded-xl hover:bg-white/90 shadow-sm">
                  Claim Offer
                </a>
              </div>
              <div className="relative w-full md:w-1/2 h-64 md:h-80 z-10">
                <img 
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1000" 
                  alt="Organic Box" 
                  className="w-full h-full object-cover rounded-2xl shadow-lg border-4 border-white/20"
                />
              </div>
              {/* Decorative shapes */}
              <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-verdant-primary/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        <VerdantProductGrid domain={domain} title="Bestsellers" limit={4} />
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
