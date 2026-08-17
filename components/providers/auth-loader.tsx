'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/auth-store';

export function AuthLoader() {
  const loadMe = useAuthStore((state) => state.loadMe);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (accessToken) {
      loadMe();
    }
  }, [accessToken, loadMe]);

  return null;
}
