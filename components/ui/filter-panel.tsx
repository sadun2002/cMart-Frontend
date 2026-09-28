import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';
import { MainRightPanel } from './right-panel';

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onClear: () => void;
  onApply: () => void;
  children: React.ReactNode;
}

export function FilterPanel({
  isOpen,
  onClose,
  title,
  onClear,
  onApply,
  children
}: FilterPanelProps) {
  return (
    <MainRightPanel
      isOpen={isOpen}
      onClose={onClose}
      requireConfirmOnClose={false}
      title={title}
      subtitle="Filter and narrow down records"
      icon={Filter}
      className="max-w-md"
      footerContent={
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={onClear}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Clear
          </button>
          <button 
            type="button"
            onClick={onApply}
            className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            <Filter className="w-5 h-5" />
            Apply Filters
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {children}
      </div>
    </MainRightPanel>
  );
}
