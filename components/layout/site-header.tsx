"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, LayoutDashboard, UserPlus } from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { SmartNavbar } from '@/components/ui/smart-navbar';
import { useAuthStore } from '@/lib/auth-store';

const NAV_LINKS = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/portfolio', label: 'Themes' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuthStore();

  const isLoggedIn = !!user && !isLoading;
  const getDashboardUrl = () => {
    if (!user) return '/login';
    if (user.type === 'super_admin' || user.adminRole) return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') return '/owner/dashboard';
    return '/employee/dashboard';
  };
  const getDashboardLabel = () => {
    if (!user) return 'Go to Dashboard';
    if (user.type === 'super_admin' || user.adminRole) return 'Admin Dashboard';
    if (user.role === 'STORE_OWNER') return 'Owner Dashboard';
    return 'Employee Dashboard';
  };

  return (
    <SmartNavbar>
      <nav className="border-b border-gray-100 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 z-50">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-base">c</span>
              </div>
              <span className="text-xl font-black text-gray-900 dark:text-white transition-colors">{COMPANY_NAME}</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
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
            <div className="hidden md:flex items-center gap-3">
              <ThemeToggle />
              {isLoggedIn ? (
                <Link
                  href={getDashboardUrl()}
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {getDashboardLabel()}
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors shadow-sm flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Start Free Trial
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-3 z-50">
              <ThemeToggle />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 dark:text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <div className={`md:hidden fixed inset-0 top-16 bg-white dark:bg-slate-950 transition-all duration-300 overflow-y-auto ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div className="px-6 py-8 space-y-8">
              {NAV_LINKS.map((item) => (
                <div key={item.href}>
                  <Link 
                    href={item.href}
                    className="block text-gray-900 dark:text-white font-bold text-lg hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </div>
              ))}
              <div className="pt-8 border-t border-gray-100 dark:border-slate-800 space-y-3">
                {isLoggedIn ? (
                  <Link
                    href={getDashboardUrl()}
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {getDashboardLabel()}
                  </Link>
                ) : (
                  <Link
                    href="/register"
                    className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="w-5 h-5" />
                    Start Free Trial
                  </Link>
                )}
              </div>
            </div>
          </div>

        </div>
      </nav>
    </SmartNavbar>
  );
}
