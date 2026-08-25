"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingCart,
  Globe,
  Package,
  BarChart3,
  Palette,
  Users,
  Check
} from 'lucide-react';
import { COMPANY_NAME } from '@/lib/constants';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { MotionBlurBackground } from '@/components/ui/motion-blur-background';

const SERVICES = [
  {
    title: "Point of Sale System",
    icon: ShoppingCart,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-900/30",
    description: "Lightning-fast billing, barcode scanning, and inventory management for your physical store.",
    features: [
      "Process sales in seconds",
      "Barcode scanner support",
      "Cash & card payments",
      "Thermal printer support"
    ]
  },
  {
    title: "E-Commerce Storefront",
    icon: Globe,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-900/30",
    description: "Take your business online with a beautiful, mobile-friendly e-commerce website built in minutes.",
    features: [
      "Custom domain support",
      "Secure online checkout",
      "Mobile-optimized design",
      "SEO friendly infrastructure"
    ]
  },
  {
    title: "Inventory Management",
    icon: Package,
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-100 dark:bg-purple-900/30",
    description: "Never run out of stock. Track your products across multiple locations in real-time.",
    features: [
      "Low stock alerts",
      "Multi-location syncing",
      "Supplier management",
      "Bulk import & export"
    ]
  },
  {
    title: "Analytics & Reports",
    icon: BarChart3,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-900/30",
    description: "Make data-driven decisions with detailed insights into your sales, staff, and customers.",
    features: [
      "Real-time sales dashboard",
      "Best-selling product metrics",
      "Staff performance tracking",
      "Custom date range filters"
    ]
  },
  {
    title: "Custom Themes",
    icon: Palette,
    color: "text-rose-600 dark:text-rose-400",
    bgColor: "bg-rose-100 dark:bg-rose-900/30",
    description: "Stand out from the crowd with our extensive library of professionally designed templates.",
    features: [
      "Powerful Theme Editor",
      "One-click theme switching",
      "Custom CSS support",
      "Industry-specific layouts"
    ]
  },
  {
    title: "Customer Management",
    icon: Users,
    color: "text-cyan-600 dark:text-cyan-400",
    bgColor: "bg-cyan-100 dark:bg-cyan-900/30",
    description: "Build lasting relationships with built-in loyalty programs and customer profiles.",
    features: [
      "Customer purchase history",
      "Points & rewards system",
      "Store credit management",
      "Targeted SMS & Email"
    ]
  }
];

export default function ServicesPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Only auto-scroll on mobile devices
    if (window.innerWidth >= 768) return;
    if (isPaused) return;

    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        // If reached the end, scroll back to start
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // Scroll by one card width (100vw)
          const scrollAmount = window.innerWidth;
          scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans text-gray-900 dark:text-white transition-colors relative">
      <MotionBlurBackground />
      {/* Navigation */}
      <SiteHeader />

      {/* HERO SECTION */}
      <section className="border-b border-gray-200 dark:border-slate-800 pt-24 pb-20 px-6 relative z-10 bg-transparent">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full font-bold text-sm mb-6 border border-blue-100 dark:border-blue-800/30 shadow-sm">
            Platform Capabilities
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            Everything Your Business Needs
          </h1>
          <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            One platform. Every tool. Unlimited possibilities. Whether you sell in-person, online, or both, we have you covered.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/register" className="w-full sm:w-auto inline-flex justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors shadow-lg shadow-blue-600/30 dark:shadow-none">
              Get Started Now
            </Link>
            <Link href="/pricing" className="w-full sm:w-auto inline-flex justify-center bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-slate-800 font-bold py-4 px-8 rounded-xl transition-colors">
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 relative z-10 bg-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div 
            ref={scrollContainerRef}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 md:px-0 -mx-4 md:mx-0 items-stretch"
          >
            {SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <div 
                  key={index} 
                  className="w-full sm:w-[85vw] md:w-auto shrink-0 snap-center bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-gray-200 dark:border-slate-800 hover:shadow-2xl dark:hover:shadow-blue-900/10 md:hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-sm dark:shadow-none"
                >
                  <div className={`w-16 h-16 rounded-2xl ${service.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-sm dark:shadow-none`}>
                    <Icon className={`w-8 h-8 ${service.color}`} />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-3 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  
                  <div className="mt-auto">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-slate-200 uppercase tracking-wider mb-4 pb-4 border-b border-gray-100 dark:border-slate-800">
                      Core Features
                    </h4>
                    <ul className="space-y-3">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <div className={`mt-0.5 rounded-full p-0.5 ${service.bgColor}`}>
                            <Check className={`w-3.5 h-3.5 ${service.color}`} strokeWidth={3} />
                          </div>
                          <span className="text-gray-600 dark:text-slate-400 font-medium text-sm leading-tight">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 bg-blue-600 dark:bg-blue-900/20 text-white transition-colors relative overflow-hidden dark:border-y dark:border-slate-800">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 dark:opacity-5"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl font-black mb-6 text-white dark:text-blue-400">Ready to transform your business?</h2>
          <p className="text-blue-100 dark:text-blue-200 text-xl mb-10 max-w-2xl mx-auto">
            Join 500+ other stores using {COMPANY_NAME} to streamline operations and grow revenue.
          </p>
          <Link href="/contact" className="inline-block bg-white dark:bg-blue-600 text-blue-600 dark:text-white hover:bg-gray-50 dark:hover:bg-blue-700 font-bold py-4 px-10 rounded-xl transition-transform hover:scale-105 shadow-xl dark:shadow-none">
            Contact Us
          </Link>
        </div>
      </section>

      {/* GLOBAL FOOTER */}
      <SiteFooter />
    </div>
  );
}
