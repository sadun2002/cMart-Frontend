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
      className="max-w-sm"
      footerContent={
        <div className="flex gap-3">
          <button 
            onClick={onClear}
            className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors"
          >
            Clear
          </button>
          <button 
            onClick={onApply}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-600/20 transition-all"
          >
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
