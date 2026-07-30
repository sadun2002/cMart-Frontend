import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel, 
  type = 'danger',
  isLoading = false
}: ConfirmDialogProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 w-full max-w-sm pointer-events-auto flex flex-col gap-5"
            >
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-2xl flex-shrink-0 ${
                  type === 'danger' ? 'bg-red-50 text-red-600 dark:bg-red-500/10' : 
                  type === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' :
                  'bg-blue-50 text-blue-600 dark:bg-blue-500/10'
                }`}>
                  {type === 'info' ? <Info className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">{message}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-2">
                <button 
                  onClick={onCancel} 
                  className="flex-1 py-3 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  {cancelText}
                </button>
                <button 
                  onClick={onConfirm} 
                  disabled={isLoading}
                  className={`flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:-translate-y-0.5 active:translate-y-0'
                  } ${
                    type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 
                    type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20' :
                    'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                  }`}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                  {confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
