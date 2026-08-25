"use client";

import { useEffect, useRef, useState } from "react";
import { Store, Globe, Package, Users, BarChart3, CreditCard } from "lucide-react";

export function FeatureCards() {
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

  const features = [
    { icon: Store, title: 'Point of Sale', desc: 'Fast, intuitive POS with barcode scanning, cash/card/QR payment, and thermal receipt printing.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
    { icon: Globe, title: 'Online Store', desc: 'Auto-generated e-commerce website on your own subdomain. Apply beautiful themes in one click.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
    { icon: Package, title: 'Inventory Management', desc: 'Track stock levels, get low-stock alerts, manage suppliers, and prevent stockouts automatically.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
    { icon: Users, title: 'Team Management', desc: 'Add employees with custom permissions. Track attendance, working hours, and performance.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
    { icon: BarChart3, title: 'Smart Reports', desc: 'Detailed sales, profit/loss, inventory, and employee reports with export to CSV/PDF.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
    { icon: CreditCard, title: 'Online Payments', desc: 'Accept online payments via multiple gateways like credit/debit cards, PayPal, etc.', color: 'text-blue-600', bg: 'bg-blue-100/50 dark:bg-blue-900/30', border: 'border-blue-100 dark:border-blue-900/50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div 
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
        className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-8 px-4 md:px-0 -mx-4 md:mx-0 items-stretch"
      >
        {features.map((f) => (
          <div key={f.title} className="w-full sm:w-[85vw] md:w-auto md:flex-1 snap-center shrink-0 group bg-white dark:bg-slate-900/50 rounded-[2rem] p-8 border border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-none transition-all duration-300 md:hover:-translate-y-1 h-full flex flex-col">
            <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 border ${f.border} group-hover:scale-110 transition-transform duration-300`}>
              <f.icon className="w-7 h-7" strokeWidth={2.5} />
            </div>
            <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-3 transition-colors">{f.title}</h3>
            <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed transition-colors">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
