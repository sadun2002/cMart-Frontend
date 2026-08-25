"use client";

import { X, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

interface MinimalistConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  isDestructive?: boolean;
}

export function MinimalistConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  isDestructive = true,
}: MinimalistConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in" 
        onClick={onClose}
      />
      
      <div className="fixed left-[50%] top-[50%] z-[100] grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg sm:rounded-lg animate-in zoom-in-95 duration-200">
        <div className="flex flex-col space-y-2 text-center sm:text-left">
          <div className="flex items-center gap-3">
            {isDestructive && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            )}
            <h2 className="text-lg font-semibold text-foreground tracking-tight">
              {title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            {message}
          </p>
        </div>
        
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="mt-2 sm:mt-0 px-4 py-2 border border-input shadow-sm text-sm font-medium rounded-md text-foreground bg-background hover:bg-muted focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
              isDestructive 
                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white" 
                : "bg-primary hover:bg-primary/90 focus:ring-primary text-primary-foreground"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </>
  );
}
