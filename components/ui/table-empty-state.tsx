'use client';

import React from 'react';
import { LucideIcon, Plus } from 'lucide-react';

export interface TableEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function TableEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: TableEmptyStateProps) {
  return (
    <div className={`p-12 sm:p-16 text-center flex flex-col items-center justify-center flex-1 w-full min-h-[360px] select-none ${className}`}>
      <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-inner ring-1 ring-slate-200/60 dark:ring-slate-700/50">
        <Icon className="w-10 h-10 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 font-medium max-w-md mb-8 text-sm leading-relaxed">
        {description}
      </p>
      <div className="flex items-center gap-3 flex-wrap justify-center">
        {actionLabel && onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {actionLabel}
          </button>
        )}
        {secondaryActionLabel && onSecondaryAction && (
          <button
            type="button"
            onClick={onSecondaryAction}
            className="inline-flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-700 dark:text-slate-200 rounded-xl font-bold transition-all cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
