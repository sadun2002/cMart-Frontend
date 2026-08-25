import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Receipt, Package, PieChart, Menu, Settings } from 'lucide-react';

interface MobileBottomNavProps {
  basePath: string; // '/owner' or '/employee'
  onMenuClick: () => void;
}

export function MobileBottomNav({ basePath, onMenuClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  const navItems = [
    { href: `${basePath}/dashboard`, label: 'Home', icon: LayoutDashboard },
    { href: `${basePath}/sales`, label: 'Sales', icon: Receipt },
    { href: `${basePath}/inventory`, label: 'Inventory', icon: Package },
    { href: `${basePath}/reports/analytics`, label: 'Reports', icon: PieChart },
    { href: `${basePath}/settings/profile`, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-around z-50 px-2 pb-safe">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== `${basePath}/dashboard` && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
              isActive 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'fill-blue-600/20' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
