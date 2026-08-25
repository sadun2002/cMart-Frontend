'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { MarketHeader } from '../layouts/MarketHeader';
import { MarketFooter } from '../layouts/MarketFooter';

type AuthMode = 'login' | 'register';

export function MarketAuth({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const modeParam = searchParams.get('mode') as AuthMode | null;
  const [mode, setMode] = useState<AuthMode>(modeParam === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ email: '', password: '', name: '' });

  const isLogin = mode === 'login';

  const inputStyle = {
    border: '1px solid var(--color-market-border)',
    backgroundColor: 'var(--color-market-surface-low)',
    color: 'var(--color-market-on-surface)',
    fontFamily: 'var(--font-market-body)',
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--color-market-bg)', fontFamily: 'var(--font-market-body)' }}>
      <MarketHeader storeName={storeName} domain={domain} />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: 'var(--color-market-primary)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="white"/></svg>
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-heading)' }}>
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-market-on-surface-muted)' }}>
              {isLogin ? `Sign in to ${storeName}` : `Join ${storeName} today`}
            </p>
          </div>

          <div className="rounded-2xl p-8" style={{ backgroundColor: 'var(--color-market-surface)', border: '1px solid var(--color-market-border)' }}>
            {/* Tab Toggle */}
            <div className="flex rounded-xl overflow-hidden mb-6 p-1" style={{ backgroundColor: 'var(--color-market-surface-low)' }}>
              {(['login', 'register'] as AuthMode[]).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    backgroundColor: mode === m ? 'var(--color-market-surface)' : 'transparent',
                    color: mode === m ? 'var(--color-market-on-surface)' : 'var(--color-market-on-surface-muted)',
                    boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Full Name</label>
                  <input type="text" placeholder="Jane Doe" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Email Address</label>
                <input type="email" placeholder="jane@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-market-on-surface-muted)' }}>Password</label>
                <input type="password" placeholder="••••••••" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none" style={inputStyle} />
              </div>
              {isLogin && (
                <div className="text-right">
                  <Link href={`/s/${domain}/forgot-password${themeQuery}`} className="text-xs font-medium"
                    style={{ color: 'var(--color-market-primary)' }}>Forgot password?</Link>
                </div>
              )}
              <button className="w-full py-3.5 rounded-xl font-bold text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--color-market-primary)', fontFamily: 'var(--font-market-heading)' }}
                onClick={() => router.push(`/s/${domain}${themeQuery}`)}>
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <MarketFooter storeName={storeName} domain={domain} />
    </div>
  );
}
