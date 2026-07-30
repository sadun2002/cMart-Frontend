'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';

const pageTitles: Record<string, string> = {
  '/owner/dashboard': 'Dashboard',
  '/owner/pos': 'POS',
  '/owner/products': 'Products',
  '/owner/categories': 'Categories',
  '/owner/inventory': 'Inventory',
  '/owner/suppliers': 'Suppliers',
  '/owner/sales': 'Sales',
  '/owner/customers': 'Customers',
  '/owner/employees': 'Employees',
  '/owner/attendance': 'Attendance',
  '/owner/reports/sales': 'Reports',
  '/owner/online-orders': 'Online Orders',
  '/owner/online-store/dashboard': 'Online Store',
  '/owner/subscription/plan': 'Subscription',
};

export default function OwnerTopbar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void } = {}) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Auto-hide Topbar logic
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoHidePage = pathname === '/owner/pos' || pathname === '/owner/products' || pathname === '/owner/categories';

  useEffect(() => {
    if (!isAutoHidePage) {
      setIsVisible(true);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      return;
    }

    if (isVisible) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    }

    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, [isAutoHidePage, isVisible]);

  const currentPage = Object.entries(pageTitles).find(([key]) => pathname.startsWith(key));
  const title = currentPage?.[1] || 'Settings';

  const breadcrumbs = pathname.split('/').filter(Boolean).map((segment, i, arr) => ({
    label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
    href: '/' + arr.slice(0, i + 1).join('/'),
    isLast: i === arr.length - 1,
  }));

  return (
    <>
      {isAutoHidePage && !isVisible && (
        <div 
          className="fixed top-0 left-0 right-0 h-4 z-50"
          onMouseEnter={() => setIsVisible(true)}
        />
      )}
      <header 
        className={`z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 transition-all duration-500 ease-in-out flex-shrink-0 ${
          isAutoHidePage && !isVisible 
            ? 'h-0 -translate-y-full opacity-0 overflow-hidden absolute w-full' 
            : 'h-16 translate-y-0 opacity-100 relative'
        }`}
      >
        <div className="flex items-center justify-between px-6 lg:px-8 h-16 relative">
        {/* Left: Title + Breadcrumb */}
        <div className="min-w-0">
          <h1 className="text-xl font-black text-gray-900 dark:text-white truncate">{title}</h1>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            <Link href="/owner/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <span>/</span>
                <span className={crumb.isLast ? 'text-gray-700 dark:text-slate-300 font-medium' : ''}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <Link href="/owner/settings/notifications" className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </Link>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Avatar Dropdown */}
          <div className="relative group ml-1">
            <button className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'J'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-gray-100 dark:border-slate-700">
                <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'Store Owner'}</p>
                <p className="text-[10px] text-gray-500 dark:text-slate-400">{user?.email || 'admin@cmart.com'}</p>
              </div>
              <div className="p-1">
                <Link href="/owner/settings/personal" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">Personal Profile</Link>
                <Link href="/owner/settings/profile" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">Store Profile</Link>
                <Link href="/owner/settings/security" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">Security Settings</Link>
              </div>
              <div className="p-1 border-t border-gray-100 dark:border-slate-700">
                <button className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </div>

        {/* Search Dropdown / Overlay */}
        {searchOpen && (
          <div className="absolute top-[calc(100%+8px)] left-0 right-0 mx-6 lg:mx-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-700 p-2 z-50 animate-in slide-in-from-top-2 fade-in-0 zoom-in-95">
            <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search products, customers, settings..." 
                className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-0 p-0"
              />
              <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-4 px-2 pb-2">
              <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Suggested Links</p>
              <div className="space-y-1">
                <Link onClick={() => setSearchOpen(false)} href="/owner/products" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Search className="w-3.5 h-3.5" /></span>
                  Search or add products
                </Link>
                <Link onClick={() => setSearchOpen(false)} href="/owner/customers" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Search className="w-3.5 h-3.5" /></span>
                  View customer database
                </Link>
                <Link onClick={() => setSearchOpen(false)} href="/owner/settings/customize" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
                  <span className="w-6 h-6 rounded-md bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center"><Search className="w-3.5 h-3.5" /></span>
                  Customize Dashboard Layout
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}