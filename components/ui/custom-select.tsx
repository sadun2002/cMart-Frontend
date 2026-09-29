'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Search, Lock, Trash2 } from 'lucide-react';

export interface CustomSelectOption {
  label: string; 
  value: string;
  disabled?: boolean;
  locked?: boolean;
  onLockedClick?: () => void;
  onDelete?: () => void;
  icon?: React.ElementType;
}

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
  id,
  icon: Icon,
  buttonClassName,
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: CustomSelectOption[]; 
  label?: string;
  disabled?: boolean;
  searchable?: boolean;
  actionButton?: { label: string; onClick: () => void };
  locked?: boolean;
  onLockedClick?: () => void;
  id?: string;
  icon?: React.ElementType | React.ReactNode;
  buttonClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate position whenever open state changes or window resizes/scrolls
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const updatePosition = () => {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const dropdownHeight = 240; // max-h-60 = 240px
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Open upward if not enough space below
      const openUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
        ...(openUpward
          ? { bottom: viewportHeight - rect.top + 4 }
          : { top: rect.bottom + 4 }),
      });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
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

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dropdownRef}
          style={dropdownStyle}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-60"
        >
          {searchable && options.length > 5 && (
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/50 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
          )}
          <div className="overflow-y-auto flex-1 custom-scrollbar py-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No results found</div>
            ) : (
              filteredOptions.map(opt => {
                const isOptLocked = opt.locked;
                const isOptDisabled = opt.disabled;

                return (
                  <div
                    key={opt.value}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (isOptLocked) {
                        if (opt.onLockedClick) {
                          opt.onLockedClick();
                        }
                        return;
                      }
                      if (isOptDisabled) return;
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isOptDisabled && !isOptLocked) {
                          onChange(opt.value);
                          setIsOpen(false);
                          setSearchQuery('');
                        }
                      }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors text-left select-none cursor-pointer ${
                      isOptLocked
                        ? 'text-slate-400 dark:text-slate-500 hover:bg-slate-100/70 dark:hover:bg-slate-700/40 group'
                        : isOptDisabled
                        ? 'opacity-40 cursor-not-allowed text-slate-400'
                        : value === opt.value
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 mr-2">
                      {opt.icon && (
                        <opt.icon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                      )}
                      <span className={`truncate ${isOptLocked ? 'group-hover:text-slate-600 dark:group-hover:text-slate-300' : ''}`}>
                        {opt.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isOptLocked && (
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      {opt.onDelete && (
                        <button
                          type="button"
                          title="Delete option"
                          onClick={(e) => {
                            e.stopPropagation();
                            opt.onDelete?.();
                          }}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors p-0.5"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {actionButton && options.length > 0 && (
            <div className="px-2 pt-1 pb-1 border-t border-slate-100 dark:border-slate-500/50 shrink-0">
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
      )}
    </AnimatePresence>
  );

  const renderSelectIcon = (iconItem: any) => {
    if (!iconItem) return null;
    if (React.isValidElement(iconItem)) {
      return <span className="text-slate-400 dark:text-slate-500 shrink-0">{iconItem}</span>;
    }
    const IconComp = iconItem as React.ElementType;
    return <IconComp className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />;
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
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
        className={buttonClassName || `w-full flex justify-between items-center px-4 h-11 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl font-medium text-sm text-slate-900 dark:text-white transition-all outline-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${locked ? 'bg-slate-100 dark:bg-slate-800/80 cursor-pointer' : ''}`}
      >
        {options.length === 0 && actionButton && !locked ? (
          <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-2">
            <span className="text-lg leading-none">+</span> {actionButton.label}
          </span>
        ) : (
          <>
            <div className="flex items-center gap-2.5 min-w-0 mr-2">
              {Icon ? (
                renderSelectIcon(Icon)
              ) : selectedOption?.icon ? (
                renderSelectIcon(selectedOption.icon)
              ) : null}
              <span className={`truncate ${!selectedOption ? 'text-slate-400 dark:text-slate-500 font-normal' : ''}`}>
                {selectedOption?.label || label || 'Select'}
              </span>
            </div>
            {locked ? (
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            ) : (
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            )}
          </>
        )}
      </button>

      {mounted && createPortal(dropdownContent, document.body)}
    </div>
  );
}
