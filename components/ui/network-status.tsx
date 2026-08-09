'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Initial check
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Internet Connection Restored', {
        description: 'You are back online.',
        icon: <Wifi className="w-4 h-4" />,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('No Internet Connection', {
        description: 'Check your network settings. Changes will be saved locally.',
        icon: <WifiOff className="w-4 h-4" />,
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div
      className={`p-2 rounded-full flex items-center justify-center ${
        isOnline
          ? 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10'
          : 'text-red-500 bg-red-50 dark:bg-red-500/10'
      }`}
      title={isOnline ? 'Connected to Internet' : 'Offline'}
    >
      {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
    </div>
  );
}
