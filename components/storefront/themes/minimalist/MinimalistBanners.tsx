'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { bannersApi } from '@/lib/services';
import { useThemeCustomizations } from '@/components/storefront/theme-provider';

export function MinimalistBanners({ domain = '' }) {
  const [banners, setBanners] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { customizations } = useThemeCustomizations();
  const heroData = customizations.pageData?.hero;

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await bannersApi.publicList(domain);
        setBanners(res.data);
      } catch (error) {
        console.error('Failed to load banners', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (domain) {
      fetchBanners();
    }
  }, [domain]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (isLoading) {
    return (
      <div className="w-full h-96 bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
        <span className="text-slate-400">Loading...</span>
      </div>
    );
  }

  if (banners.length === 0) {
    // Fallback to default hero if no banners
    return (
      <div className="relative bg-background overflow-hidden border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32 pt-20">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl">
                  {heroData?.title ? (
                    <span className="block xl:inline">{heroData.title}</span>
                  ) : (
                    <>
                      <span className="block xl:inline">Welcome to</span>{' '}
                      <span className="block text-muted-foreground xl:inline">our store</span>
                    </>
                  )}
                </h1>
                <p className="mt-3 text-base text-muted-foreground sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0 whitespace-pre-wrap">
                  {heroData?.subtitle || 'Discover our curated collection of essential pieces designed for modern living. Quality materials, timeless design, and unmatched comfort.'}
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <Link
                      href={`/s/${domain}${heroData?.buttonLink?.startsWith('/') ? heroData.buttonLink : '/shop'}`}
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      {heroData?.buttonText || 'Shop Now'}
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  const nextBanner = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative bg-background overflow-hidden border-b border-border min-h-[500px]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0 lg:h-[80vh] gap-8 lg:gap-16">
        {/* Left Side: Text and Buttons */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center relative z-10 py-10 lg:py-20 text-left">
          <h1 className="text-4xl tracking-tight font-extrabold text-foreground sm:text-5xl md:text-6xl mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {currentBanner.title}
          </h1>
          {currentBanner.subtitle && (
            <p className="mt-3 text-lg sm:text-xl md:text-2xl mb-8 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
              {currentBanner.subtitle}
            </p>
          )}
          {currentBanner.ctaText && (
            <div className="mt-5 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <Link
                href={currentBanner.ctaLink || `/s/${domain}/shop`}
                className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-foreground bg-primary hover:opacity-90 md:py-4 md:text-lg md:px-10 transition-colors shadow-lg"
              >
                {currentBanner.ctaText}
              </Link>
            </div>
          )}
        </div>

        {/* Right Side: Image */}
        <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-[90%] relative overflow-hidden rounded-2xl shadow-xl">
           <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
          />
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-200/50 hover:bg-slate-300/80 text-foreground transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-200/50 hover:bg-slate-300/80 text-foreground transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentIndex ? 'bg-primary w-8' : 'bg-primary/30 hover:bg-primary/60'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
