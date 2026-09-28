'use client';

import React from 'react';
import { Check, X } from 'lucide-react';
import { validatePassword, PASSWORD_REQUIREMENTS } from '@/lib/password-validator';

interface PasswordRequirementsProps {
  password?: string;
  showWhenEmpty?: boolean;
  className?: string;
}

export function PasswordRequirements({
  password = '',
  showWhenEmpty = false,
  className = '',
}: PasswordRequirementsProps) {
  if (!password && !showWhenEmpty) {
    return null;
  }

  const { rules, score, strength, strengthColor, strengthLabel } = validatePassword(password);

  return (
    <div className={`mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 text-xs transition-all ${className}`}>
      {/* Strength indicator bar */}
      <div className="mb-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-semibold text-slate-600 dark:text-slate-300 text-[11px] uppercase tracking-wider">
            Password Strength
          </span>
          <span className={`font-bold text-[11px] ${
            strength === 'strong' ? 'text-emerald-600 dark:text-emerald-400' :
            strength === 'good' ? 'text-blue-600 dark:text-blue-400' :
            strength === 'fair' ? 'text-amber-600 dark:text-amber-400' :
            'text-red-500 dark:text-red-400'
          }`}>
            {password ? strengthLabel : 'Not entered'}
          </span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 h-1.5 w-full">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={`h-full rounded-full transition-all duration-300 ${
                score >= level ? strengthColor : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Rules checklist */}
      <div className="space-y-1.5 pt-1">
        {PASSWORD_REQUIREMENTS.map((req) => {
          const isMet = rules[req.id as keyof typeof rules];
          return (
            <div
              key={req.id}
              className={`flex items-center gap-2 transition-colors ${
                isMet
                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                  isMet
                    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-slate-200/70 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500'
                }`}
              >
                {isMet ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <X className="w-2.5 h-2.5" />}
              </div>
              <span className="text-[12px]">{req.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
