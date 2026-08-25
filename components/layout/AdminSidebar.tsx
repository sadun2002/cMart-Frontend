'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Store, CreditCard, DollarSign, Palette,
  TrendingUp, BarChart2, MessageSquare, PanelLeftClose, Settings,
  ChevronDown, ChevronUp, DownloadCloud
} from 'lucide-react';
import { ADMIN_NAV } from '@/lib/constants';

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function AdminSidebar({ collapsed, onToggle, isMobileOpen, onMobileClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const collapseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onToggleRef = useRef(onToggle);
  const isHoveringRef = useRef(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    '/admin/stores': true
  });

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
    if (!collapsed) {
      onToggleRef.current();
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'LayoutDashboard': return LayoutDashboard;
      case 'Store': return Store;
      case 'CreditCard': return CreditCard;
      case 'DollarSign': return DollarSign;
      case 'Palette': return Palette;
      case 'TrendingUp': return TrendingUp;
      case 'BarChart2': return BarChart2;
      case 'MessageSquare': return MessageSquare;
      case 'DownloadCloud': return DownloadCloud;
      default: return Settings;
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
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
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
        {ADMIN_NAV.map((item) => {
          const Icon = getIcon(item.icon);
          const hasSubItems = 'subItems' in item && Array.isArray(item.subItems);
          
          // For a parent, isActive might mean the current path is inside it.
          const isActive = pathname === item.href || (hasSubItems && pathname.startsWith(item.href));
          const isOpen = openMenus[item.href];

          return (
            <div key={item.href} className="w-full">
              {hasSubItems ? (
                <button
                  onClick={() => {
                    setOpenMenus(prev => ({ ...prev, [item.href]: !prev[item.href] }));
                    if (collapsed) onToggle();
                  }}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center justify-between text-sm transition-colors duration-150 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/10'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    isOpen ? <ChevronUp className="w-4 h-4 opacity-70" /> : <ChevronDown className="w-4 h-4 opacity-70" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 text-sm transition-colors duration-150 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-medium bg-blue-50/50 dark:bg-blue-900/10'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                  } ${collapsed ? 'justify-center py-3' : 'py-3 pl-5 pr-3'}`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : ''}`} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              )}

              {hasSubItems && isOpen && !collapsed && (
                <div className="flex flex-col mt-1 mb-1 relative animate-in slide-in-from-top-2 duration-200">
                  <div className="absolute left-[29px] top-0 bottom-2 w-px bg-gray-200 dark:bg-slate-700" />
                  {item.subItems.map((subItem: any) => {
                    const isSubActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.href}
                        href={subItem.href}
                        className={`flex items-center pl-12 pr-4 py-2 text-sm transition-colors duration-150 relative ${
                          isSubActive
                            ? 'text-blue-600 dark:text-blue-400 font-medium'
                            : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-slate-300'
                        }`}
                      >
                        {isSubActive && (
                          <div className="absolute left-[29px] top-1/2 -translate-y-1/2 w-0.5 h-1/2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        )}
                        <span className="truncate">{subItem.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
