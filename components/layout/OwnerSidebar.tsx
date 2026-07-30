'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, ShoppingCart, Package, Tag, Warehouse, Truck,
  Receipt, Globe, Users, Clock, UserCheck, BarChart3, Globe2,
  CreditCard, Settings as SettingsIcon, ChevronDown, Store, User,
  Database, Bell, DollarSign, Printer, Lock, AlertTriangle,
  PanelLeftClose, PanelLeftOpen, SlidersHorizontal, Barcode,
} from 'lucide-react';

interface OwnerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/pos', label: 'POS', icon: ShoppingCart },
  { href: '/owner/products', label: 'Products', icon: Package },
  { href: '/owner/barcode-generator', label: 'Barcode Generator', icon: Barcode },
  { href: '/owner/categories', label: 'Categories', icon: Tag },
  { href: '/owner/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/owner/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/owner/sales', label: 'Sales', icon: Receipt },
  { href: '/owner/customers', label: 'Customers', icon: Users },
  { href: '/owner/employees', label: 'Employees', icon: UserCheck },
  { href: '/owner/attendance', label: 'Attendance', icon: Clock },
  { href: '/owner/reports/sales', label: 'Reports', icon: BarChart3 },
  { href: '/owner/online-orders', label: 'Online Orders', icon: Globe },
  { href: '/owner/online-store/dashboard', label: 'Online Store', icon: Globe2 },
  { href: '/owner/subscription/plan', label: 'Subscription', icon: CreditCard },
];

const settingsSubItems = [
  { href: '/owner/settings/profile', label: 'Store Profile', icon: Store },
  { href: '/owner/settings/personal', label: 'Personal Profile', icon: User },
  { href: '/owner/settings/backup', label: 'Data & Backup', icon: Database, badge: 'Auto' },
  { href: '/owner/settings/notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { href: '/owner/settings/tax', label: 'Tax & Currency', icon: DollarSign },
  { href: '/owner/settings/receipt', label: 'Receipt & Printer', icon: Printer },
  { href: '/owner/settings/language', label: 'Language & Region', icon: Globe },
  { href: '/owner/settings/security', label: 'Security', icon: Lock },
  { href: '/owner/settings/customize', label: 'Customize Dashboard', icon: SlidersHorizontal },
  { href: '/owner/settings/danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

export default function OwnerSidebar({ collapsed, onToggle }: OwnerSidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onToggleRef = useRef(onToggle);
  const isHoveringRef = useRef(false);

  const isSettingsActive = settingsSubItems.some((item) => pathname.startsWith(item.href));

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
  }, [isSettingsActive]);

  useEffect(() => {
    onToggleRef.current = onToggle;
  }, [onToggle]);

  const clearCollapseTimeout = () => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  };

  const startCollapseTimeout = () => {
    clearCollapseTimeout();
    collapseTimeoutRef.current = setTimeout(() => {
      onToggleRef.current();
    }, 5000);
  };

  useEffect(() => {
    if (!collapsed) {
      if (!isHoveringRef.current) {
        startCollapseTimeout();
      } else {
        clearCollapseTimeout();
      }
    } else {
      clearCollapseTimeout();
    }
    
    return () => {
      clearCollapseTimeout();
    };
  }, [collapsed]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      clearCollapseTimeout();
    };
  }, []);

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    if (collapsed) {
      hoverTimeoutRef.current = setTimeout(() => {
        onToggleRef.current();
      }, 2000);
    } else {
      clearCollapseTimeout();
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (!collapsed) {
      startCollapseTimeout();
    }
  };

  return (
    <aside 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`flex-shrink-0 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-30 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
        {!collapsed ? (
          <>
            <Link href="/owner/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-black text-base">c</span>
              </div>
              <div>
                <span className="text-gray-900 dark:text-white font-black text-2xl tracking-tight block leading-tight">cMart</span>
              </div>
            </Link>
            <button
              onClick={onToggle}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="mx-auto transition-transform hover:scale-105" aria-label="Expand sidebar">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-500 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-base">c</span>
            </div>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-0">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 text-sm transition-colors duration-150 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              } ${collapsed ? 'justify-center py-3' : 'py-2.5 pl-5 pr-3'}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Settings */}
        <div>
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            title={collapsed ? 'Settings' : undefined}
            className={`w-full flex items-center gap-3 text-sm transition-colors duration-150 ${
              isSettingsActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            } ${collapsed ? 'justify-center py-3' : 'py-2.5 pl-5 pr-3'}`}
          >
            <SettingsIcon className={`w-5 h-5 flex-shrink-0 ${isSettingsActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">Settings</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              settingsOpen && !collapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-5 border-l-2 border-gray-200 dark:border-slate-700 space-y-0">
              {settingsSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 text-sm py-2 pl-4 pr-3 transition-colors duration-150 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : item.danger
                          ? 'text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300'
                          : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.badge === '3'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}