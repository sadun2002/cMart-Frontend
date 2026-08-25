'use client';

import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';
import { Download, Monitor, Smartphone, Apple, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/auth-store';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { API_BASE_URL } from '@/lib/constants';

export default function DownloadsPage() {
  const { user, isLoading } = useAuthStore();
  const isLoggedIn = !!user && !isLoading;
  const [latestWinRelease, setLatestWinRelease] = useState<any>(null);
  const [loadingRelease, setLoadingRelease] = useState(true);
  
  useEffect(() => {
    const fetchLatestRelease = async () => {
      try {
        const res: any = await api.get('/api/releases/latest/windows/x86_64/0.0.0');
        // Because Axios interceptor returns response.data, and the API no longer wraps it in {data: ...}
        const releaseData = res.data || res;
        if (releaseData && releaseData.version) {
          setLatestWinRelease(releaseData);
        }
      } catch (error) {
        console.error('Failed to fetch latest release', error);
      } finally {
        setLoadingRelease(false);
      }
    };
    fetchLatestRelease();
  }, []);

  const getDashboardUrl = () => {
    if (!user) return '/register';
    if (user.type === 'super_admin' || user.adminRole) return '/admin/dashboard';
    if (user.role === 'STORE_OWNER') {
      return user.tenant?.active === false ? '/pending' : '/owner/dashboard';
    }
    return '/employee/dashboard';
  };

  const osOptions = [
    {
      id: 'windows',
      name: 'Windows',
      icon: <Monitor className="w-12 h-12" />,
      version: latestWinRelease ? `v${latestWinRelease.version}` : 'v0.1.0',
      description: 'The complete cMart experience for Windows 10 & 11. Optimized for POS hardware.',
      features: ['Offline mode support', 'Receipt printer integration', 'Barcode scanner ready'],
      buttonText: 'Download for Windows',
      fileName: 'cMart-Windows-Setup.exe',
      url: latestWinRelease ? `${API_BASE_URL}/api/releases/download/windows-x86_64` : null
    },
    {
      id: 'mac',
      name: 'macOS',
      icon: <Apple className="w-12 h-12" />,
      version: 'v0.1.0',
      description: 'Beautiful, native macOS app for Apple Silicon and Intel Macs.',
      features: ['Native performance', 'Dark mode support', 'Seamless sync'],
      buttonText: 'Download for macOS',
      fileName: 'cMart-macOS-v2.1.0.dmg'
    },
    {
      id: 'mobile',
      name: 'Mobile App',
      icon: <Smartphone className="w-12 h-12" />,
      version: 'v1.5.2',
      description: 'Manage your store on the go. Available for iOS and Android devices.',
      features: ['Real-time notifications', 'Quick inventory updates', 'Mobile POS capabilities'],
      buttonText: 'Get the Mobile App',
      fileName: '#'
    }
  ];

  return (
    <div className="font-sans min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 relative">
      <MotionBlurBackground />
      <SiteHeader />
      
      <main className="pt-32 pb-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
              Download <span className="text-blue-600 dark:text-blue-500">cMart</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-slate-400">
              Get the cMart app for your device and start managing your store faster and easier. 
              Our desktop apps are optimized for speed and point-of-sale hardware.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {osOptions.map((os) => (
              <div 
                key={os.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 lg:p-8 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-none flex flex-col hover:-translate-y-1 transition-transform duration-300"
              >
                <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6">
                  {os.icon}
                </div>
                
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">{os.name}</h2>
                  <span className="px-2.5 py-1 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 text-xs font-semibold rounded-full">
                    {os.version}
                  </span>
                </div>
                
                <p className="text-gray-500 dark:text-slate-400 text-xs lg:text-sm mb-6 flex-1">
                  {os.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {os.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs lg:text-sm text-gray-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-500 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {os.id === 'windows' && loadingRelease ? (
                  <button disabled className="w-full py-3 lg:py-3.5 px-2 lg:px-4 bg-blue-600/50 text-white font-semibold rounded-xl text-xs lg:text-sm flex items-center justify-center gap-1 lg:gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking for updates...
                  </button>
                ) : (os as any).url ? (
                  <a 
                    href={(os as any).url}
                    download
                    className="w-full py-3 lg:py-3.5 px-2 lg:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs lg:text-sm transition-all flex items-center justify-center gap-1 lg:gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {os.buttonText}
                  </a>
                ) : (
                  <button 
                    onClick={() => toast.info(`${os.name} version coming soon!`)}
                    className="w-full py-3 lg:py-3.5 px-2 lg:px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs lg:text-sm transition-all flex items-center justify-center gap-1 lg:gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {os.buttonText}
                  </button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-20 text-center bg-gradient-to-r from-blue-700 to-blue-600 rounded-[2rem] p-8 lg:p-16 shadow-2xl shadow-blue-900/20 max-w-5xl mx-auto">
            <h3 className="text-3xl font-black text-white mb-6">
              Looking for the web version?
            </h3>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              You don't have to download anything to use cMart. Our web dashboard has all the features you need and works perfectly on any browser.
            </p>
            <Link 
              href={getDashboardUrl()} 
              className="inline-flex items-center justify-center px-10 py-4 bg-white text-blue-600 font-bold rounded-xl text-base hover:bg-blue-50 transition-colors shadow-lg"
            >
              Open Web Dashboard
            </Link>
          </div>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
}
