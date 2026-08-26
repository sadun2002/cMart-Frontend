'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';
import { UpgradeModal } from '@/components/ui/upgrade-modal';
import {
  LayoutDashboard, ShoppingCart, Package, Tag, Warehouse, Truck,
  Receipt, Globe, Users, Clock, UserCheck, BarChart3, Globe2,
  CreditCard, Settings as SettingsIcon, ChevronDown, Store, User,
  Database, Bell, DollarSign, Printer, Lock, AlertTriangle,
  PanelLeftClose, PanelLeftOpen, SlidersHorizontal, Barcode, Shield, CalendarDays, Banknote,
  Palette, FileText, Layout, Search, Image, PieChart, Building2
} from 'lucide-react';

interface OwnerSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const mainNavItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/pos', label: 'POS', icon: ShoppingCart, hideOnMobile: true },
  { href: '/owner/products', label: 'Products', icon: Package },
  { href: '/owner/barcode-generator', label: 'Barcode Generator', icon: Barcode, hideOnMobile: true },
  { href: '/owner/categories', label: 'Categories', icon: Tag },
  { href: '/owner/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/owner/suppliers', label: 'Suppliers', icon: Truck, tier: 'PRO' },
  { href: '/owner/sales', label: 'Sales', icon: Receipt },
  { href: '/owner/expenses', label: 'Expenses', icon: Banknote },
  { href: '/owner/customers', label: 'Customers', icon: Users, tier: 'PRO' },
  { href: '/owner/attendance', label: 'Attendance', icon: Clock, tier: 'PRO' },
  { href: '/owner/branches', label: 'Branches', icon: Building2, tier: 'PRO' },
  { href: '/owner/subscription', label: 'Subscription', icon: CreditCard },
];

const reportsSubItems = [
  { href: '/owner/reports/sales', label: 'Sales', icon: Receipt },
  { href: '/owner/reports/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/owner/reports/purchase', label: 'Purchase', icon: ShoppingCart },
  { href: '/owner/reports/customers', label: 'Customers', icon: Users, tier: 'PRO' },
  { href: '/owner/reports/suppliers', label: 'Suppliers', icon: Truck, tier: 'PRO' },
  { href: '/owner/reports/employees', label: 'Employees', icon: UserCheck, tier: 'PRO' },
  { href: '/owner/reports/attendance', label: 'Attendance', icon: Clock, tier: 'PRO' },
  { href: '/owner/reports/online-store', label: 'Online Store', icon: Globe, tier: 'PRO' },
  { href: '/owner/reports/financial', label: 'Financial', icon: Banknote },
  { href: '/owner/reports/analytics', label: 'Business Analytics', icon: PieChart, tier: 'PRO' },
];


const onlineStoreSubItems = [
  { href: '/owner/online-orders', label: 'Online Orders', icon: ShoppingCart, tier: 'PRO' },
  { href: '/owner/online-store/customers', label: 'Customers', icon: Users, tier: 'PRO' },
  { href: '/owner/online-store/themes', label: 'Themes', icon: Palette, tier: 'PRO' },
  { href: '/owner/online-store/pages', label: 'Pages', icon: FileText, tier: 'PRO' },
  { href: '/owner/online-store/banners', label: 'Banners', icon: Image, tier: 'PRO' },
  { href: '/owner/online-store/domain', label: 'Domain', icon: Globe2, tier: 'PRO' },
  { href: '/owner/online-store/seo', label: 'SEO', icon: Search, tier: 'PRO' },
  { href: '/owner/online-store/settings', label: 'Store Setting', icon: SettingsIcon, tier: 'PRO' },
];

const employeeSubItems = [
  { href: '/owner/employees', label: 'Employee Management', icon: Users, tier: 'PRO' },
  { href: '/owner/employees/leaves', label: 'Leave Management', icon: CalendarDays, tier: 'PRO' },
  { href: '/owner/employees/payrolls', label: 'Payrolls', icon: Banknote, tier: 'PRO' },
  { href: '/owner/employees/roles', label: 'Roles & Permissions', icon: Shield, tier: 'PRO' },
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

export default function OwnerSidebar({ collapsed: desktopCollapsed, onToggle, isMobileOpen, onMobileClose }: OwnerSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const userPlan = user?.tenant?.plan || 'FREE';
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeFeature, setUpgradeFeature] = useState('');
  const [employeesOpen, setEmployeesOpen] = useState(false);
  const [onlineStoreOpen, setOnlineStoreOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const onToggleRef = useRef(onToggle);
  const isHoveringRef = useRef(false);

  const collapsed = desktopCollapsed && !isMobileOpen;

  const handleNavigation = (e: React.MouseEvent, item: any) => {
    if (item.tier === 'PRO' && userPlan !== 'PRO' && userPlan !== 'ENTERPRISE') {
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

  const handleMouseEnter = () => {
    isHoveringRef.current = true;
    if (collapsed) {
      onToggleRef.current();
    }
  };

  const handleMouseLeave = () => {
    isHoveringRef.current = false;
    if (!collapsed && !isMobileOpen) {
      onToggleRef.current();
    }
  };

  return (
    <aside 
      onMouseEnter={isMobileOpen ? undefined : handleMouseEnter}
      onMouseLeave={isMobileOpen ? undefined : handleMouseLeave}
      className={`flex-shrink-0 h-screen flex flex-col bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-50 ${collapsed ? 'w-[68px]' : 'w-[260px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
        {!collapsed ? (
          <>
            <Link href="/owner/dashboard" className="flex items-center gap-2.5">
              <img src="/logo-small.png" alt="cMart Logo" className="w-8 h-8 object-contain rounded-[10px] shadow-sm" />
              <div className="flex items-baseline gap-1">
                <span className="text-gray-900 dark:text-white font-black text-2xl tracking-tight block leading-tight">cMart</span>
              </div>
            </Link>
            <button
              onClick={() => {
                if (isMobileOpen && onMobileClose) {
                  onMobileClose();
                } else {
                  onToggle();
                }
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors flex-shrink-0"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button onClick={onToggle} className="mx-auto transition-transform hover:scale-105" aria-label="Expand sidebar">
              <img src="/logo-small.png" alt="cMart Logo" className="w-8 h-8 object-contain rounded-[10px] shadow-sm" />
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
              className={`${(item as any).hideOnMobile ? 'hidden lg:flex' : 'flex'} items-center gap-3 text-sm transition-colors duration-150 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
              } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
            >
              <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
              {!collapsed && item.tier === 'PRO' && (userPlan === 'FREE' || userPlan === 'STARTUP') && <Lock className="w-4 h-4 text-slate-400 ml-auto" />}
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
              if (userPlan === 'FREE' || userPlan === 'STARTUP') {
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
                 {(userPlan === 'FREE' || userPlan === 'STARTUP') ? (
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
              if (userPlan === 'FREE' || userPlan === 'STARTUP') {
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
                 {(userPlan === 'FREE' || userPlan === 'STARTUP') ? (
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
                const isActive = item.href === '/owner/employees'
                  ? pathname === '/owner/employees'
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