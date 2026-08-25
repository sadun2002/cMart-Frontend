'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ShoppingCart, Menu, Search, User, Leaf } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStorefrontCart as useCart } from '@/store/useStorefrontCart';
import { useThemeCustomizations } from '@/components/storefront/theme-provider';
import { motion, AnimatePresence } from 'framer-motion';

export function VerdantHeader({ storeName, domain }: { storeName: string; domain: string }) {
  const items = useCart((state) => state.items);
  const { customizations } = useThemeCustomizations();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalItems = items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const navLinks = [
    { name: 'Home', path: `/s/${domain}${themeQuery}` },
    { name: 'Shop', path: `/s/${domain}/shop${themeQuery}` },
    { name: 'Categories', path: `/s/${domain}/categories${themeQuery}` },
    { name: 'Offers', path: `/s/${domain}/offers${themeQuery}` },
    { name: 'About', path: `/s/${domain}/about${themeQuery}` },
    { name: 'Contact', path: `/s/${domain}/contact${themeQuery}` },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'bg-verdant-surface-bright/90 backdrop-blur-md shadow-md py-3' 
          : 'bg-verdant-surface-bright py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 max-w-[1280px]">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href={`/s/${domain}${themeQuery}`} className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-2 rounded-xl group-hover:bg-primary/90 transition-colors">
              <Leaf size={24} />
            </div>
            <span className="font-verdant-heading font-bold text-2xl tracking-tight text-verdant-on-surface">
              {storeName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-verdant-body font-medium transition-colors relative py-2 ${
                    isActive ? 'text-primary' : 'text-verdant-on-surface-variant hover:text-primary'
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.div 
                      layoutId="verdant-nav-indicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-verdant-on-surface-variant hover:text-primary hover:bg-verdant-surface-container rounded-full hidden sm:flex">
              <Search className="w-5 h-5" />
            </Button>
            
            <Link href={`/s/${domain}/account${themeQuery}`}>
              <Button variant="ghost" size="icon" className="text-verdant-on-surface-variant hover:text-primary hover:bg-verdant-surface-container rounded-full hidden sm:flex">
                <User className="w-5 h-5" />
              </Button>
            </Link>

            <Link href={`/s/${domain}/cart${themeQuery}`}>
              <Button variant="ghost" size="icon" className="text-verdant-on-surface-variant hover:text-primary hover:bg-verdant-surface-container rounded-full relative">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 bg-verdant-secondary-container text-verdant-on-secondary-container text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white"
                  >
                    {totalItems}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Toggle */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden text-verdant-on-surface hover:bg-verdant-surface-container rounded-full"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-verdant-surface-bright border-t border-verdant-surface-container-high overflow-hidden"
          >
            <nav className="flex flex-col py-4 px-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg font-verdant-body text-sm font-medium ${
                    pathname === link.path 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-verdant-on-surface-variant hover:bg-verdant-surface-container'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="flex items-center gap-4 px-4 py-3 mt-2 border-t border-verdant-surface-container-high">
                <Link href={`/s/${domain}/account${themeQuery}`} className="flex items-center gap-2 text-sm font-medium text-verdant-on-surface-variant" onClick={() => setIsMobileMenuOpen(false)}>
                  <User className="w-5 h-5" /> Account
                </Link>
                <button className="flex items-center gap-2 text-sm font-medium text-verdant-on-surface-variant ml-4">
                  <Search className="w-5 h-5" /> Search
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
