import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureName?: string;
  requiredTier?: string;
}

export function UpgradeModal({ isOpen, onClose, featureName, requiredTier = 'Pro' }: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 w-full max-w-sm pointer-events-auto flex flex-col gap-5 relative overflow-hidden"
            >
              {/* Glow effect behind */}
              <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-blue-500/10 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center text-center space-y-4 pt-4">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-2">
                  <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Premium Feature
                </h2>
                
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-[280px] mx-auto leading-relaxed">
                  {featureName ? (
                    <>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{featureName}</span> is only available on the {requiredTier} plan.
                    </>
                  ) : (
                    `This feature is only available on the ${requiredTier} plan.`
                  )}
                  <br className="my-1" />
                  Upgrade today to unlock powerful tools and cloud syncing!
                </p>
              </div>

              <div className="mt-4 flex flex-col gap-3 relative z-10">
                <Button 
                  onClick={async () => {
                    let domain = 'cmart.chathudisa.com';
                    try {
                      const envDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN;
                      domain = envDomain || 'cmart.chathudisa.com';
                    } catch(e) {}
                    
                    const fullUrl = `https://${domain}/pricing`;
                    
                    try {
                      // Import dynamically so it doesn't crash SSR or standard web browsers
                      const { open } = await import('@tauri-apps/plugin-shell');
                      await open(fullUrl);
                    } catch (error) {
                      // Fallback for standard browsers
                      window.open(fullUrl, '_blank', 'noopener,noreferrer');
                    }
                    
                    onClose();
                  }}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-300"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Upgrade to {requiredTier}
                </Button>
                <Button variant="ghost" onClick={onClose} className="w-full h-12 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium">
                  Maybe Later
                </Button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
