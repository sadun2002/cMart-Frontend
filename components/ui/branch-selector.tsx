'use client';

import { useState, useRef, useEffect } from 'react';
import { useBranchStore } from '@/lib/branch-store';
import { ChevronDown, Check } from 'lucide-react';
import { useAuthStore } from '@/lib/auth-store';

export function BranchSelector() {
  const { branches, activeBranchId, setActiveBranch, getActiveBranch } = useBranchStore();
  const { user } = useAuthStore();
  const userRole = user?.role;
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeBranch = getActiveBranch();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!activeBranch) return null;

  // Only STORE_OWNER can switch branches.
  const canSwitch = userRole === 'STORE_OWNER';

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <span className="text-xl font-black text-slate-400 dark:text-slate-500 mx-2">-</span>
      <button
        onClick={() => canSwitch && setIsOpen(!isOpen)}
        disabled={!canSwitch}
        className={`flex items-center gap-1.5 transition-colors text-xl font-black ${
          canSwitch 
            ? 'text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer' 
            : 'text-slate-900 dark:text-white cursor-default'
        }`}
      >
        <span>{activeBranch.name}</span>
        {canSwitch && (
          <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
        )}
      </button>

      {isOpen && canSwitch && (
        <div className="absolute top-[calc(100%+8px)] left-0 mt-1 w-[240px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50 py-2 animate-in fade-in slide-in-from-top-2">
          <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
            <p className="text-xs font-bold text-slate-500 uppercase">Select Branch</p>
          </div>
          {branches.map((branch) => (
            <button
              key={branch.id}
              onClick={() => {
                setActiveBranch(branch.id);
                setIsOpen(false);
              }}
              className="w-full text-left flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${activeBranchId === branch.id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>
                  {branch.name}
                </span>
                <span className="text-xs text-slate-500 truncate max-w-[150px]">
                  {branch.location}
                </span>
              </div>
              {activeBranchId === branch.id && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
