'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ShoppingBag, Menu, X, Search, User } from 'lucide-react';
import { useStorefrontCart } from '@/store/useStorefrontCart';
import { motion, AnimatePresence } from 'framer-motion';

export function AuraHeader({ storeName, domain }: { storeName: string; domain: string }) {
  const cartItems = useStorefrontCart((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Shop', href: `/s/${domain}/shop${themeQuery}` },
    { name: 'Collections', href: `/s/${domain}/categories${themeQuery}` },
    { name: 'Editorial', href: `/s/${domain}/about${themeQuery}` },
  ];

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 font-serif ${
          isScrolled 
            ? 'bg-white/90 backdrop-blur-md border-b border-aura-border py-4 shadow-sm' 
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 max-w-[1600px] flex items-center justify-between">
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-aura-on-surface"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu size={24} strokeWidth={1.5} />
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-widest text-aura-on-surface font-medium">
            {navLinks.map(link => (
              <Link key={link.name} href={link.href} className="hover:text-primary transition-colors relative group">
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary transition-all duration-300 group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Link 
            href={`/s/${domain}${themeQuery}`}
            className="text-2xl md:text-3xl font-bold tracking-[0.2em] text-aura-on-surface uppercase text-center absolute left-1/2 -translate-x-1/2"
          >
            {storeName}
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-5 text-aura-on-surface">
            <button className="hidden sm:block hover:text-primary transition-colors">
              <Search size={22} strokeWidth={1.5} />
            </button>
            <Link href={`/s/${domain}/account${themeQuery}`} className="hidden sm:block hover:text-primary transition-colors">
              <User size={22} strokeWidth={1.5} />
            </Link>
            <Link href={`/s/${domain}/cart${themeQuery}`} className="hover:text-primary transition-colors relative">
              <ShoppingBag size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center font-sans">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3, ease: 'easeOut' }}
              className="fixed top-0 left-0 bottom-0 w-[80%] max-w-sm bg-white z-[70] flex flex-col p-8 font-serif border-r border-aura-border"
            >
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="absolute top-6 right-6 text-aura-on-surface hover:text-primary transition-colors"
              >
                <X size={24} strokeWidth={1.5} />
              </button>
              
              <div className="text-2xl font-bold tracking-[0.2em] uppercase mb-12 mt-2">{storeName}</div>
              
              <nav className="flex flex-col gap-6 text-lg uppercase tracking-wider">
                {navLinks.map(link => (
                  <Link 
                    key={link.name} 
                    href={link.href} 
                    className="hover:text-primary transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-6 text-sm uppercase tracking-wider pt-8 border-t border-aura-border">
                <Link href={`/s/${domain}/account${themeQuery}`} className="flex items-center gap-3 hover:text-primary">
                  <User size={18} strokeWidth={1.5} /> Account
                </Link>
                <button className="flex items-center gap-3 hover:text-primary text-left">
                  <Search size={18} strokeWidth={1.5} /> Search
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
