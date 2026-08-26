"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, UserPlus, LogOut } from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SmartNavbar } from '@/components/ui/smart-navbar';
import { useAuthStore } from '@/lib/auth-store';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/themes', label: 'Themes' },
  { href: '/contact', label: 'Contact' },
  { href: '/download', label: 'Downloads' },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading, logout } = useAuthStore();

  const isLoggedIn = !!user && !isLoading;
  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.type === 'super_admin' || user.adminRole) return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') {
      return user.tenant?.active === false ? '/pending' : '/owner/dashboard';
    }
    return '/employee/dashboard';
  };

  return (
    <>
      <SmartNavbar>
        <nav className="border-b border-gray-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left Side: Mobile Menu + Logo */}
            <div className="flex items-center gap-2.5 z-50">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 -ml-1 text-gray-600 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              
              <Link href="/" className="flex items-center gap-2.5">
 <img src="/logo-small.png" alt="cMart Logo" className="hidden lg:flex w-8 h-8 object-contain" />
                <span className="text-xl font-black text-gray-900 dark:text-white transition-colors">{COMPANY_NAME}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 text-sm text-gray-600">
              {NAV_LINKS.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className="hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-3">
              {/* TODO: Remove this logout button after testing */}
              {isLoggedIn && (
                <button
                  onClick={() => logout()}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors bg-white/50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-800"
                  title="Logout (Testing only)"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              <ThemeToggle />
              <Link
                href={getDashboardUrl()}
                className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Dashboard
              </Link>
            </div>

            {/* Mobile Actions (Right Side) */}
            <div className="lg:hidden flex items-center gap-3 z-50">
              {/* TODO: Remove this logout button after testing */}
              {isLoggedIn && (
                <button
                  onClick={() => logout()}
                  className="p-2 text-gray-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                  title="Logout (Testing only)"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              )}
              <ThemeToggle />
              <Link 
                href={getDashboardUrl()}
                className="p-2 text-blue-600 dark:text-blue-400"
              >
                <LayoutDashboard className="w-6 h-6" />
              </Link>
            </div>
          </div>
          </div>
        </nav>
      </SmartNavbar>

      {/* Mobile Menu Drawer Overlay */}
      <div 
        className={`lg:hidden fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu Drawer Panel */}
      <div className={`lg:hidden fixed inset-y-0 left-0 w-[80vw] max-w-sm bg-white dark:bg-slate-950 z-[101] transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <span className="font-bold text-lg text-gray-900 dark:text-white">Menu</span>
          <button 
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200 bg-gray-100 dark:bg-slate-800 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
            <Link
              href={getDashboardUrl()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
              onClick={() => setMobileMenuOpen(false)}
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Link>
          </div>

          <div className="space-y-6">
            {NAV_LINKS.map((item) => (
              <div key={item.href}>
                <Link 
                  href={item.href}
                  className="block text-gray-700 dark:text-slate-300 font-bold text-lg hover:text-blue-600 dark:hover:text-blue-400"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
