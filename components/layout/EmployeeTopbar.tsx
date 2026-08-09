'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { BranchSelector } from '@/components/ui/branch-selector';
import { SyncStatus } from '@/components/ui/sync-status';
import { NetworkStatus } from '@/components/ui/network-status';

const pageTitles: Record<string, string> = {
  '/employee/dashboard': 'Dashboard',
  '/employee/pos': 'POS',
  '/employee/products': 'Products',
  '/employee/categories': 'Categories',
  '/employee/inventory': 'Inventory',
  '/employee/suppliers': 'Suppliers',
  '/employee/sales': 'Sales',
  '/employee/customers': 'Customers',
  '/employee/employees': 'Employees',
  '/employee/attendance': 'Attendance',
  '/employee/reports': 'Reports',
  '/employee/online-orders': 'Online Orders',
  '/employee/online-store/dashboard': 'Online Store',
  '/employee/subscription/plan': 'Subscription',
  '/employee/barcode-generator': 'Barcode Generator',
};

export default function EmployeeTopbar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void } = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  
  // Auto-hide Topbar logic
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoHidePage = pathname.includes('/expenses') || pathname === '/employee/pos' || pathname === '/employee/products' || pathname === '/employee/categories' || pathname === '/employee/inventory' || pathname === '/employee/suppliers' || pathname === '/employee/sales' || pathname === '/employee/customers' || pathname === '/employee/employees' || pathname === '/employee/attendance' || pathname === '/employee/barcode-generator' || pathname === '/employee/employees/roles' || pathname === '/employee/employees/leaves' || pathname === '/employee/employees/payrolls' || pathname === '/employee/online-orders' || pathname === '/employee/online-store/customers' || pathname === '/employee/online-store/themes' || pathname === '/employee/online-store/pages' || pathname === '/employee/online-store/banners' || pathname === '/employee/online-store/domain' || pathname === '/employee/online-store/seo' || pathname === '/employee/online-store/settings' || pathname.startsWith('/employee/reports');

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
          <div className="flex items-center">
            <h1 className="text-xl font-black text-gray-900 dark:text-white truncate">{title}</h1>
            <BranchSelector />
          </div>
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            <Link href="/employee/dashboard" className="hover:text-blue-600 transition-colors">Home</Link>
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
        <div className="flex items-center gap-4">
          <SyncStatus />
          <NetworkStatus />
          
          {/* Search */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative group ml-1">
            <button className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center rounded-t-2xl shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] font-black tracking-wider bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase">5 New</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
                {[
                  { id: 1, title: 'New Leave Request', desc: 'Kamal Perera requested Annual Leave.', time: '5 mins ago', color: 'blue' },
                  { id: 2, title: 'Low Stock Alert', desc: 'Panadol 500mg is below reorder level.', time: '1 hour ago', color: 'amber' },
                  { id: 3, title: 'Shift Started', desc: 'Morning shift has successfully clocked in.', time: '3 hours ago', color: 'emerald' },
                  { id: 4, title: 'New Online Order', desc: 'Order #ORD-8994 awaits processing.', time: '5 hours ago', color: 'purple' },
                  { id: 5, title: 'System Update', desc: 'POS system will undergo maintenance tonight.', time: '1 day ago', color: 'slate' },
                ].map(notif => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer flex gap-3 items-start group/item">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notif.color === 'blue' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' :
                      notif.color === 'amber' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' :
                      notif.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      notif.color === 'purple' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">{notif.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{notif.desc}</p>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl shrink-0">
                <Link href="/employee/settings/notifications" className="block w-full py-2.5 text-center text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors">
                  View All Notifications
                </Link>
              </div>
            </div>
          </div>

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
                <Link href="/employee/settings/personal" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">Personal Profile</Link>
                <Link href="/employee/settings/profile" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">Store Profile</Link>
                <Link href="/employee/settings/security" className="block px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">Security Settings</Link>
              </div>
              <div className="p-1 border-t border-gray-100 dark:border-slate-700">
                <button onClick={() => { logout(); window.location.href = '/login'; }} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Sign Out</button>
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
                <Link onClick={() => setSearchOpen(false)} href="/employee/products" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                  <span className="w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center"><Search className="w-3.5 h-3.5" /></span>
                  Search or add products
                </Link>
                <Link onClick={() => setSearchOpen(false)} href="/employee/customers" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors">
                  <span className="w-6 h-6 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Search className="w-3.5 h-3.5" /></span>
                  View customer database
                </Link>
                <Link onClick={() => setSearchOpen(false)} href="/employee/settings/customize" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors">
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
