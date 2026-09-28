'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
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
import { getSubscriptionStatus } from '@/lib/subscription-utils';
import { PLATFORM_DOMAIN } from '@/lib/constants';
import { WifiOff, Lock, Clock, LogOut, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';

export function LicenseValidator({ children }: { children: React.ReactNode }) {
  const [offlineDays, setOfflineDays] = useState<number>(0);
  const [expiryDaysLeft, setExpiryDaysLeft] = useState<number | null>(null);
  const [isLockedOffline, setIsLockedOffline] = useState(false);
  const [isLockedExpired, setIsLockedExpired] = useState(false);
  const [isLockedTampered, setIsLockedTampered] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  
  const pathname = usePathname();
  const { accessToken, user, logout, loadMe } = useAuthStore();
  const subStatus = getSubscriptionStatus(user);

  // Exempt routes allow expired users to access pricing, checkout, login, or public marketing pages
  const isExemptRoute = Boolean(
    pathname === '/' ||
    pathname?.startsWith('/pricing') ||
    pathname?.startsWith('/checkout') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/forgot-password') ||
    pathname?.startsWith('/reset-password') ||
    pathname?.startsWith('/terms') ||
    pathname?.startsWith('/privacy') ||
    pathname?.startsWith('/about') ||
    pathname?.startsWith('/contact') ||
    pathname?.startsWith('/services') ||
    pathname?.startsWith('/careers') ||
    pathname?.startsWith('/blog') ||
    pathname?.startsWith('/documentation') ||
    pathname?.startsWith('/help-center') ||
    pathname?.startsWith('/download')
  );

  const handleOpenPortal = async () => {
    let domain = PLATFORM_DOMAIN || 'cmart.chathudisa.com';
    try {
      const envDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN;
      if (envDomain) domain = envDomain;
    } catch (e) {}

    const isTauri = isTauriEnv();
    const fullUrl = `https://${domain}/pricing`;

    if (isTauri) {
      try {
        const { open } = await import('@tauri-apps/plugin-shell');
        await open(fullUrl);
      } catch (error) {
        console.error('Failed to open shell in Tauri, falling back to window.open:', error);
        window.open(fullUrl, '_blank', 'noopener,noreferrer');
      }
    } else {
      // In web browser: open a new browser tab with /pricing
      window.open('/pricing', '_blank');
    }
  };

  // 1. Unified Subscription Status Check (Applies to both Web and Desktop)
  useEffect(() => {
    if (!accessToken || !user) {
      setIsLockedExpired(false);
      setExpiryDaysLeft(null);
      return;
    }

    if (subStatus.isExpired) {
      setIsLockedExpired(true);
      setExpiryDaysLeft(0);
    } else {
      setIsLockedExpired(false);
      setExpiryDaysLeft(subStatus.daysLeft);
    }
  }, [accessToken, user, subStatus.isExpired, subStatus.daysLeft]);

  // Auto-verify subscription in background on startup if online and user appears expired
  useEffect(() => {
    if (accessToken && subStatus.isExpired && typeof navigator !== 'undefined' && navigator.onLine) {
      loadMe().catch(() => {});
    }
  }, [accessToken, subStatus.isExpired, loadMe]);

  // 2. Tauri-specific Offline Security, Hardware Fingerprinting, and Clock Rollback Protection
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

        // Use api instance to inherit interceptors (automatic token refresh)
        const response: any = await api.post('/auth/sync-device', { fingerprint });
        const syncData = response?.data || response;

        // Success! Update local DB with new sync date and subscription end date
        await setLastSyncDate(new Date(now));
        
        if (syncData?.subscriptionEndDate) {
          await setSubscriptionEndDate(new Date(syncData.subscriptionEndDate));
        } else if (syncData?.isExpired === false) {
          // If active with no specific end date, clear stale expired date from SQLite
          await setSubscriptionEndDate(null);
        }

        setOfflineDays(0);
        setIsLockedOffline(false);
        
        if (syncData?.isExpired) {
          setIsLockedExpired(true);
          setExpiryDaysLeft(0);
          return;
        } else {
          setIsLockedExpired(false);
        }
        
      } catch (error: any) {
        console.warn('License sync failed/offline:', error?.message);
        
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

      // Check Expiry in local SQLite (fallback for offline mode)
      const endDate = await getSubscriptionEndDate();
      if (endDate) {
        const diffMs = endDate.getTime() - now;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        setExpiryDaysLeft(diffDays);

        if (diffDays <= 0) {
          // If local SQLite has an expired date, but user store in memory is ACTIVE,
          // then the SQLite date is stale from before renewal! Sync SQLite instead of locking.
          if (!subStatus.isExpired && user?.tenant) {
            if (subStatus.endDate) {
              await setSubscriptionEndDate(subStatus.endDate);
            } else {
              await setSubscriptionEndDate(null);
            }
            setIsLockedExpired(false);
          } else {
            setIsLockedExpired(true);
          }
        } else {
          setIsLockedExpired(false);
        }
      }
    };

    checkSyncAndSecurity();
    
    // Check every 4 hours if app stays open
    const interval = setInterval(checkSyncAndSecurity, 4 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [accessToken, logout, subStatus.isExpired, user]);

  const handleRenewedReload = async () => {
    setIsVerifying(true);
    try {
      // 1. Fetch latest user profile and subscription from backend
      await loadMe();
      
      // 2. Sync device if in desktop Tauri
      if (isTauriEnv()) {
        try {
          const fingerprint = await getHardwareFingerprint();
          const response: any = await api.post('/auth/sync-device', { fingerprint });
          const syncData = response?.data || response;
          if (syncData?.subscriptionEndDate) {
            await setSubscriptionEndDate(new Date(syncData.subscriptionEndDate));
          } else if (syncData?.isExpired === false) {
            await setSubscriptionEndDate(null);
          }
        } catch (e) {
          console.warn('Sync device error during renewal check:', e);
        }
      }

      // 3. Inspect updated user in Zustand
      const updatedUser = useAuthStore.getState().user;
      const latestSubStatus = getSubscriptionStatus(updatedUser);

      if (!latestSubStatus.isExpired) {
        setIsLockedExpired(false);
        if (latestSubStatus.endDate) {
          await setSubscriptionEndDate(latestSubStatus.endDate);
        } else {
          await setSubscriptionEndDate(null);
        }
        toast.success('Subscription verified successfully! Welcome back.');
        window.location.reload();
      } else {
        toast.error('Subscription still shows as expired. Please check your payment status or contact support.');
      }
    } catch (err: any) {
      toast.error('Could not connect to server to verify subscription. Please check your internet connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLockedTampered) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center select-none">
        <Clock className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">Security Violation Detected</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl">
          We detected an irregular system clock change. For security reasons, access has been disabled. 
          Please correct your system date and time, connect to the internet, and restart the application.
        </p>
      </div>
    );
  }

  if (isLockedOffline) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center select-none">
        <WifiOff className="w-24 h-24 text-red-500 mb-6" />
        <h1 className="text-4xl font-black mb-4">License Suspended (Offline)</h1>
        <p className="text-xl text-zinc-400 mb-8 max-w-2xl">
          Your POS system has been disconnected from the internet for more than 30 days. 
          To protect your license and sync your data, please connect to the internet and restart the application.
        </p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 font-bold rounded-xl transition-all cursor-pointer text-white shadow-lg shadow-blue-600/30"
        >
          I have connected to the internet
        </button>
      </div>
    );
  }

  // If subscription is expired, lock the screen UNLESS the user is on an exempt route (e.g. /pricing, /checkout, /login)
  if (isLockedExpired && !isExemptRoute) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950 text-white p-6 text-center select-none">
        <Lock className="w-24 h-24 text-red-500 mb-6 animate-pulse" />
        <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">Subscription Expired</h1>
        <p className="text-lg sm:text-xl text-zinc-400 mb-8 max-w-2xl leading-relaxed">
          Your cMart POS subscription has expired. Please renew your package to continue accessing your store dashboard and operations.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button 
            type="button"
            disabled={isVerifying}
            onClick={handleRenewedReload}
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Verifying Subscription...
              </>
            ) : (
              'I have renewed (Reload)'
            )}
          </button>
          <button
            type="button"
            onClick={handleOpenPortal}
            className="w-full sm:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-200 hover:text-white font-bold rounded-xl transition-all cursor-pointer border border-zinc-700 hover:border-zinc-500 shadow-md"
          >
            Open Subscription Portal
          </button>
        </div>

        <button
          type="button"
          onClick={() => logout()}
          className="mt-8 text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-2 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign out of account
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Offline Warning */}
      {offlineDays >= 27 && offlineDays < 30 && !isExemptRoute && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center gap-2 font-medium z-50 relative">
          <WifiOff className="w-5 h-5" />
          Warning: System has been offline for {offlineDays} days. Access will be locked in {30 - offlineDays} day(s). Please connect to the internet.
        </div>
      )}
      
      {/* Expiry Warning */}
      {expiryDaysLeft !== null && expiryDaysLeft > 0 && expiryDaysLeft <= 3 && !isExemptRoute && (
        <div className="bg-orange-500 text-white px-4 py-2 flex items-center justify-center gap-2 font-medium z-50 relative">
          <Lock className="w-5 h-5" />
          Warning: Your subscription will expire in {expiryDaysLeft} day(s). Please renew your package soon to avoid interruption.
        </div>
      )}
      
      {children}
    </>
  );
}
