'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function StorefrontNavigationObserver({ domain }: { domain: string }) {
  const pathname = usePathname();

  useEffect(() => {
    // If we are inside an iframe, send the pathname to the parent window
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'STOREFRONT_ROUTE_CHANGED',
        pathname: pathname,
        domain: domain
      }, '*');
    }
  }, [pathname, domain]);

  return null;
}
