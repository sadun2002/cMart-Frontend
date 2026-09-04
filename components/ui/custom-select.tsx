'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Lock } from 'lucide-react';

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  label,
  disabled,
  searchable = true,
  actionButton,
  locked,
  onLockedClick,
  id
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: {label: string, value: string}[]; 
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
  actionButton?: { label: string; onClick: () => void };
  locked?: boolean;
  onLockedClick?: () => void;
  id?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(searchQuery.toLowerCase()));
  const selectedOption = options.find(o => o.value === value);

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button" 
        id={id}
        onClick={() => {
          if (disabled) return;
          if (locked) {
            if (onLockedClick) onLockedClick();
            return;
          }
          if (options.length === 0 && actionButton) {
            actionButton.onClick();
            return;
          }
          setIsOpen(!isOpen);
        }} 
        disabled={disabled}
        className={`w-full flex justify-between items-center px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${locked ? 'bg-slate-100 dark:bg-slate-800/80 cursor-pointer' : ''}`}
      >
        {options.length === 0 && actionButton && !locked ? (
          <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
            <span className="text-lg leading-none">+</span> {actionButton.label}
          </span>
        ) : (
          <>
            {selectedOption?.label || label}
            {locked ? (
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            ) : (
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </>
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden py-1 max-h-60 flex flex-col"
              >
                
              {searchable && options.length > 0 && (
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 sticky top-0 bg-white dark:bg-slate-800 z-10 shrink-0">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                        autoFocus={true}
                      />
                    </div>
                  </div>
                )}
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
                  ) : (
                    filteredOptions.map(opt => (
                      <button 
                        key={opt.value} 
                        type="button" 
                        onClick={() => { onChange(opt.value); setIsOpen(false); setSearchQuery(''); }} 
                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${value === opt.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                      >
                        {opt.label}
                      </button>
                    ))
                  )}
                </div>
              {actionButton && options.length > 0 && (
                <div className="px-2 pt-1 pb-1 mt-1 border-t border-slate-100 dark:border-slate-500/50">
                  <button 
                    type="button"
                    onClick={() => { actionButton.onClick(); setIsOpen(false); }}
                    className="w-full text-left px-2 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span className="text-lg leading-none">+</span> {actionButton.label}
                  </button>
                </div>
              )}
            
              </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
