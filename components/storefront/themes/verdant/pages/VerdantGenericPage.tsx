import React from 'react';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import Link from 'next/link';

export function VerdantGenericPage({ 
  storeName, 
  domain,
  title,
  children
}: { 
  storeName: string; 
  domain: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <div className="bg-verdant-surface-container-low py-12 border-b border-verdant-surface-container">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          <h1 className="text-4xl font-verdant-heading font-bold text-verdant-on-surface mb-4">{title}</h1>
        </div>
      </div>

      <main className="flex-grow py-12">
        <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
          {children ? (
            <div className="bg-verdant-surface-bright rounded-[24px] shadow-sm border border-verdant-surface-container p-6 md:p-12">
              {children}
            </div>
          ) : (
            <div className="bg-verdant-surface-bright rounded-[24px] shadow-sm border border-verdant-surface-container p-12 text-center flex flex-col items-center">
              <h2 className="text-2xl font-verdant-heading font-bold text-verdant-on-surface mb-4">Coming Soon</h2>
              <p className="font-verdant-body text-verdant-on-surface-variant max-w-md mb-8">
                The {title} page is currently being updated with fresh content. Please check back later.
              </p>
              <Link 
                href={`/s/${domain}`}
                className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                Return Home
              </Link>
            </div>
          )}
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}
