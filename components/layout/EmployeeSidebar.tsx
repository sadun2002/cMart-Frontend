'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CURRENT_TIER } from '@/lib/constants';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import {
  LayoutDashboard, ShoppingCart, Package, Tag, Warehouse, Truck,
  Receipt, Globe, Users, Clock, UserCheck, BarChart3, Globe2,
  CreditCard, Settings as SettingsIcon, ChevronDown, Store, User,
  Database, Bell, DollarSign, Printer, Lock, AlertTriangle,
  PanelLeftClose, PanelLeftOpen, SlidersHorizontal, Barcode, Shield, CalendarDays, Banknote,
  Palette, FileText, Layout, Search, Image, PieChart
} from 'lucide-react';

interface EmployeeSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const mainNavItems = [
  { href: '/employee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/employee/pos', label: 'POS', icon: ShoppingCart },
  { href: '/employee/products', label: 'Products', icon: Package },
  { href: '/employee/barcode-generator', label: 'Barcode Generator', icon: Barcode },
  { href: '/employee/categories', label: 'Categories', icon: Tag },
  { href: '/employee/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/employee/suppliers', label: 'Suppliers', icon: Truck, tier: 'PRO' },
  { href: '/employee/sales', label: 'Sales', icon: Receipt },
  { href: '/employee/expenses', label: 'Expenses', icon: Banknote, tier: 'PRO' },
  { href: '/employee/customers', label: 'Customers', icon: Users, tier: 'PRO' },
  { href: '/employee/attendance', label: 'Attendance', icon: Clock, tier: 'PRO' },
  { href: '/employee/subscription', label: 'Subscription', icon: CreditCard },
];

const reportsSubItems = [
  { href: '/employee/reports/sales', label: 'Sales', icon: Receipt },
  { href: '/employee/reports/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/employee/reports/purchase', label: 'Purchase', icon: ShoppingCart },
  { href: '/employee/reports/customers', label: 'Customers', icon: Users, tier: 'PRO' },
  { href: '/employee/reports/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/employee/reports/employees', label: 'Employees', icon: UserCheck, tier: 'PRO' },
  { href: '/employee/reports/attendance', label: 'Attendance', icon: Clock, tier: 'PRO' },
  { href: '/employee/reports/online-store', label: 'Online Store', icon: Globe, tier: 'PRO' },
  { href: '/employee/reports/financial', label: 'Financial', icon: Banknote, tier: 'PRO' },
  { href: '/employee/reports/analytics', label: 'Business Analytics', icon: PieChart, tier: 'PRO' },
];


const onlineStoreSubItems = [
  { href: '/employee/online-orders', label: 'Online Orders', icon: ShoppingCart, tier: 'PRO' },
  { href: '/employee/online-store/customers', label: 'Customers', icon: Users, tier: 'PRO' },
  { href: '/employee/online-store/themes', label: 'Themes', icon: Palette, tier: 'PRO' },
  { href: '/employee/online-store/pages', label: 'Pages', icon: FileText, tier: 'PRO' },
  { href: '/employee/online-store/banners', label: 'Banners', icon: Image, tier: 'PRO' },
  { href: '/employee/online-store/domain', label: 'Domain', icon: Globe2, tier: 'PRO' },
  { href: '/employee/online-store/seo', label: 'SEO', icon: Search, tier: 'PRO' },
  { href: '/employee/online-store/settings', label: 'Store Setting', icon: SettingsIcon, tier: 'PRO' },
];

const employeeSubItems = [
  { href: '/employee/employees', label: 'Employee Management', icon: Users, tier: 'PRO' },
  { href: '/employee/employees/leaves', label: 'Leave Management', icon: CalendarDays, tier: 'PRO' },
  { href: '/employee/employees/payrolls', label: 'Payrolls', icon: Banknote, tier: 'PRO' },
  { href: '/employee/employees/roles', label: 'Roles & Permissions', icon: Shield, tier: 'PRO' },
];

const settingsSubItems = [
  { href: '/employee/settings/profile', label: 'Store Profile', icon: Store },
  { href: '/employee/settings/personal', label: 'Personal Profile', icon: User },
  { href: '/employee/settings/backup', label: 'Data & Backup', icon: Database, badge: 'Auto' },
  { href: '/employee/settings/notifications', label: 'Notifications', icon: Bell, badge: '3' },
  { href: '/employee/settings/tax', label: 'Tax & Currency', icon: DollarSign },
  { href: '/employee/settings/receipt', label: 'Receipt & Printer', icon: Printer },
  { href: '/employee/settings/language', label: 'Language & Region', icon: Globe },
  { href: '/employee/settings/security', label: 'Security', icon: Lock },
  { href: '/employee/settings/customize', label: 'Customize Dashboard', icon: SlidersHorizontal },
  { href: '/employee/settings/danger', label: 'Danger Zone', icon: AlertTriangle, danger: true },
];

