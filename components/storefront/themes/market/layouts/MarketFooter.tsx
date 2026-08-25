'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { QrCode, Share2, Globe } from 'lucide-react';

export function MarketFooter({ storeName, domain }: { storeName: string; domain: string }) {
  const [email, setEmail] = useState('');
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <footer style={{ backgroundColor: 'var(--color-market-surface)', borderTop: '1px solid var(--color-market-border)', fontFamily: 'var(--font-market-body)' }}>
      <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-market-primary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-base" style={{ fontFamily: 'var(--font-market-heading)', color: 'var(--color-market-primary)' }}>
                {storeName}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-market-on-surface-muted)' }}>
              Bringing the freshest organic produce and premium groceries directly from local gardens to your kitchen. Quality you can taste, service you can trust.
            </p>
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--color-market-on-surface-muted)' }}><QrCode className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--color-market-on-surface-muted)' }}><Share2 className="w-4 h-4" /></button>
              <button className="p-2 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--color-market-on-surface-muted)' }}><Globe className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Shop Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Shop</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'All Products', href: `/s/${domain}/shop${themeQuery}` },
                { label: 'Current Offers', href: `/s/${domain}/offers${themeQuery}` },
                { label: 'Categories', href: `/s/${domain}/categories${themeQuery}` },
                { label: 'Subscription Box', href: `/s/${domain}/shop${themeQuery}` },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Support</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'FAQ', href: `/s/${domain}/faq${themeQuery}` },
                { label: 'Shipping Info', href: `/s/${domain}/shipping${themeQuery}` },
                { label: 'Returns', href: `/s/${domain}/privacy${themeQuery}` },
                { label: 'Contact Us', href: `/s/${domain}/contact${themeQuery}` },
              ].map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition-colors hover:opacity-80" style={{ color: 'var(--color-market-on-surface-muted)' }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>Newsletter</h4>
            <p className="text-sm" style={{ color: 'var(--color-market-on-surface-muted)' }}>
              Join our market for fresh deals and seasonal recipes.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none"
                style={{
                  border: '1px solid var(--color-market-border)',
                  backgroundColor: 'var(--color-market-surface-low)',
                  color: 'var(--color-market-on-surface)',
                  fontFamily: 'var(--font-market-body)',
                }}
              />
              <button
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t" style={{ borderColor: 'var(--color-market-border)' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px] py-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>
            <Link href={`/s/${domain}/privacy${themeQuery}`} className="hover:opacity-80 transition-opacity">Privacy Policy</Link>
            <Link href={`/s/${domain}/terms${themeQuery}`} className="hover:opacity-80 transition-opacity">Terms of Service</Link>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-market-on-surface-muted)' }}>
            <span>Accepted Payments:</span>
            <div className="flex gap-1">
              <div className="w-8 h-5 rounded border flex items-center justify-center text-[9px] font-bold" style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface-muted)' }}>VISA</div>
              <div className="w-8 h-5 rounded border flex items-center justify-center text-[9px] font-bold" style={{ borderColor: 'var(--color-market-border)', color: 'var(--color-market-on-surface-muted)' }}>MC</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
