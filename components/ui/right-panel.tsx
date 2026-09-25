import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCancel?: () => void;
  onDiscard?: () => void;
  requireConfirmOnClose?: boolean;
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  
  // Footer props
  onSave?: (e?: React.FormEvent | React.MouseEvent) => void;
  formId?: string;
  saveText?: string;
  isSubmitting?: boolean;
  hideFooter?: boolean;
  footerContent?: React.ReactNode;

  // Customization
  className?: string;
}

function BaseRightPanel({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  onSave,
  formId,
  saveText = 'Save',
  isSubmitting = false,
  hideFooter = false,
  footerContent,
  className = '',
  hasBackdrop = true,
  onCancel,
  onDiscard,
  requireConfirmOnClose = false,
}: RightPanelProps & { hasBackdrop?: boolean, requireConfirmOnClose?: boolean }) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleBackdropClick = () => {
    // Accidental touch / click outside on blurred background -> prompt discard changes
    if (requireConfirmOnClose) {
      setShowDiscardConfirm(true);
    } else {
      if (onCancel) onCancel();
      else onClose();
    }
  };

  const handleDirectClose = () => {
    // Intentional close via top-right 'X' icon or bottom 'Cancel' button -> close immediately without popup
    if (onCancel) onCancel();
    else onClose();
  };

  return (
    <>
      <AnimatePresence>
      {isOpen && (
        <>
          {hasBackdrop && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleBackdropClick}
              className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            />
          )}
          <motion.div 
            initial={{ x: '100%' }} 
            animate={{ x: 0 }} 
            exit={{ x: '100%' }} 
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className={`fixed inset-y-0 w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col ${className}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between h-[89px] px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {Icon && (
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                )}
                <div className="min-w-0">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white truncate">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-slate-500 font-medium truncate whitespace-nowrap">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
              <button 
                type="button"
                onClick={handleDirectClose} 
                className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 relative panel-scrollbar">
              {children}
            </div>

            {/* Footer */}
            {!hideFooter && (
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                {footerContent ? (
                  footerContent
                ) : (
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={handleDirectClose}
                      className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type={formId ? "submit" : "button"}
                      form={formId}
                      onClick={!formId ? onSave : undefined}
                      disabled={isSubmitting} 
                      className="flex-[2] flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          {Icon && <Icon className="w-5 h-5" />}
                          {saveText}
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

      <ConfirmDialog
        isOpen={showDiscardConfirm}
        title="Discard Changes?"
        message="Are you sure you want to discard your changes? All unsaved inputs will be cleared."
        confirmText="Discard"
        cancelText="Keep Editing"
        type="warning"
        onConfirm={() => {
          setShowDiscardConfirm(false);
          if (onDiscard) onDiscard();
          if (onCancel) onCancel();
          else onClose();
        }}
        onCancel={() => setShowDiscardConfirm(false)}
      />
    </>
  );
}

export function MainRightPanel(props: RightPanelProps) {
  return (
    <BaseRightPanel
      {...props}
      requireConfirmOnClose={props.requireConfirmOnClose ?? true}
      className={`right-0 z-50 ${props.className || ''}`}
      hasBackdrop={true}
    />
  );
}

export function SecondaryRightPanel(props: RightPanelProps) {
  return (
    <BaseRightPanel
      {...props}
      requireConfirmOnClose={props.requireConfirmOnClose ?? true}
      className={`right-0 lg:right-[448px] z-[60] lg:z-40 border-r ${props.className || ''}`}
      hasBackdrop={true}
    />
  );
}