export default function EmployeeSidebar({ collapsed, onToggle }: EmployeeSidebarProps) {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [onlineStoreOpen, setOnlineStoreOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onToggleRef = useRef(onToggle);
  const isHoveringRef = useRef(false);

  const handleNavigation = (e: React.MouseEvent, item: any) => {
    if (item.tier === 'PRO' && CURRENT_TIER !== 'PRO' && CURRENT_TIER !== 'ENTERPRISE') {
      e.preventDefault();
      setUpgradeFeature(item.label);
      setUpgradeModalOpen(true);
    }
  };

  const isSettingsActive = settingsSubItems.some((item) => pathname.startsWith(item.href));
  const isEmployeesActive = employeeSubItems.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  const isOnlineStoreActive = onlineStoreSubItems.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  const isReportsActive = reportsSubItems.some((item) => pathname === item.href || pathname.startsWith(item.href + '/'));

  useEffect(() => {
    if (isSettingsActive) setSettingsOpen(true);
    if (isEmployeesActive) setEmployeesOpen(true);
    if (isOnlineStoreActive) setOnlineStoreOpen(true);
    if (isReportsActive) setReportsOpen(true);
  }, [isSettingsActive, isEmployeesActive, isOnlineStoreActive, isReportsActive]);

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
      className={`flex-shrink-0 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-50 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
        {!collapsed ? (
          <>
            <Link href="/employee/dashboard" className="flex items-center gap-2.5">
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
        {mainNavItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavigation(e, item)}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 text-sm transition-colors duration-150 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.tier === 'PRO' && CURRENT_TIER === 'FREE' && <Lock className="w-3 h-3 text-slate-400 ml-auto" />}
            </Link>
          );
        })}

        {/* Reports */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggle();
                setReportsOpen(true);
              } else {
                setReportsOpen(!reportsOpen);
              }
            }}
            title={collapsed ? 'Reports' : undefined}
            className={`w-full flex items-center gap-3 text-sm transition-colors duration-150 ${
              isReportsActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
          >
            <BarChart3 className={`w-5 h-5 flex-shrink-0 ${isReportsActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">Reports</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${reportsOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              reportsOpen && !collapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-5 border-l-2 border-gray-200 dark:border-slate-700 space-y-0">
              {reportsSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavigation(e, item)}
                    className={`flex items-center gap-3 text-sm py-2 pl-4 pr-3 transition-colors duration-150 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Online Store */}
        <div>
          <button
            onClick={(e) => {
              if (CURRENT_TIER === 'FREE') {
                e.preventDefault();
                setUpgradeFeature('Online Store');
                setUpgradeModalOpen(true);
                return;
              }
              if (collapsed) {
                onToggle();
                setOnlineStoreOpen(true);
              } else {
                setOnlineStoreOpen(!onlineStoreOpen);
              }
            }}
            title={collapsed ? 'Online Store' : undefined}
            className={`w-full flex items-center gap-3 text-sm transition-colors duration-150 ${
              isOnlineStoreActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
          >
            <Globe2 className={`w-5 h-5 flex-shrink-0 ${isOnlineStoreActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">Online Store</span>
                {CURRENT_TIER === 'FREE' ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${onlineStoreOpen ? 'rotate-180' : ''}`} />
                )}
              </>
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              onlineStoreOpen && !collapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-5 border-l-2 border-gray-200 dark:border-slate-700 space-y-0">
              {onlineStoreSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavigation(e, item)}
                    className={`flex items-center gap-3 text-sm py-2 pl-4 pr-3 transition-colors duration-150 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Employees */}
        <div>
          <button
            onClick={(e) => {
              if (CURRENT_TIER === 'FREE') {
                e.preventDefault();
                setUpgradeFeature('Employees');
                setUpgradeModalOpen(true);
                return;
              }
              if (collapsed) {
                onToggle();
                setEmployeesOpen(true);
              } else {
                setEmployeesOpen(!employeesOpen);
              }
            }}
            title={collapsed ? 'Employees' : undefined}
            className={`w-full flex items-center gap-3 text-sm transition-colors duration-150 ${
              isEmployeesActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
          >
            <UserCheck className={`w-5 h-5 flex-shrink-0 ${isEmployeesActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
            {!collapsed && (
              <>
                <span className="flex-1 text-left truncate">Employees</span>
                {CURRENT_TIER === 'FREE' ? (
                  <Lock className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${employeesOpen ? 'rotate-180' : ''}`} />
                )}
              </>
            )}
          </button>

          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              employeesOpen && !collapsed ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="ml-5 border-l-2 border-gray-200 dark:border-slate-700 space-y-0">
              {employeeSubItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/employee/employees'
                  ? pathname === '/employee/employees'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavigation(e, item)}
                    className={`flex items-center gap-3 text-sm py-2 pl-4 pr-3 transition-colors duration-150 ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400 font-medium'
                        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Settings */}
        <div>
          <button
            onClick={() => {
              if (collapsed) {
                onToggle();
                setSettingsOpen(true);
              } else {
                setSettingsOpen(!settingsOpen);
              }
            }}
            title={collapsed ? 'Settings' : undefined}
            className={`w-full flex items-center gap-3 text-sm transition-colors duration-150 ${
              isSettingsActive
                ? 'text-blue-600 dark:text-blue-400 font-medium'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
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
              onClick={(e) => handleNavigation(e, item)}
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
      <UpgradeModal 
        isOpen={upgradeModalOpen} 
        onClose={() => setUpgradeModalOpen(false)} 
        featureName={upgradeFeature} 
        requiredTier="Pro" 
      />
    </aside>
  );
}
