import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  iconColorClass?: string;
  iconBgClass?: string;
}

export function KpiCard({
  title,
  value,
  icon: Icon,
  iconColorClass = 'text-blue-600',
  iconBgClass = 'bg-blue-50 dark:bg-blue-500/10',
}: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl md:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-3 md:gap-4">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgClass} ${iconColorClass}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] sm:text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-sm sm:text-base md:text-xl font-black text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
