'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { ShoppingCart, Search, User, MapPin, ChevronDown, Menu, X } from 'lucide-react';
import { useStorefrontCart } from '@/store/useStorefrontCart';

const categories = ['Fruits & Veg', 'Dairy', 'Bakery', 'Meat', 'Pantry'];

export function MarketHeader({ storeName, domain }: { storeName: string; domain: string }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items } = useStorefrontCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/s/${domain}/shop${themeQuery}&q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-md' : ''}`}
      style={{ fontFamily: 'var(--font-market-body)', backgroundColor: 'var(--color-market-surface)' }}>

      {/* Top Bar */}
      <div className="border-b" style={{ borderColor: 'var(--color-market-border)' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href={`/s/${domain}${themeQuery}`} className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-market-primary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-lg" style={{ fontFamily: 'var(--font-market-heading)', color: 'var(--color-market-primary)' }}>
                {storeName}
              </span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-market-on-surface-subtle)' }} />
                <input
                  type="text"
                  placeholder="Search organic groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none transition-all focus:ring-2"
                  style={{
                    backgroundColor: 'var(--color-market-surface-low)',
                    border: '1px solid var(--color-market-border)',
                    color: 'var(--color-market-on-surface)',
                    fontFamily: 'var(--font-market-body)',
                  }}
                  onFocus={(e) => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.borderColor = 'var(--color-market-primary)'; }}
                  onBlur={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-market-surface-low)'; e.currentTarget.style.borderColor = 'var(--color-market-border)'; }}
                />
              </div>
            </form>

            {/* Right Icons */}
            <div className="flex items-center gap-1 md:gap-3 shrink-0">
              <button className="hidden md:flex items-center gap-1 text-sm px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ color: 'var(--color-market-on-surface-muted)' }}>
                <MapPin className="w-4 h-4" />
                <span>Select Store</span>
              </button>
              <Link href={`/s/${domain}/offers${themeQuery}`}
                className="hidden md:block text-sm font-semibold px-2 py-1 rounded"
                style={{ color: 'var(--color-market-amber)', fontFamily: 'var(--font-market-body)' }}>
                Offers
              </Link>
              <Link href={`/s/${domain}/account${themeQuery}`}
                className="p-2 rounded-full transition-colors hover:opacity-80"
                style={{ color: 'var(--color-market-on-surface-muted)' }}>
                <User className="w-5 h-5" />
              </Link>
              <Link href={`/s/${domain}/cart${themeQuery}`} className="relative p-2 rounded-full transition-colors hover:opacity-80"
                style={{ color: 'var(--color-market-on-surface-muted)' }}>
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: 'var(--color-market-primary)' }}>
                    {cartCount}
                  </span>
                )}
              </Link>
              <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b hidden md:block" style={{ borderColor: 'var(--color-market-border)', backgroundColor: 'var(--color-market-surface)' }}>
        <div className="container mx-auto px-4 md:px-6 max-w-[1280px]">
          <div className="flex items-center h-10 gap-8">
            {categories.map((cat) => (
              <Link key={cat} href={`/s/${domain}/categories${themeQuery}`}
                className="text-sm transition-colors hover:opacity-80"
                style={{ color: 'var(--color-market-on-surface-muted)', fontFamily: 'var(--font-market-body)' }}>
                {cat}
              </Link>
            ))}
            <div className="ml-auto flex items-center gap-6">
              {[
                { label: 'Shop All', href: `/s/${domain}/shop${themeQuery}` },
                { label: 'Best Sellers', href: `/s/${domain}/shop${themeQuery}` },
                { label: 'New Arrivals', href: `/s/${domain}/shop${themeQuery}` },
              ].map((item) => (
                <Link key={item.label} href={item.href}
                  className="text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ color: 'var(--color-market-primary)', fontFamily: 'var(--font-market-body)' }}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t p-4 space-y-3" style={{ backgroundColor: 'var(--color-market-surface)', borderColor: 'var(--color-market-border)' }}>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-market-on-surface-subtle)' }} />
              <input type="text" placeholder="Search groceries..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm outline-none"
                style={{ backgroundColor: 'var(--color-market-surface-low)', border: '1px solid var(--color-market-border)' }} />
            </div>
          </form>
          {[...categories.map((c) => ({ label: c, href: `/s/${domain}/categories${themeQuery}` })),
            { label: 'Shop All', href: `/s/${domain}/shop${themeQuery}` },
            { label: 'Offers', href: `/s/${domain}/offers${themeQuery}` },
          ].map((item) => (
            <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-medium"
              style={{ color: 'var(--color-market-on-surface)', fontFamily: 'var(--font-market-body)' }}>
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
