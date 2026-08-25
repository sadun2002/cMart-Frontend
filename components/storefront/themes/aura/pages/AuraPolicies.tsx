'use client';

import React from 'react';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';
import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';

export function AuraPolicies({ 
  storeName, 
  domain,
  title,
  lastUpdated,
  children
}: { 
  storeName: string; 
  domain: string;
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const pathname = usePathname();

  const navLinks = [
    { name: 'Shipping & Returns', href: `/s/${domain}/shipping` },
    { name: 'Terms of Service', href: `/s/${domain}/terms` },
    { name: 'Privacy Policy', href: `/s/${domain}/privacy` },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-6 md:px-12 max-w-[1200px]">
          
          <div className="flex flex-col lg:flex-row gap-16">
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-1/4">
              <div className="sticky top-32">
                <h2 className="text-xs uppercase tracking-[0.2em] font-sans text-zinc-400 mb-8">Legal Information</h2>
                <nav className="flex flex-col gap-6">
                  {navLinks.map(link => {
                    const isActive = pathname === link.href;
                    return (
                      <Link 
                        key={link.name} 
                        href={`${link.href}${themeQuery}`}
                        className={`text-sm uppercase tracking-widest font-sans transition-colors ${
                          isActive ? 'text-black font-semibold' : 'text-zinc-500 hover:text-black'
                        }`}
                      >
                        {link.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Content Area */}
            <div className="w-full lg:w-3/4">
              <h1 className="text-4xl md:text-5xl font-serif font-light text-aura-on-surface mb-4">
                {title}
              </h1>
              <p className="text-zinc-500 font-sans text-xs uppercase tracking-widest mb-16 pb-8 border-b border-aura-border">
                Last Updated: {lastUpdated}
              </p>
              
              <div className="prose prose-zinc max-w-none font-serif font-light text-zinc-600 prose-headings:font-serif prose-headings:font-light prose-headings:text-black prose-p:leading-relaxed prose-a:text-black hover:prose-a:text-zinc-500">
                {children}
              </div>
            </div>

          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
