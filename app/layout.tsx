import type { Metadata } from 'next';
import './globals.css';
import { GlobalToaster } from '@/components/providers/global-toaster';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { FullscreenHandler } from '@/components/providers/fullscreen-handler';
import { DesktopRouter } from '@/components/providers/desktop-router';
import { AuthLoader } from '@/components/providers/auth-loader';
import { DesktopUpdater } from '@/components/providers/desktop-updater';

import { LicenseValidator } from '@/components/providers/license-validator';

export const metadata: Metadata = {
  title: {
    default: 'cMart — Smart POS & E-Commerce Platform',
    template: '%s | cMart',
  },
  description:
    'cMart is a complete POS and e-commerce platform for Sri Lankan businesses. Manage sales, inventory, employees, and your online store from one place.',
  keywords: ['POS', 'Point of Sale', 'E-commerce', 'Sri Lanka', 'Inventory', 'cMart'],
  authors: [{ name: 'cMart' }],
  openGraph: {
    title: 'cMart — Smart POS & E-Commerce Platform',
    description: 'The smart way to run your store',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@300;400;500;600;700;800;900&family=Noto+Sans+Sinhala:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <DesktopRouter>
            <LicenseValidator>
              <DesktopUpdater />
              <AuthLoader />
              <FullscreenHandler />
              {children}
              <GlobalToaster />
            </LicenseValidator>
          </DesktopRouter>
        </ThemeProvider>
      </body>
    </html>
  );
}
