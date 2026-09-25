import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ValidationErrorTooltipProps {
  error: { field: string; message: string } | null;
  fieldId: string;
  position?: 'top' | 'bottom';
}

export function ValidationErrorTooltip({ error, fieldId, position = 'top' }: ValidationErrorTooltipProps) {
  if (error?.field !== fieldId) return null;
  
  const isTop = position === 'top';
  
  return (
    <div className={`absolute z-[100] ${isTop ? 'bottom-[calc(100%+8px)] slide-in-from-bottom-2' : 'top-[calc(100%+8px)] slide-in-from-top-2'} left-4 animate-in fade-in duration-200 pointer-events-none`}>
      <div className="bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl shadow-red-500/20 relative flex items-center gap-1.5 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
        {error.message}
        <div className={`absolute w-2 h-2 bg-red-600 rotate-45 ${isTop ? '-bottom-1' : '-top-1'} left-4 rounded-sm`}></div>
      </div>
    </div>
  );
}
