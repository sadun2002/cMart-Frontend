import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: string | number;
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
    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgClass} ${iconColorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 truncate">{title}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white truncate">{value}</p>
      </div>
    </div>
  );
}
