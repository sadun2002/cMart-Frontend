'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AuraHeader } from '../layouts/AuraHeader';
import { AuraFooter } from '../layouts/AuraFooter';

export function AuraAuth({ 
  storeName, 
  domain,
  title,
  subtitle,
  children
}: { 
  storeName: string; 
  domain: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <div className="flex flex-col min-h-screen bg-aura-surface selection:bg-primary selection:text-white">
      <AuraHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow flex items-center justify-center pt-32 pb-24">
        <div className="w-full max-w-[500px] px-6">
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-serif font-light text-aura-on-surface mb-4">
              {title}
            </h1>
            {subtitle && (
              <p className="text-zinc-500 font-sans text-sm uppercase tracking-widest">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="bg-[#f4f4f5] p-8 md:p-12 border border-aura-border">
            {children}
          </div>
          
          <div className="mt-8 text-center">
            {title === 'Login' ? (
              <p className="text-sm font-sans text-zinc-500">
                New to {storeName}? <Link href={`/s/${domain}/register${themeQuery}`} className="text-black uppercase tracking-widest border-b border-transparent hover:border-black transition-colors pb-0.5">Create an account</Link>
              </p>
            ) : title === 'Create Account' ? (
              <p className="text-sm font-sans text-zinc-500">
                Already have an account? <Link href={`/s/${domain}/login${themeQuery}`} className="text-black uppercase tracking-widest border-b border-transparent hover:border-black transition-colors pb-0.5">Log in</Link>
              </p>
            ) : (
              <Link href={`/s/${domain}/login${themeQuery}`} className="text-sm font-sans uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
                Return to Login
              </Link>
            )}
          </div>
        </div>
      </main>

      <AuraFooter storeName={storeName} domain={domain} />
    </div>
  );
}
