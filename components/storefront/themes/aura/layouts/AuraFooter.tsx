'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Instagram, Facebook, Twitter, ArrowRight } from 'lucide-react';

export function AuraFooter({ storeName, domain }: { storeName: string; domain: string }) {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme');
  const themeQuery = theme ? `?theme=${theme}` : '';

  return (
    <footer className="bg-zinc-950 text-white font-serif pt-24 pb-12 border-t border-zinc-900">
      <div className="container mx-auto px-6 md:px-12 max-w-[1600px]">
        
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8 mb-24">
          
          {/* Brand & Newsletter */}
          <div className="md:col-span-5 lg:col-span-4 flex flex-col gap-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-[0.2em] uppercase">{storeName}</h2>
            <p className="text-zinc-400 font-sans font-light leading-relaxed">
              Curated fashion for the modern individual. Elevate your wardrobe with our premium collections designed for elegance and comfort.
            </p>
            <div className="flex flex-col gap-4 mt-4">
              <h3 className="uppercase tracking-widest text-sm font-medium">Join our newsletter</h3>
              <form className="relative flex items-center" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="w-full bg-transparent border-b border-zinc-700 py-3 pl-0 pr-10 text-sm font-sans focus:outline-none focus:border-white transition-colors"
                />
                <button type="submit" className="absolute right-0 text-zinc-400 hover:text-white transition-colors">
                  <ArrowRight size={20} strokeWidth={1.5} />
                </button>
              </form>
            </div>
          </div>

          <div className="md:col-span-1 lg:col-span-2 hidden lg:block"></div>

          {/* Navigation Links */}
          <div className="md:col-span-6 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-12 font-sans text-sm">
            <div className="flex flex-col gap-6">
              <h3 className="uppercase tracking-widest font-medium font-serif text-zinc-300">Shop</h3>
              <nav className="flex flex-col gap-4 text-zinc-400 font-light">
                <Link href={`/s/${domain}/shop${themeQuery}`} className="hover:text-white transition-colors w-fit">All Collections</Link>
                <Link href={`/s/${domain}/categories${themeQuery}`} className="hover:text-white transition-colors w-fit">Categories</Link>
                <Link href={`/s/${domain}/offers${themeQuery}`} className="hover:text-white transition-colors w-fit">Special Offers</Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-6">
              <h3 className="uppercase tracking-widest font-medium font-serif text-zinc-300">About</h3>
              <nav className="flex flex-col gap-4 text-zinc-400 font-light">
                <Link href={`/s/${domain}/about${themeQuery}`} className="hover:text-white transition-colors w-fit">Our Story</Link>
                <Link href={`/s/${domain}/contact${themeQuery}`} className="hover:text-white transition-colors w-fit">Contact Us</Link>
                <Link href={`/s/${domain}/faq${themeQuery}`} className="hover:text-white transition-colors w-fit">FAQ</Link>
              </nav>
            </div>
            
            <div className="flex flex-col gap-6 col-span-2 sm:col-span-1">
              <h3 className="uppercase tracking-widest font-medium font-serif text-zinc-300">Legal</h3>
              <nav className="flex flex-col gap-4 text-zinc-400 font-light">
                <Link href={`/s/${domain}/shipping${themeQuery}`} className="hover:text-white transition-colors w-fit">Shipping Policy</Link>
                <Link href={`/s/${domain}/terms${themeQuery}`} className="hover:text-white transition-colors w-fit">Terms of Service</Link>
                <Link href={`/s/${domain}/privacy${themeQuery}`} className="hover:text-white transition-colors w-fit">Privacy Policy</Link>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-zinc-900 text-xs font-sans text-zinc-500 uppercase tracking-wider">
          <p>&copy; {new Date().getFullYear()} {storeName}. All rights reserved.</p>
          <div className="flex items-center gap-6 text-zinc-400">
            <a href="#" className="hover:text-white transition-colors"><Instagram size={18} strokeWidth={1.5} /></a>
            <a href="#" className="hover:text-white transition-colors"><Facebook size={18} strokeWidth={1.5} /></a>
            <a href="#" className="hover:text-white transition-colors"><Twitter size={18} strokeWidth={1.5} /></a>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by</span>
            <span className="font-serif font-bold text-sm tracking-widest text-zinc-300">CMART</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
