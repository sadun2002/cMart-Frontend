'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { VerdantHeader } from '../layouts/VerdantHeader';
import { VerdantFooter } from '../layouts/VerdantFooter';
import { Leaf } from 'lucide-react';

export function VerdantAuthLayout({ 
  storeName, 
  domain, 
  title, 
  subtitle,
  children 
}: { 
  storeName: string; 
  domain: string; 
  title: string; 
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-verdant-background">
      <VerdantHeader storeName={storeName} domain={domain} />
      
      <main className="flex-grow flex items-center justify-center py-12 px-4 relative overflow-hidden">
        {/* Background decorative images (organic shapes) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-verdant-primary rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-verdant-tertiary rounded-full blur-3xl"></div>
        </div>

        <div className="w-full max-w-md relative z-10">
          <div className="bg-white rounded-[32px] shadow-sm border border-verdant-surface-container overflow-hidden">
            <div className="p-8 md:p-10">
              <div className="flex justify-center mb-6">
                <div className="bg-primary text-primary-foreground p-3 rounded-2xl shadow-sm">
                  <Leaf size={32} />
                </div>
              </div>
              
              <div className="text-center mb-8">
                <h1 className="text-3xl font-verdant-heading font-bold text-verdant-on-surface mb-2">{title}</h1>
                <p className="text-verdant-on-surface-variant font-verdant-body">{subtitle}</p>
              </div>

              {children}
            </div>
          </div>
        </div>
      </main>

      <VerdantFooter storeName={storeName} domain={domain} />
    </div>
  );
}

export function VerdantLogin({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <VerdantAuthLayout 
      storeName={storeName} 
      domain={domain} 
      title="Welcome Back" 
      subtitle="Sign in to your account"
    >
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-2">
          <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com"
            className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Password</label>
            <Link href={`/s/${domain}/forgot-password${themeQuery}`} className="text-sm text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
          <input 
            type="password" 
            placeholder="••••••••"
            className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
          />
        </div>

        <button 
          type="submit"
          className="mt-4 w-full py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
        >
          Sign In
        </button>
      </form>

      <div className="mt-8 text-center font-verdant-body text-verdant-on-surface-variant">
        Don't have an account?{' '}
        <Link href={`/s/${domain}/register${themeQuery}`} className="text-primary font-semibold hover:underline">
          Create one
        </Link>
      </div>
    </VerdantAuthLayout>
  );
}

export function VerdantRegister({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <VerdantAuthLayout 
      storeName={storeName} 
      domain={domain} 
      title="Create Account" 
      subtitle="Join us for fresh, organic deliveries"
    >
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">First Name</label>
            <input 
              type="text" 
              placeholder="Jane"
              className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Last Name</label>
            <input 
              type="text" 
              placeholder="Doe"
              className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com"
            className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
          />
        </div>

        <button 
          type="submit"
          className="mt-4 w-full py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
        >
          Create Account
        </button>
      </form>

      <div className="mt-8 text-center font-verdant-body text-verdant-on-surface-variant">
        Already have an account?{' '}
        <Link href={`/s/${domain}/login${themeQuery}`} className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </VerdantAuthLayout>
  );
}

export function VerdantForgotPassword({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <VerdantAuthLayout 
      storeName={storeName} 
      domain={domain} 
      title="Reset Password" 
      subtitle="We'll send you instructions"
    >
      <form className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
        <div className="flex flex-col gap-2">
          <label className="font-verdant-body text-sm font-semibold text-verdant-on-surface">Email Address</label>
          <input 
            type="email" 
            placeholder="you@example.com"
            className="p-4 bg-verdant-surface-container-low border border-verdant-surface-container rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-verdant-body transition-all"
          />
        </div>
        
        <button 
          type="submit"
          className="mt-4 w-full py-4 bg-primary text-white font-verdant-body font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:-translate-y-0.5"
        >
          Send Reset Link
        </button>
      </form>

      <div className="mt-8 text-center font-verdant-body text-verdant-on-surface-variant">
        Remember your password?{' '}
        <Link href={`/s/${domain}/login${themeQuery}`} className="text-primary font-semibold hover:underline">
          Sign in
        </Link>
      </div>
    </VerdantAuthLayout>
  );
}
