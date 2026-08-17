'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuthStore } from '@/lib/auth-store';
import Link from 'next/link';
import { ADMIN_NAV } from '@/lib/constants';
import { SyncStatus } from '@/components/ui/sync-status';
import { NetworkStatus } from '@/components/ui/network-status';

export default function AdminTopbar({ collapsed, onToggle }: { collapsed?: boolean; onToggle?: () => void } = {}) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  
  // Auto-hide Topbar logic
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAutoHidePage = pathname === '/admin/stores' || pathname === '/admin/stores/pending';

  const startHideTimer = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isAutoHidePage && isVisible) {
      hideTimeoutRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    }
  };

  const clearHideTimer = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
  };

  useEffect(() => {
    if (!isAutoHidePage) {
      setIsVisible(true);
      clearHideTimer();
      return;
    }

    if (isVisible) {
      startHideTimer();
    }

    return () => clearHideTimer();
  }, [isAutoHidePage, isVisible]);
  
  const currentPage = ADMIN_NAV.find(item => pathname.startsWith(item.href));
  const title = currentPage?.label || 'Admin';

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
        onMouseEnter={clearHideTimer}
        onMouseLeave={startHideTimer}
        onMouseMove={clearHideTimer}
        className={`z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 transition-all duration-500 ease-in-out flex-shrink-0 ${
        isAutoHidePage && !isVisible 
          ? 'h-0 -translate-y-full opacity-0 overflow-hidden absolute w-full' 
          : 'h-16 translate-y-0 opacity-100 relative'
      }`}>
      <div className="flex items-center justify-between px-6 lg:px-8 h-16 relative">
        {/* Left: Title + Breadcrumb */}
        <div className="min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white truncate">{title}</h1>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            <Link href="/admin/dashboard" className="hover:text-indigo-600 transition-colors">Admin Home</Link>
            {breadcrumbs.map((crumb) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                <span>/</span>
                <span className={crumb.isLast ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
                  {crumb.label}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <NetworkStatus />
          
          {/* Search */}
          <button
            className="p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative group ml-1">
            <button className="relative p-2 text-slate-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20" aria-label="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </button>
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center rounded-t-2xl shrink-0">
                <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
                <span className="text-[10px] font-black tracking-wider bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 px-2 py-0.5 rounded-full uppercase">3 New</span>
              </div>
              <div className="max-h-[320px] overflow-y-auto no-scrollbar p-2 flex flex-col gap-1">
                {[
                  { id: 1, title: 'New Store Signup', desc: 'TechZone LK has registered.', time: '5 mins ago', color: 'indigo' },
                  { id: 2, title: 'Subscription Payment', desc: 'FreshMart paid LKR 3000.', time: '1 hour ago', color: 'emerald' },
                  { id: 3, title: 'System Alert', desc: 'Database backup completed.', time: '3 hours ago', color: 'blue' },
                ].map(notif => (
                  <div key={notif.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-xl transition-colors cursor-pointer flex gap-3 items-start group/item">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      notif.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' :
                      notif.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                      'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                    }`}>
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight group-hover/item:text-indigo-600 dark:group-hover/item:text-indigo-400 transition-colors">{notif.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">{notif.desc}</p>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-b-2xl shrink-0">
                <Link href="/admin/notifications" className="block w-full py-2.5 text-center text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-colors">
                  View All Notifications
                </Link>
              </div>
            </div>
          </div>

          <ThemeToggle />

          {/* User Avatar Dropdown */}
          <div className="relative group ml-1">
            <button className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>
            <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="p-3 border-b border-slate-100 dark:border-slate-700">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name || 'Super Admin'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.email || 'admin@cmart.lk'}</p>
              </div>
              <div className="p-1 border-t border-slate-100 dark:border-slate-700">
                <button onClick={() => { logout(); window.location.href = '/login'; }} className="w-full text-left px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">Sign Out</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
    </>
  );
}
