'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/auth-store';

export function AuthLoader() {
  const pathname = usePathname();
  const loadMe = useAuthStore((state) => state.loadMe);
  const accessToken = useAuthStore((state) => state.accessToken);
  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    // Do not run background session verification on recovery or login pages
    if (
      pathname?.startsWith('/reset-password') ||
      pathname?.startsWith('/forgot-password') ||
      pathname?.startsWith('/login') ||
      pathname?.startsWith('/register')
    ) {
      return;
    }

    if (accessToken && attemptedTokenRef.current !== accessToken) {
      attemptedTokenRef.current = accessToken;

      // If client is explicitly offline, skip network loadMe and preserve cached offline session
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log('[AuthLoader] Offline mode detected, using cached credentials');
        return;
      }

      loadMe();
    }
  }, [accessToken, loadMe, pathname]);

  // Listen to online events to automatically refresh auth when connection is restored
  useEffect(() => {
    const handleOnline = () => {
      if (
        pathname?.startsWith('/reset-password') ||
        pathname?.startsWith('/forgot-password') ||
        pathname?.startsWith('/login') ||
        pathname?.startsWith('/register')
      ) {
        return;
      }

      if (accessToken) {
        console.log('[AuthLoader] Connection restored, validating session');
        loadMe();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [accessToken, loadMe, pathname]);

  return null;
}
