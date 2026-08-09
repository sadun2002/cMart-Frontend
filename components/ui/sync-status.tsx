'use client';

import { useState } from 'react';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

export function SyncStatus() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSynced, setIsSynced] = useState(true);

  // Mock sync action
  const handleSync = () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setIsSynced(false);
    setTimeout(() => {
      setIsSyncing(false);
      setIsSynced(true);
    }, 2000);
  };

  return (
    <button
      onClick={handleSync}
      className={`p-2 rounded-full transition-colors flex items-center justify-center ${
        isSyncing
          ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : isSynced
          ? 'text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          : 'text-amber-500 bg-amber-50 dark:bg-amber-900/20'
      }`}
      aria-label="Sync Data"
      title={isSyncing ? 'Syncing data...' : isSynced ? 'All data synced' : 'Sync pending'}
    >
      {isSyncing ? (
        <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />
      ) : isSynced ? (
        <Cloud className="w-5 h-5" />
      ) : (
        <CloudOff className="w-5 h-5" />
      )}
    </button>
  );
}
