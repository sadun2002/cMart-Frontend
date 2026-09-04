'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Sparkles, ArrowRight, Clock, Loader2, RefreshCcw } from 'lucide-react';

interface UpdateNotificationProps {
  isOpen: boolean;
  currentVersion: string;
  newVersion: string;
  releaseNotes: string;
  downloadProgress: number; // 0 to 100, or -1 if not downloading
  laterCount: number; // How many times user has clicked "Later"
  isDownloading: boolean;
  isDownloaded?: boolean;
  onUpdate: () => void;
  onLater: () => void;
  onRestartNow?: () => void;
  onRestartLater?: () => void;
}

export function UpdateNotification({
  isOpen,
  currentVersion,
  newVersion,
  releaseNotes,
  downloadProgress,
  laterCount,
  isDownloading,
  isDownloaded = false,
  onUpdate,
  onLater,
  onRestartNow,
  onRestartLater,
}: UpdateNotificationProps) {
  // Parse release notes into bullet points
  const noteLines = releaseNotes
    ? releaseNotes.split('\n').filter((l) => l.trim().length > 0)
    : ['Bug fixes and performance improvements.'];

  // User is forced to update on the 4th time (laterCount >= 3)
  const isForceUpdate = laterCount >= 3;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            onClick={!isForceUpdate && !isDownloading && !isDownloaded ? onLater : undefined}
          />

          {/* Popup Card */}
          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.88, y: 32 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none"
          >
            <div className="pointer-events-auto w-[420px] rounded-2xl shadow-2xl overflow-hidden border border-white/10">
              {/* Header gradient */}
              <div
                className="relative px-6 pt-6 pb-5"
                style={{
                  background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f2d4a 100%)',
                }}
              >
                {/* Close button - hidden if forced update, downloading, or downloaded */}
                {!isForceUpdate && !isDownloading && !isDownloaded && (
                  <button
                    onClick={onLater}
                    className="absolute top-4 right-4 p-1.5 rounded-full text-white/40 hover:text-white/80 hover:bg-white/10 transition-all"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Icon + Title */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                    {isDownloading ? (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    ) : (
                      <Sparkles className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-blue-300 uppercase mb-0.5">
                      {isDownloaded
                        ? 'Update Ready'
                        : isForceUpdate
                        ? 'Mandatory Update'
                        : 'New Update Available'}
                    </p>
                    <h2 className="text-2xl font-bold text-white leading-tight">
                      cMart POS <span className="text-blue-300">v{newVersion}</span>
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-xs text-white/40 line-through">v{currentVersion}</span>
                      <ArrowRight className="w-3 h-3 text-white/30" />
                      <span className="text-xs text-emerald-400 font-semibold">v{newVersion}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white dark:bg-gray-900 px-6 py-5">
                {/* Release notes */}
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
                  What&apos;s new
                </p>
                <ul className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-1">
                  {noteLines.map((note, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                      <span className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-blue-500" />
                      <span>{note.replace(/^[-•*]\s*/, '')}</span>
                    </li>
                  ))}
                </ul>

                {/* Progress Bar or Action Buttons */}
                {isDownloading ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
                      <span>Downloading update...</span>
                      <span>{Math.round(downloadProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${downloadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-center text-gray-400 mt-2">
                      Please don't close the app. It will restart automatically.
                    </p>
                  </div>
                ) : isDownloaded ? (
                  <div className="flex gap-3">
                    <button
                      onClick={onRestartLater}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                    >
                      <Clock className="w-4 h-4" />
                      Restart Later
                    </button>
                    <button
                      onClick={onRestartNow}
                      className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-emerald-500/25 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      }}
                    >
                      <RefreshCcw className="w-4 h-4" />
                      Restart Now
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    {!isForceUpdate && (
                      <button
                        onClick={onLater}
                        className="flex-1 whitespace-nowrap flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                      >
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>Later ({3 - laterCount})</span>
                      </button>
                    )}
                    <button
                      onClick={onUpdate}
                      className="flex-[2] flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Update Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
