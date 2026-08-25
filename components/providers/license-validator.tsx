'use client';

import { useEffect, useState } from 'react';
import { getHardwareFingerprint } from '@/lib/hardware-fingerprint';
import { 
  initLocalDb, 
  getLastSyncDate, 
  setLastSyncDate, 
  isTauriEnv,
  getSubscriptionEndDate,
  setSubscriptionEndDate,
  getLastSeenTimestamp,
  setLastSeenTimestamp
} from '@/lib/local-db';
import { useAuthStore } from '@/lib/auth-store';
import { WifiOff, Lock, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

export function LicenseValidator({ children }: { children: React.ReactNode }) {
  const [offlineDays, setOfflineDays] = useState<number>(0);
  const [expiryDaysLeft, setExpiryDaysLeft] = useState<number | null>(null);
  const [isLockedOffline, setIsLockedOffline] = useState(false);
  const [isLockedExpired, setIsLockedExpired] = useState(false);
  const [isLockedTampered, setIsLockedTampered] = useState(false);
  
  const { accessToken, user, logout } = useAuthStore(); // We only sync if there is a logged in user

  useEffect(() => {
    if (!isTauriEnv()) return;
    
    // Initialize DB on start
    initLocalDb().catch(console.error);

    const checkSyncAndSecurity = async () => {
      // 1. Clock Rollback Protection
      const now = Date.now();
      const lastSeen = await getLastSeenTimestamp();
      
      if (lastSeen && now < lastSeen) {
        // Current time is older than last seen time. Clock was tampered with!
        setIsLockedTampered(true);
        return;
      }
      // Update last seen securely
      await setLastSeenTimestamp(now);

      // Offline checks and expiry checks
      if (!accessToken) return; // Only sync if logged in

      try {
        const fingerprint = await getHardwareFingerprint();

        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/v1/auth/sync-device`,
          { fingerprint },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        // Success! Update local DB with new sync date and subscription end date
        await setLastSyncDate(new Date(now));
        
        if (response.data?.subscriptionEndDate) {
          await setSubscriptionEndDate(new Date(response.data.subscriptionEndDate));
        }

        setOfflineDays(0);
        setIsLockedOffline(false);
        setIsLockedExpired(false);
        
      } catch (error: any) {
        console.error('License sync failed:', error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          toast.error(error.response.data?.message || 'Hardware mismatch detected. Account suspended.');
          logout();
          return;
        }

        // Calculate offline time
        const lastSync = await getLastSyncDate();
        if (lastSync) {
          const diffTime = Math.abs(now - lastSync.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          setOfflineDays(diffDays);

          if (diffDays >= 30) {
            setIsLockedOffline(true);
          }
        }
      }

      // Check Expiry (regardless of online/offline)
      const endDate = await getSubscriptionEndDate();
      if (endDate) {
        const diffMs = endDate.getTime() - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setExpiryDaysLeft(diffDays);

        if (diffDays <= 0) {
          setIsLockedExpired(true);
        } else {
          setIsLockedExpired(false);
        }
      }
    };

    checkSyncAndSecurity();
    
    // Check every 4 hours if app stays open
    const interval = setInterval(checkSyncAndSecurity, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken]);

  if (isLockedTampered) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <Clock className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">Security Violation Detected</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl">
          We detected an irregular system clock change. For security reasons, access has been disabled. 
          Please correct your system date and time, connect to the internet, and restart the application.
        </p>
      </div>
    );
  }

  if (isLockedExpired) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <Lock className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">Subscription Expired</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl">
          Your cMart POS subscription has expired. Please log into the portal to renew your package.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors"
        >
          I have renewed (Reload)
        </button>
      </div>
    );
  }

  if (isLockedOffline) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center">
        <WifiOff className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">License Suspended (Offline)</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl">
          Your POS system has been disconnected from the internet for more than 30 days. 
          To protect your license and sync your data, please connect to the internet and restart the application.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 font-bold rounded-lg transition-colors"
        >
          I have connected to the internet
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Offline Warning */}
      {offlineDays >= 27 && offlineDays < 30 && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 font-medium z-50 relative">
          <WifiOff className="w-5 h-5" />
          Warning: System has been offline for {offlineDays} days. Access will be locked in {30 - offlineDays} day(s). Please connect to the internet.
        </div>
      )}
      
      {/* Expiry Warning */}
      {expiryDaysLeft !== null && expiryDaysLeft > 0 && expiryDaysLeft <= 3 && (
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 font-medium z-50 relative">
          <Lock className="w-5 h-5" />
          Warning: Your subscription will expire in {expiryDaysLeft} day(s). Please renew your package soon to avoid interruption.
        </div>
      )}
      
      {children}
    </>
  );
}
