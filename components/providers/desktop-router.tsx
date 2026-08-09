'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const WEBSITE_ROUTES = ['/', '/pricing', '/about', '/contact', '/themes', '/services', '/blog'];

export function DesktopRouter({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Detect Tauri environment
    const isTauri = typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__ !== undefined;

    if (isTauri) {
      document.body.classList.add('is-desktop-app');
      
      // If user is on a website route, redirect to splash
      if (WEBSITE_ROUTES.includes(pathname)) {
        router.replace('/splash');
      }
    }
  }, [pathname, router]);

  return <>{children}</>;
}
