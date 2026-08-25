'use client';

import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';

export function GlobalToaster() {
  const pathname = usePathname();
  // Check if we are in the storefront domain
  const isStorefront = pathname?.startsWith('/s/');

  return (
    <Toaster 
      position={isStorefront ? 'bottom-center' : 'top-center'} 
      richColors={!isStorefront} 
    />
  );
}
