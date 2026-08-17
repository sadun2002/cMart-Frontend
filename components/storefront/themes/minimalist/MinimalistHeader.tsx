"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, User, X } from "lucide-react";
import { useStorefrontCart } from "@/store/useStorefrontCart";
import { useEffect, useState, useRef } from "react";
import { useStorefrontAuth } from "@/store/useStorefrontAuth";
import { useRouter } from "next/navigation";
import { MinimalistCartPanel } from "./MinimalistCartPanel";

export function MinimalistHeader({ storeName = "My Store", domain = "" }) {
  const items = useStorefrontCart((state) => state.items);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const addItem = useStorefrontCart((state) => state.addItem);
  const { isAuthenticated } = useStorefrontAuth();
  const [mounted, setMounted] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    
    if (isSearchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/s/${domain}/shop?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Mobile Menu */}
            <div className="flex items-center sm:hidden">
              <button className="p-2 text-muted-foreground hover:text-foreground cursor-pointer">
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href={`/s/${domain}`} className="text-xl font-bold tracking-tight text-foreground cursor-pointer">
                {storeName}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden sm:flex space-x-8">
              <Link href={`/s/${domain}`} className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                Home
              </Link>
              <Link href={`/s/${domain}/shop`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Shop
              </Link>
              <Link href={`/s/${domain}/categories`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Categories
              </Link>
              <Link href={`/s/${domain}/about`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                About Us
              </Link>
              <Link href={`/s/${domain}/contact`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                Contact Us
              </Link>
              <Link href={`/s/${domain}/offers`} className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors cursor-pointer">
                Offers & Sale
              </Link>
            </nav>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div ref={searchRef}>
                <button 
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="p-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {isSearchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                </button>
                {/* Search Bar Overlay attached to the button area for relative positioning or absolute drop down */}
                {isSearchOpen && (
                  <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-100 py-4 px-4 sm:px-6 lg:px-8 shadow-sm origin-top animate-in fade-in slide-in-from-top-2">
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex items-stretch border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-black focus-within:border-black transition-all">
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 border-0 focus:ring-0 sm:text-sm px-4 py-2 outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                      >
                        Search
                      </button>
                    </form>
                  </div>
                )}
              </div>
              
              <Link 
                href={isAuthenticated ? `/s/${domain}/account` : `/s/${domain}/login`} 
                className="p-2 text-muted-foreground hover:text-foreground transition-colors hidden sm:block cursor-pointer"
              >
                <User className="w-5 h-5" />
              </Link>
              
              {/* Cart button — count is reactive via items selector */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-secondary transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Cart Panel Overlay */}
      <MinimalistCartPanel 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        domain={domain} 
      />
    </>
  );
}
